import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { extractSearchResults } from '@/utils/extractCrawlResult'
import { updateKeywordsInDatabase } from '@/utils/updateKeywordHistoryNew'
import { getCampaignTaskState } from '@/utils/redis'
import { getDataForSeoTaskResults } from '@/utils/dataForSeo'
import { deleteCache } from '@/utils/redis'
export interface UserData {
  users: {
    email: string
    username: string
  }
}
export async function POST(request: Request) {
  try {
    const { campaignId } = await request.json()
    const supabase = await createClient()
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

    const date = campaignData?.sc_data

    const domainIds = campaignData.domains.map((domain: any) => domain.id)
    if (domainIds.length > 0) {
      const { error: updateError } = await supabase.from('domains').update({ updated_at: date }).in('id', domainIds)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
    }
    const login = process.env.DATAFORSEO_LOGIN
    const password = process.env.DATAFORSEO_PASSWORD

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Missing DataForSEO credentials' },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      )
    }

    const searchEngine = campaignData?.search_engine
    const campaignTasksData = await getCampaignTaskState(campaignId)
    const taskIds: string[] = Array.isArray(campaignTasksData)
      ? campaignTasksData
      : campaignTasksData
        ? [campaignTasksData]
        : []

    if (taskIds.length === 0) {
      return NextResponse.json({ error: 'No tasks found' }, { status: StatusCodes.NOT_FOUND })
    }
    const results = await getDataForSeoTaskResults(taskIds, searchEngine)
    console.log('results', results)
    for (const result of results) {
      if (result.success && result.data) {
        const searchResults = extractSearchResults(result.data)
        const keywordData = {
          keyword: result.data?.tasks?.[0]?.data?.keyword,
          language_name: result.data?.tasks?.[0]?.data?.language_name,
          device: result.data?.tasks?.[0]?.data?.device,
          location_name: result.data?.tasks?.[0]?.data?.location_name
        }
        const domainNames = campaignData.domains.map((domain: any) => ({
          id: domain.id,
          name: domain.domain,
          matched: false
        }))
        await updateKeywordsInDatabase(supabase, result.data, searchResults, domainNames, keywordData, date)
      }
    }

    console.log(`All tasks completed successfully. Updating campaign ${campaignId}`)
    await deleteCache(`campaign:${campaignId}:tasks`)

    const { error: updateCampaignError } = await supabase
      .from('campaigns')
      .update({ updating: false, updated_at: date, sc_data: null })
      .eq('id', campaignId)

    if (updateCampaignError) {
      console.error('Failed to update campaign status:', updateCampaignError)
      return NextResponse.json({ error: updateCampaignError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const { data: userData, error: userError } = (await supabase
      .from('campaignUsers')
      .select(
        `
          users:user_id (
            email,
            username
          )
        `
      )
      .eq('campaign_id', campaignId)
      .eq('is_creator', true)
      .single()) as { data: UserData | null; error: any }

    if (userError || !userData) {
      return NextResponse.json(
        { error: userError?.message || 'No user found' },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      )
    }

    const data = {
      username: userData.users.username,
      campaignName: campaignData.name,
      mailTo: userData.users.email
    }

    const response = await fetch(`https://n8n.udt.group/webhook/7843dc4b-47c6-4f9d-a011-3ada09ce8bf1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return NextResponse.json({ message: 'success' })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
