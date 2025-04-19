import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { deviceType } from '@/app/types/deviceType'
import { StatusCodes } from 'http-status-codes'
import { Keyword } from '@/app/types/keywords'
export async function POST(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const keywords: string[] = await request.json()
  const newDate = new Date().toISOString()

  try{

  const { data: currentCampaign,error: currentCampaignError } = await supabase
      .from('campaigns')
      .select('*, domains!inner(*,keywords!inner(*))')
      .eq('domains.is_active', true)
      .eq('domains.keywords.is_active', true)
      .eq('id', id)
      .order('id', { foreignTable: 'domains.keywords', ascending: true })
      .single()

  if(currentCampaignError) {
    return NextResponse.json({ error: currentCampaignError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const existingKeywords = currentCampaign?.domains[0].keywords.map((item: Keyword) => 
    item.keyword.toLowerCase()
  ) || [];

  const duplicateKeywords = keywords.filter((item: string) =>
    existingKeywords.includes(item.toLowerCase())
  );

  if (duplicateKeywords.length > 0) {
    return NextResponse.json(
        { 
          error: `Duplicate keywords found: ${duplicateKeywords.join(', ')}` 
        }, 
        { 
          status: StatusCodes.BAD_REQUEST
        }
      )
  }

  let devices = <String[]>[]
  let newKeywordCount = 0
  if (currentCampaign?.devices === deviceType.BOTH) {
    devices = [deviceType.DESKTOP, deviceType.MOBILE]
    newKeywordCount = currentCampaign?.keyword_count + (keywords.length * 2)
  } else {
    devices = [currentCampaign?.devices]
    newKeywordCount = currentCampaign?.keyword_count + keywords.length
  }

  const { data, error } = await supabase.from('campaigns').update({keyword_count: newKeywordCount, updated_at: newDate}).eq('id', id)
  const keywordsToAdd = []
  const keywordinfo = currentCampaign?.domains[0].keywords[0]

  const newHistory = keywordinfo?.history ? 
  Object.keys(keywordinfo?.history).reduce((acc, key) => {
    acc[key] = 0
    return acc
  }, {} as Record<string, number>) 
  : {}

  for (const domain of currentCampaign?.domains) {
    for (const keyword of keywords) {
      for (const device of devices) {
      keywordsToAdd.push({
        domain_id: domain.id,
        keyword: keyword,
        device: device,
        country_code: keywordinfo?.country_code,
        language: keywordinfo?.language,
        history: newHistory,
        position: 0,
        is_active: true,
        updated_at: newDate,
        created_at: newDate
      })
    }
  }
  }

  const { error: insertError } = await supabase
      .from('keywords')
      .insert(keywordsToAdd)

  if (insertError) throw insertError


  if(error) {
    return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  return NextResponse.json({ success: true }, { status: StatusCodes.OK })
} catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
}

}
