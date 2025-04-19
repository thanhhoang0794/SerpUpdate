import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'

const dayOfWeeks = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

async function updateCampaigns(data: any) {
    const promises = (data || []).map((item: any) =>
        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/update-campaign`, {
            method: 'POST',
            body: JSON.stringify({ campaignId: item.id })
        })
        .then(() => console.log(`Campaign ${item.id} updated`))
        .catch(error => console.error(`Error updating campaign ${item.id}:`, error))
    );

    await Promise.all(promises);
};

export async function GET(request: NextRequest) {
    console.log('GET /api/check-update-campaign run at ' + new Date())
    const supabase = await createClient()
    const now = new Date()

    let hour = `${now.getHours().toString().padStart(2, '0')}:00:00`
    let dayOfWeek = now.getDay()

    const {data, error} = await supabase
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
        return NextResponse.json({ message: 'Success update ' + data.length + ' campaigns at ' + hour + ' ' + dayOfWeeks[dayOfWeek] })
    })

    return NextResponse.json({ message: 'Updating ' + data.length + ' campaigns at ' + hour + ' ' + dayOfWeeks[dayOfWeek] })
}