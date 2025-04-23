import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { NextRequest } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { CampaignUpdating } from '@/app/types/campaignUpdating'
import { CampaignUpdatingStatus } from '@/app/types/enumCampaignUpdatingStatus'
import { Domain } from '@/app/types/domains'
import { DomainType } from '@/app/types/domainType'
import { Keyword } from '@/app/types/keywords'
import {
  Language,
  languageBaiduList,
  languageBingList,
  languageGoogleList,
  languageSeznamList,
  languageYahooList
} from '@/app/constant/languageList'
import { deleteCache, setTaskTrackingBatch } from '@/utils/redis'
import { cloneDeep } from 'lodash'
import {
  locationGoogleList,
  Location,
  locationBaiduList,
  locationSeznamList,
  locationBingList,
  locationYahooList
} from '@/app/constant/countryList'
import { SearchEngine } from '@/app/types/enumSearchEngine'
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { campaignId } = await request.json()

    if (!campaignId) {
      return NextResponse.json({ error: 'Missing campaignId' }, { status: 400 })
    }

    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select('*,domains!inner(*, keywords!inner(*))')
      .eq('id', campaignId)
      .eq('domains.is_active', true)
      .eq('domains.keywords.is_active', true)
      .single()

    if (campaignError) {
      return NextResponse.json({ error: campaignError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const date = campaignData?.sc_data || new Date().toISOString()
    const domainIds = campaignData.domains.map((domain: Domain) => domain.id)
    if (domainIds.length > 0) {
      const { error: updateError } = await supabase.from('domains').update({ updated_at: date }).in('id', domainIds)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
    }
    const searchEngine = campaignData?.search_engine
    const taskChunks = splitTasksToTaskChunks(campaignData)
    const ownDomain = campaignData.domains.find((domain: Domain) => domain.domain_type === DomainType.OWN)
    const keywordIds = ownDomain.keywords.map((keyword: Keyword) => keyword.id)
    const { error: updateError } = await supabase.from('keywords').update({ updating: true }).in('id', keywordIds)

    if (updateError) {
      throw new Error(`Failed to mark keywords as updating: ${updateError.message}`)
    }
    const campaignUpdatingBodyData: CampaignUpdating = {
      campaign_id: campaignId,
      status: CampaignUpdatingStatus.WAITING,
      search_engine: searchEngine,
      total_task: keywordIds.length,
      created_at: date,
      updated_at: date
    }
    const { data: insertCampaignUpdatingData, error: insertCampaignUpdatingError } = await supabase
      .from('campaignUpdatings')
      .insert(campaignUpdatingBodyData)
      .select()
    if (insertCampaignUpdatingError) {
      return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    let languageList: Language[] = []
    let locationList: Location[] = []
    if (searchEngine === SearchEngine.GOOGLE) {
      languageList = languageGoogleList
      locationList = locationGoogleList
    } else if (searchEngine === SearchEngine.BAIDU) {
      languageList = languageBaiduList
      locationList = locationBaiduList
    } else if (searchEngine === SearchEngine.SEZNAM) {
      languageList = languageSeznamList
      locationList = locationSeznamList
    } else if (searchEngine === SearchEngine.BING) {
      languageList = languageBingList
      locationList = locationBingList
    } else if (searchEngine === SearchEngine.YAHOO) {
      languageList = languageYahooList
      locationList = locationYahooList
    } else {
      //naver don't need language & location
      locationList = locationGoogleList
      languageList = languageGoogleList
    }
    const location = locationList.find((location: Location) => location.country_iso_code === campaignData.country_code)
    const language = languageList.find((language: Language) => language.language_name === campaignData.language)
    const pingback_url = 'https://serp-update.vercel.app/api/dataforseo-callback?id=$id&tag=$tag'
    await deleteCache(`campaign:${campaignId}:tasks`)
    await deleteCache(`taskTrackingCampaign:${campaignId}`)
    for (const taskChunk of taskChunks) {
      const tasks = taskChunk.map((keyword: Keyword) => ({
        location_code: location?.location_code || 'Vietnam',
        language_code: language?.language_code || 'vi',
        keyword: keyword.keyword,
        device: keyword.device,
        priority: 1,
        pingback_url: pingback_url,
        tag: campaignId
      }))
      const data = {
        tasks,
        searchEngine,
        campaignId
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/createTaskTracking`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
        if (!response.ok) {
          const { error: UpdateCampaignUpdatingError } = await supabase
            .from('campaignUpdatings')
            .update({
              status: CampaignUpdatingStatus.ERROR,
              updated_at: date
            })
            .eq('id', insertCampaignUpdatingData[0].id)
          const { error: updateKeywordError } = await supabase
            .from('keywords')
            .update({ updating: false })
            .in('id', keywordIds)
          const { error: updateCampaignError } = await supabase
            .from('campaigns')
            .update({
              updating: false,
              updated_at: date
            })
            .eq('id', campaignId)
          if (UpdateCampaignUpdatingError) {
            throw new Error(`Failed to update campaign updating: ${UpdateCampaignUpdatingError.message}`)
          }
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError)
        throw fetchError
      }
    }
    return NextResponse.json({ message: 'success' })
  } catch (error) {
    console.error('Error in background task:', error)
  }
}

function splitTasksToTaskChunks(data: any) {
  let taskChunks = []
  const ownDomain = data.domains.find((domain: Domain) => domain.domain_type === DomainType.OWN)
  const keywords = ownDomain.keywords
  for (let i = 0; i < keywords.length; i += 100) {
    taskChunks.push(keywords.slice(i, i + 100))
  }
  return taskChunks
}
