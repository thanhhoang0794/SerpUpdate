import { TaskStatus } from '@/app/types/enumTaskStatus'
import { StatusCodes } from 'http-status-codes'
import { NextResponse } from 'next/server'
import { createDataForSeoTasks } from '@/utils/dataForSeo'
import { getTaskTrackingBatch, setTaskTrackingBatch } from '@/utils/redis'

export async function POST(request: Request) {
  try {
    const { tasks, searchEngine, campaignId } = await request.json()
    const result = await createDataForSeoTasks(tasks, searchEngine)

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: 'Failed to create task tracking' },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      )
    }

    const taskIds = result.data.map((task: any) => task.id)
    console.log('taskIds', taskIds)
    try {
      const existingTaskIds = await getTaskTrackingBatch(campaignId)
      const updatedTaskIds = existingTaskIds ? [...existingTaskIds, ...taskIds] : taskIds
      console.log('updatedTaskIds', updatedTaskIds)
      await setTaskTrackingBatch(campaignId, updatedTaskIds)
    } catch (redisError) {
      console.error('Redis error:', redisError)
      return NextResponse.json(
        { error: 'Failed to store task tracking data' },
        { status: StatusCodes.INTERNAL_SERVER_ERROR }
      )
    }

    return NextResponse.json({ message: 'success' }, { status: StatusCodes.OK })
  } catch (error) {
    console.error('Error in background task:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
