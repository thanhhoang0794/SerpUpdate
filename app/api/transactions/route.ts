import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'
import { createClient } from '@/utils/supabase/server'
import { StatusTransaction } from '@/app/types/enumStatusTransaction'
import {StatusCodes} from 'http-status-codes'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const onepay_transaction_id = searchParams.get('onepay_transaction_id')
  const user_id = searchParams.get('user_id')
  if (onepay_transaction_id && user_id) {  
    const { data, error } = await supabase.from('transactions').select('*')
    .eq('onepay_transaction_id', onepay_transaction_id)
    .eq('status', StatusTransaction.Success)
    .eq('user_id', user_id)
    .single()
    if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase.from('transactions').select('*')
    if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    return NextResponse.json(data)
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const {amount, onepay_transaction_id, credit_amount} = await request.json()
  const {data: userData, error: userError} = await supabase.auth.getUser()
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const newData = {
    amount,
    user_id: userData.user?.id,
    onepay_transaction_id,
    transaction_date: new Date().toISOString(),
    credit_amount,
    status: StatusTransaction.Pending,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase.from('transactions').insert([newData]).select()

  if (error) return NextResponse.json({ error: error.message }, { status:  StatusCodes.INTERNAL_SERVER_ERROR})
  return NextResponse.json(data[0]?.id || '')
}

export async function PATCH(request: Request) {
  
  const {onepay_transaction_id, vpc_Card, user_id} = await request.json()
  const { data, error } = await supabase.from('transactions').update({ 
    status: StatusTransaction.Success, 
    payment_method: vpc_Card,
    updated_at: new Date().toISOString() 
  })
  .eq('onepay_transaction_id', onepay_transaction_id)
  .eq('user_id', user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return new NextResponse(null, { status: StatusCodes.NO_CONTENT })
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase.from('transactions').update({...updates, updated_at: new Date().toISOString()}).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const { data, error } = await supabase.from('transactions').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}
