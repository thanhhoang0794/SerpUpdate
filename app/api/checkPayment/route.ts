import { checkOnePayVerifySecureHash } from '@/app/(checkout-pages)/action'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'
import { StatusTransaction } from '@/app/types/enumStatusTransaction'
import { PlanType } from '@/app/constant/planTypeEnum'

function calculateBonusPercentage(creditAmount: number, priceData: any) {
  const sortedPrices = [...priceData]?.sort((a, b) => a.total_credits - b.total_credits)
  let bonusPercentage = 0
  for (const price of sortedPrices) {
    if (creditAmount >= price.total_credits) {
      bonusPercentage = price.percent_bonus
    } else {
      break
    }
  }
  return bonusPercentage
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const vpc_MerchTxnRef = searchParams.get('vpc_MerchTxnRef') || ''
    const vpc_Card = searchParams.get('vpc_Card') || ''
    const vpc_TxnResponseCode = searchParams.get('vpc_TxnResponseCode') || ''
    const params = Object.fromEntries(searchParams.entries())
    const isSecureHashValid = await checkOnePayVerifySecureHash(params)
    if (isSecureHashValid && vpc_TxnResponseCode === '0') {
      const { data: updateSuccessTransactionData, error: updateSuccessTransactionError } = await supabase
        .from('transactions')
        .update({
          status: StatusTransaction.Success,
          payment_method: vpc_Card,
          updated_at: new Date().toISOString()
        })
        .eq('onepay_transaction_id', vpc_MerchTxnRef)
      if (updateSuccessTransactionError) {
        return NextResponse.json(
          { error: updateSuccessTransactionError.message },
          { status: StatusCodes.INTERNAL_SERVER_ERROR }
        )
      }
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('onepay_transaction_id', vpc_MerchTxnRef)
        .single()
      if (transactionError) {
        return NextResponse.json({ error: transactionError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
      const { data: creditData, error: creditError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', transactionData?.user_id)
        .single()
      if (creditError) {
        return NextResponse.json({ error: creditError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { data: priceListData, error: priceListError } = await supabase.from('prices').select('*')
      if (priceListError) {
        return NextResponse.json({ error: priceListError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
      const bonusPercentage = calculateBonusPercentage(transactionData?.credit_amount, priceListData)
      const bonus_credits = transactionData?.credit_amount * (bonusPercentage / 100)
      const { data: updateData, error: updateError } = await supabase
        .from('credits')
        .update({
          total_credits: creditData.total_credits + transactionData?.credit_amount,
          bonus_credits: creditData.bonus_credits + bonus_credits,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', transactionData?.user_id)
        .single()

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
      // cập nhật creditHistories
      const { data: creditHistoriesData, error: creditHistoriesError } = await supabase.from('creditHistories').insert({
        credit_id: creditData.id,
        amount: transactionData?.credit_amount,
        type: 'Buy',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      if (bonus_credits > 0) {
        const { data: creditHistoryData, error: creditHistoryError } = await supabase.from('creditHistories').insert({
          credit_id: creditData.id,
          type: 'Bonus',
          amount: bonus_credits,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }
      if (creditHistoriesError) {
        return NextResponse.json({ error: creditHistoriesError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('plan_type')
        .eq('id', transactionData?.user_id)
        .single()

      if (userError) {
        return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      if (userData.plan_type !== PlanType.PaidPlan) {
        const { error: updateUserError } = await supabase
          .from('users')
          .update({
            plan_type: PlanType.PaidPlan,
            plan_changed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionData?.user_id)

        if (updateUserError) {
          return NextResponse.json({ error: updateUserError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
        }
      }

      const successUrl = new URL(`/checkout/success?orderId=${vpc_MerchTxnRef}`, process.env.NEXT_PUBLIC_APP_URL)
      return NextResponse.redirect(successUrl)
    } else {
      const errorUrl = new URL(`/checkout/error?orderId=${vpc_MerchTxnRef}`, process.env.NEXT_PUBLIC_APP_URL)
      return NextResponse.redirect(errorUrl)
    }
  } catch (error) {
    console.error('Failed to fetch payment:', error)
    return NextResponse.json({ error: 'Failed to fetch payment' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
