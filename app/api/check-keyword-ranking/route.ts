import { createClient } from '@/utils/supabase/server'
import { parse } from 'flatted'
import { StatusCodes } from 'http-status-codes'
import { NextResponse } from 'next/server'




export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const date = searchParams.get('date')
    const { data, error } = await supabase.from('keywordRankings').select('*')
    .eq('keyword_id', id)
    .eq('crawl_date', date)
    .single()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const keywordData = data?.keyword_data
    if (typeof keywordData === 'string') {
      try {
        const keywordDataJson = parse(keywordData)
        return NextResponse.json({ keywordDataJson }, { status: StatusCodes.OK })
      } catch (parseError) {
        return NextResponse.json({ error: 'Failed to parse keyword data' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

    } else {
      return NextResponse.json({ error: 'Invalid keyword data format' }, { status: StatusCodes.BAD_REQUEST })
    }

  } catch (err) {
    return NextResponse.json({ error: 'Failed to process keyword data' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}