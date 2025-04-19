import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { deviceType } from '@/app/types/deviceType'
import { StatusCodes } from 'http-status-codes'
import Domain from '@/database/models/domain'
export async function DELETE(request: Request) {
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
      .single()

  if(currentCampaignError) {
    return NextResponse.json({ error: currentCampaignError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const domainIds = currentCampaign.domains.map((item: Domain) => item.id)
  
  const { error: updateKeywordError, data: updatedData } = await supabase
    .from('keywords')
    .update({ is_active: false, updated_at: newDate })
    .in('domain_id', domainIds)
    .in('keyword', keywords)
    .eq('is_active', true)


  if(updateKeywordError) {
    return NextResponse.json({ error: updateKeywordError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const multiplier = currentCampaign.devices === deviceType.BOTH ? 2 : 1;
  const {error: updateCampaignError} = await supabase
    .from('campaigns')
    .update({
      keyword_count: currentCampaign.keyword_count - (keywords.length * multiplier),
      updated_at: newDate
    })
    .eq('id', id)

  if(updateCampaignError) {
    return NextResponse.json({ error: updateCampaignError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }


  return NextResponse.json({success: true}, { status: StatusCodes.OK })
} catch (error: any) {
  return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
}
}
