import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { StatusCodes } from 'http-status-codes'
import { CampaignUpdatingStatus } from '@/app/types/enumCampaignUpdatingStatus'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: campaignUpdatingList, error: campaignUpdatingError } = await supabase
    .from('campaignUpdatings')
    .select('*')
    .eq('status', CampaignUpdatingStatus.WAITING)
  if (campaignUpdatingError) {
    return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  if (campaignUpdatingList?.length > 0) {
    const { data: configCountWaitingForPingback, error: configCountWaitingForPingbackError } = await supabase
      .from('configCountWaitingForPingback')
      .select('*')
      .eq('id', 1)
      .single()
    if (configCountWaitingForPingbackError) {
      return NextResponse.json({ message: 'error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    const countWaitingConfig = configCountWaitingForPingback?.count
    for (const campaignUpdating of campaignUpdatingList) {
      const now = new Date()
      const lastCreatedAt = new Date(campaignUpdating.created_at)
      if (now.getTime() - lastCreatedAt.getTime() > 20000) {
        void (async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/processCampaignUpdating`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ campaignUpdatingId: campaignUpdating.id, countWaitingConfig })
            })

            if (!response.ok) {
              throw new Error(`Failed to update keywords ranking: ${response.statusText}`)
            }
          } catch (error) {
            console.error('Error in background task:', error)
          }
        })()
      }
    }
    return NextResponse.json({ message: 'Ok' }, { status: StatusCodes.OK })
  } else {
    return NextResponse.json({ message: 'No updates required' }, { status: StatusCodes.OK })
  }
}
