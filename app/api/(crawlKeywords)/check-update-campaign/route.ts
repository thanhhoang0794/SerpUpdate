import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
const dayOfWeeks = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

async function updateCampaigns(data: any) {
  const promises = (data || []).map((item: any) =>
    fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/update-campaign`, {
      method: 'POST',
      body: JSON.stringify({ campaignId: item.id })
    })
      .then(() => console.log(`Campaign ${item.id} updated`))
      .catch(error => console.error(`Error updating campaign ${item.id}:`, error))
  )

  await Promise.all(promises)
}

export async function GET(request: NextRequest) {
  const cookieStore = cookies()
  const authHeader = request.headers.get('authorization') || ''
  if (!authHeader) {
    return new NextResponse('Unauthorized', {
      status: StatusCodes.UNAUTHORIZED
    })
  }
  const authToken = authHeader.split(' ')[1]
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, authToken, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      }
    }
  })
  const now = new Date()

  let hour = `${now.getHours().toString().padStart(2, '0')}:00:00`
  let dayOfWeek = now.getDay()

  const { data, error } = await supabase
    .from('campaigns')
    .select('id')
    .eq('is_active', true)
    .eq('time_of_day', hour)
    .contains('day_of_week', [dayOfWeeks[dayOfWeek]])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  await updateCampaigns(data).finally(() => {
    console.log('Updated ' + data.length + ' campaigns at ' + hour + ' ' + dayOfWeeks[dayOfWeek])
    return NextResponse.json({
      message: 'Success update ' + data.length + ' campaigns at ' + hour + ' ' + dayOfWeeks[dayOfWeek]
    })
  })

  return NextResponse.json({
    message: 'Updating ' + data.length + ' campaigns at ' + hour + ' ' + dayOfWeeks[dayOfWeek]
  })
}
