import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const supabase = await createClient()
    const { data, error } = await supabase.from('prices').select('*')
    if (error) {
        return NextResponse.json({
            message: error.message
        }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    return NextResponse.json({ data }, {status: StatusCodes.OK})
}