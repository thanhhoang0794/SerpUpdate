import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { TaskTracking } from '@/app/types/taskTracking'
import { CampaignUpdatingStatus } from '@/app/types/enumCampaignUpdatingStatus'
import { TaskStatus } from '@/app/types/enumTaskStatus'

function splitTasksToTaskChunks(taskIdList: string[], maximumTaskTrackingReceivedList: number) {
  let taskChunks = []
  for (let i = 0; i < maximumTaskTrackingReceivedList; i += 50) {
    taskChunks.push(taskIdList.slice(i, i + 50))
  }
  return taskChunks
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: campaignUpdatingList, error: campaignUpdatingError } = await supabase
    .from('campaignUpdatings')
    .select('*')
    .eq('status', CampaignUpdatingStatus.WAITING)
  if (campaignUpdatingError) {
    return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const { data: configCountWaitingForPingback, error: configCountWaitingForPingbackError } = await supabase
    .from('configCountWaitingForPingback')
    .select('*')
    .eq('id', 1)
    .single()
  if (configCountWaitingForPingbackError) {
    return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const countWaitingConfig = configCountWaitingForPingback?.count
  if (campaignUpdatingList?.length > 0) {
    for (const campaignUpdating of campaignUpdatingList) {
      const {
        data: taskTrackingList,
        count,
        error: taskTrackingError
      } = await supabase
        .from('taskTrackings')
        .select('*', { count: 'exact' })
        .eq('campaign_id', campaignUpdating.campaign_id)
        .eq('created_at', campaignUpdating.created_at)

      if (count === null) {
        return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
      if (count > 0) {
        const totalTask = campaignUpdating.total_task || count
        if (totalTask !== count) {
          console.log('In waiting for create task done')
          return NextResponse.json({ message: 'In waiting for create task done' }, { status: StatusCodes.OK })
        }
        const taskTrackingWaitingList = taskTrackingList.filter(
          (task: TaskTracking) => task.status === TaskStatus.WAITING
        )
        if (taskTrackingWaitingList.length > 0) {
          const countWaiting = campaignUpdating.count_waiting
          if (countWaiting !== countWaitingConfig) {
            console.log(
              `still waiting for pingback couting to 8: ${countWaiting + 1}... campaign:${campaignUpdating.campaign_id}`
            )
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
          } else {
            console.log(`processing after couting to 8: campaign:${campaignUpdating.campaign_id}`)
            const taskIdList = taskTrackingWaitingList.map((task: TaskTracking) => task.task_id)
            const data = {
              campaign_id: campaignUpdating.campaign_id,
              se: campaignUpdating.search_engine,
              tasks: taskIdList
            }
            const response = await fetch('https://n8n.udt.group/webhook/7c79287f-040c-48dc-aaf3-654b2ffc395e', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })
            if (!response.ok) {
              console.log('Task tracking received list sent to n8n')
              return NextResponse.json(
                { message: 'Task tracking received list sent to n8n' },
                { status: StatusCodes.INTERNAL_SERVER_ERROR }
              )
            }
            const taskTrackingProcessingList = taskTrackingWaitingList
              .filter((task: TaskTracking) => taskIdList.includes(task.task_id))
              .map((task: TaskTracking) => {
                return {
                  ...task,
                  status: TaskStatus.PROCESSING
                }
              })
            const { error: updateTaskTrackingProcessingError } = await supabase
              .from('taskTrackings')
              .upsert(taskTrackingProcessingList)
            if (updateTaskTrackingProcessingError) {
              return NextResponse.json(
                { message: 'error updating status processing' },
                { status: StatusCodes.INTERNAL_SERVER_ERROR }
              )
            }
          }
        }
        const taskTrackingReceivedList = taskTrackingList.filter(
          (task: TaskTracking) => task.status === TaskStatus.RECEIVED
        )
        if (taskTrackingReceivedList.length > 0) {
          const maximumTaskTrackingReceivedList = 500
          const taskIdList: string[] = taskTrackingReceivedList.map((task: TaskTracking) => task.task_id)
          const taskChunks: string[][] = splitTasksToTaskChunks(taskIdList, maximumTaskTrackingReceivedList)
          for (const taskChunk of taskChunks) {
            const data = {
              campaignId: campaignUpdating.campaign_id,
              se: campaignUpdating.search_engine,
              tasks: taskChunk
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/getResultKeyword`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(data)
            })
            if (!response.ok) {
              console.log('Task tracking received list sent to n8n')
              return NextResponse.json(
                { message: 'Task tracking received list sent to n8n' },
                { status: StatusCodes.INTERNAL_SERVER_ERROR }
              )
            }
            const taskTrackingProcessingList = taskTrackingReceivedList
              .filter((task: TaskTracking) => taskChunk.includes(task.task_id))
              .map((task: TaskTracking) => {
                return {
                  ...task,
                  status: TaskStatus.PROCESSING
                }
              })
            const { error: updateTaskTrackingProcessingError } = await supabase
              .from('taskTrackings')
              .upsert(taskTrackingProcessingList)
            if (updateTaskTrackingProcessingError) {
              return NextResponse.json(
                { message: 'error updating status processing' },
                { status: StatusCodes.INTERNAL_SERVER_ERROR }
              )
            }
          }
        }
        const taskTrackingDoneList = taskTrackingList.filter((task: TaskTracking) => task.status === TaskStatus.DONE)
        if (taskTrackingDoneList.length > 0 && taskTrackingDoneList.length === totalTask) {
          const { error: campaignUpdatingError } = await supabase
            .from('campaignUpdatings')
            .update({
              status: CampaignUpdatingStatus.COMPLETED,
              updated_at: new Date().toISOString()
            })
            .eq('id', campaignUpdating.id)

          if (campaignUpdatingError) {
            return NextResponse.json(
              { message: 'error in updating status done for campaignUpdating' },
              { status: StatusCodes.INTERNAL_SERVER_ERROR }
            )
          }
          setTimeout(() => {
            fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/finishCrawlKeyword`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ campaignId: campaignUpdating.campaign_id })
            }).catch(err => console.error('Error in finish Crawl Keyword', err))
          }, 0)
          return NextResponse.json({ message: 'OK' }, { status: StatusCodes.OK })
        }
        return NextResponse.json({ message: 'OK' }, { status: StatusCodes.OK })
      }
    }
  } else {
    return NextResponse.json({ message: 'No updates required' }, { status: StatusCodes.OK })
  }
}
