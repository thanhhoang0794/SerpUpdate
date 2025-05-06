import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import backgroundUpdateKeywordsRanking from '@/utils/backgroundUpdate'
import { StatusCodes } from 'http-status-codes'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { campaignId } = await request.json()

  const { data: userData, error: userError } = await supabase
    .from('campaignUsers')
    .select('*, users(credits(*)), campaigns(devices, keyword_count)')
    .eq('campaign_id', campaignId)
    .eq('is_creator', true)
    .single()
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const creditId = userData?.users?.credits[0]?.id

  let totalKeywords = userData?.campaigns?.keyword_count
  let bonusCredits = userData?.users?.credits[0]?.bonus_credits
  let totalCredits = userData?.users?.credits[0]?.total_credits

  if (bonusCredits + totalCredits < totalKeywords) {
    return NextResponse.json({ error: 'Not enough credits' }, { status: 400 })
  }

  const newDate = new Date().toISOString()

  const { data: campaignData, error: campaignError } = await supabase
    .from('campaigns')
    .update({
      sc_data: newDate,
      updating: true,
      updated_at: newDate
    })
    .eq('id', campaignId)
    .select()

  const { error: campaignUsersError } = await supabase
    .from('campaignUsers')
    .update({
      updated_at: newDate
    })
    .eq('campaign_id', campaignId)

  if (campaignError || campaignUsersError) {
    return NextResponse.json(
      { error: campaignError?.message || campaignUsersError?.message },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    )
  }

  if (bonusCredits >= totalKeywords) {
    bonusCredits -= totalKeywords
  } else {
    totalKeywords -= bonusCredits
    bonusCredits = 0
    totalCredits -= totalKeywords
  }

  const { error: updateCreditsError } = await supabase
    .from('credits')
    .update({
      bonus_credits: bonusCredits,
      total_credits: totalCredits,
      updated_at: newDate
    })
    .eq('id', creditId)

  if (updateCreditsError) {
    return NextResponse.json({ error: updateCreditsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const { error: addCreditHistoryError } = await supabase.from('creditHistories').insert({
    credit_id: creditId,
    amount: totalKeywords,
    type: 'Use',
    created_at: newDate,
    updated_at: newDate
  })
  if (addCreditHistoryError) {
    return NextResponse.json({ error: addCreditHistoryError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  try {
    backgroundUpdateKeywordsRanking(campaignId)
  } catch (error) {
    console.error('Error in background task:', error)
    await supabase
      .from('campaigns')
      .update({
        updating: false,
        last_error: error,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
  }

  return NextResponse.json({ message: 'Campaign update started' }, { status: 200 })
}
