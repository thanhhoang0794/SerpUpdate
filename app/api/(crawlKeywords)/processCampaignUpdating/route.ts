import { StatusCodes } from 'http-status-codes'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { CampaignUpdatingStatus } from '@/app/types/enumCampaignUpdatingStatus'
import {
  getCampaignTaskState,
  getTaskTrackingBatch,
  setCampaignTaskState,
  deleteCache,
  setTaskTrackingBatch
} from '@/utils/redis'
import { getDataForSeoTaskResults } from '@/utils/dataForSeo'
import { extractSearchResults } from '@/utils/extractCrawlResult'
import { updateKeywordsInDatabase } from '@/utils/updateKeywordHistoryNew'
import { UserData } from '../process-keywords/route'

export async function POST(request: Request) {
  const { campaignUpdatingId, countWaitingConfig } = await request.json()
  const supabase = await createClient()

  const { data: campaignUpdating, error: campaignUpdatingError } = await supabase
    .from('campaignUpdatings')
    .select('*')
    .eq('id', campaignUpdatingId)
    .single()

  if (campaignUpdatingError) {
    return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const campaignTasksData = await getCampaignTaskState(campaignUpdating.campaign_id)
  const completedTasks: string[] = Array.isArray(campaignTasksData)
    ? campaignTasksData
    : campaignTasksData
      ? [campaignTasksData]
      : []
  const waitingTasksCount = campaignUpdating.total_task - completedTasks.length
  const taskIds = await getTaskTrackingBatch(campaignUpdating.campaign_id)
  if (waitingTasksCount > 0) {
    const countWaiting = campaignUpdating.count_waiting
    if (countWaiting === countWaitingConfig) {
      const login = process.env.DATAFORSEO_LOGIN
      const password = process.env.DATAFORSEO_PASSWORD

      if (!login || !password) {
        return NextResponse.json(
          { error: 'Missing DataForSEO credentials' },
          { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
      }
      const { error: updateCampaignUpdatingError } = await supabase
        .from('campaignUpdatings')
        .update({ status: CampaignUpdatingStatus.UPDATING })
        .eq('id', campaignUpdating.id)
      if (updateCampaignUpdatingError) {
        return NextResponse.json(
          { message: 'error update campaignUpdatings database' },
          { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
      }
      const searchEngine = campaignUpdating.search_engine
      const results = await getDataForSeoTaskResults(taskIds, searchEngine)
      const completedTaskIds = results
        .filter((result: any) => result.success && result.data?.tasks?.[0]?.status_code === 20000)
        .map((result: any) => result.data?.tasks?.[0]?.id)
      if (completedTaskIds.length > 0) {
        const campaignTasksDataTotal = await getCampaignTaskState(campaignUpdating.campaign_id)
        const completedTasksTotal: string[] = Array.isArray(campaignTasksDataTotal)
          ? campaignTasksDataTotal
          : campaignTasksDataTotal
            ? [campaignTasksDataTotal]
            : []
        const taskIdsLeft = await getTaskTrackingBatch(campaignUpdating.campaign_id)
        const remainingTaskIds = taskIdsLeft.filter((id: string) => !completedTaskIds.includes(id))
        const taskIdsHaveNotAdded = completedTaskIds.filter((id: string) => !completedTasksTotal.includes(id))
        const updatedCompletedTasks = [...completedTasksTotal, ...taskIdsHaveNotAdded]
        await setTaskTrackingBatch(campaignUpdating.campaign_id, remainingTaskIds)
        await setCampaignTaskState(campaignUpdating.campaign_id, updatedCompletedTasks)
        if (updatedCompletedTasks.length === campaignUpdating.total_task || remainingTaskIds.length === 0) {
          await updateCampaign(campaignUpdating, supabase, updatedCompletedTasks)
        }
      }
      const { error: updateCampaignWaitingError } = await supabase
        .from('campaignUpdatings')
        .update({ status: CampaignUpdatingStatus.WAITING })
        .eq('id', campaignUpdating.id)
      if (updateCampaignWaitingError) {
        return NextResponse.json(
          { message: 'error update campaignUpdatings database' },
          { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
      }
    } else {
      const { error: updateCampaignUpdatingError } = await supabase
        .from('campaignUpdatings')
        .update({
          count_waiting: countWaiting + 1,
          updated_at: new Date()
        })
        .eq('id', campaignUpdating.id)
      if (updateCampaignUpdatingError) {
        return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
    }
  } else if (waitingTasksCount <= 0) {
    await updateCampaign(campaignUpdating, supabase, completedTasks)
  }
  return NextResponse.json({ message: 'Ok' }, { status: StatusCodes.OK })
}

async function updateCampaign(campaignUpdating: any, supabase: any, completedTasks: any) {
  const { error: updateCampaignUpdatingError } = await supabase
    .from('campaignUpdatings')
    .update({ status: CampaignUpdatingStatus.COMPLETED })
    .eq('id', campaignUpdating.id)
  if (updateCampaignUpdatingError) {
    return NextResponse.json(
      { message: 'error update campaignUpdatings database' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    )
  }
  const { data: campaignData, error: campaignError } = await supabase
    .from('campaigns')
    .select('*,domains!inner(*, keywords!inner(*))')
    .eq('id', campaignUpdating.campaign_id)
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
    return NextResponse.json({ error: 'Missing DataForSEO credentials' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const searchEngine = campaignData?.search_engine
  const results = await getDataForSeoTaskResults(completedTasks, searchEngine)
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
  await deleteCache(`campaign:${campaignData.id}:tasks`)
  await deleteCache(`taskTracking:${campaignData.id}`)

  const { error: updateCampaignError } = await supabase
    .from('campaigns')
    .update({ updating: false, updated_at: date, sc_data: null })
    .eq('id', campaignData.id)

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
    .eq('campaign_id', campaignData.id)
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
}
