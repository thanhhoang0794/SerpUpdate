import { NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import {
  deleteCache,
  getCampaignTaskState,
  setCampaignTaskState,
  getTaskTrackingBatch,
  setTaskTrackingBatch
} from '@/utils/redis'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id') || ''
    const campaignId = searchParams.get('tag') || ''
    const campaignTasksData = await getCampaignTaskState(campaignId)
    console.log('campaignTasksData', campaignTasksData)
    let campaignTasks: string[] = Array.isArray(campaignTasksData)
      ? campaignTasksData
      : campaignTasksData
        ? [campaignTasksData]
        : []

    if (!campaignTasks.includes(taskId)) {
      campaignTasks.push(taskId)
      await setCampaignTaskState(campaignId, campaignTasks)
      const taskIds = await getTaskTrackingBatch(campaignId)
      const updatedTaskIds = taskIds.filter((id: string) => id !== taskId)
      await setTaskTrackingBatch(campaignId, updatedTaskIds)
    }

    return NextResponse.json({ message: 'OK' }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    )
  }
}
