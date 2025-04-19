import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { extractSearchResults } from '@/utils/extractCrawlResult'
import { StatusCodes } from 'http-status-codes'
import { updateKeywordsInDatabase } from '@/utils/updateKeywordHistoryNew'
import { TaskTracking } from '@/app/types/taskTracking'
import { TaskStatus } from '@/app/types/enumTaskStatus'
export async function POST(request: Request) {
  const { data, campaignId, tasks } = await request.json()
  const supabase = await createClient()
  try {
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

    const {
      data: taskTrackingProcessingList,
      count,
      error: taskTrackingError
    } = await supabase
      .from('taskTrackings')
      .select('*', { count: 'exact' })
      .eq('campaign_id', campaignId)
      .eq('status', TaskStatus.PROCESSING)
      .eq('created_at', campaignData?.sc_data)
    if (taskTrackingError) {
      return NextResponse.json({ error: taskTrackingError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const date = campaignData?.sc_data
    for (const dataItem of data) {
      const searchResults = extractSearchResults(dataItem)
      const keywordData = {
        keyword: dataItem?.tasks?.[0]?.data?.keyword,
        language_name: dataItem?.tasks?.[0]?.data?.language_name,
        device: dataItem?.tasks?.[0]?.data?.device,
        location_name: dataItem?.tasks?.[0]?.data?.location_name
      }
      const domainNames = campaignData.domains.map((domain: any) => ({
        id: domain.id,
        name: domain.domain,
        matched: false
      }))
      await updateKeywordsInDatabase(supabase, dataItem, searchResults, domainNames, keywordData, date)
    }
    const taskTrackingDoneList = taskTrackingProcessingList
      .filter((task: TaskTracking) => tasks.includes(task.task_id))
      .map((task: TaskTracking) => {
        return {
          ...task,
          status: TaskStatus.DONE
        }
      })
    if (taskTrackingDoneList.length > 0) {
      const { error: updateTaskTrackingDoneError } = await supabase.from('taskTrackings').upsert(taskTrackingDoneList)
    }
    return NextResponse.json({ message: 'success' }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Error in updateKeyword:', error)
    return NextResponse.json({ error }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
