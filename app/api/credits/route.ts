import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const supabase = await createClient()
  const id = searchParams.get('id')
  if (id) {
    const { data, error } = await supabase.from('credits').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    return NextResponse.json(data)
  } else {
    const {data: userData, error: userError} = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    console.log(userData)
    const { data, error } = await supabase.from('credits')
    .select('*, creditHistories(*)')
    .eq('user_id', userData.user?.id)
    .order('created_at', { foreignTable: 'creditHistories', ascending: false })
    console.log(data)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    const responseData = data.map((credit: any) => ({
      ...credit,
      email: userData.user?.email
    }))
    return NextResponse.json(responseData)
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const supabase = await createClient()
  const { data, error } = await supabase.from('credits').insert([body])

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const { bonus_amount } = await request.json()
  const supabase = await createClient()
  
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const { data: creditData, error: creditError } = await supabase
    .from('credits')
    .select('*')
    .eq('user_id', userData.user?.id)
    .single()

  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const { data, error } = await supabase
    .from('credits')
    .update({ bonus_credits: bonus_amount })
    .eq('user_id', userData.user?.id)
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })

  const { error: historyError } = await supabase
    .from('creditHistories')
    .insert({
      credit_id: creditData.id,
      type: 'Bonus',
      amount: bonus_amount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const {credit} = await request.json()
  const {data: userData, error: userError} = await supabase.auth.getUser()
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
  const {data: creditData, error: creditError} = await supabase.from('credits').select('*').eq('user_id', userData.user?.id).single()
  if (creditError) {
    return NextResponse.json({ error: creditError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const bonus_credits = 0.1 * credit
  const {data: updateData, error: updateError} = await supabase.from('credits')
    .update({
      total_credits: creditData.total_credits + credit, 
      bonus_credits: creditData.bonus_credits + bonus_credits,
      updated_at: new Date().toISOString()
    }).eq('user_id', userData.user?.id).single()
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const {data: creditHistoryData, error: creditHistoryError} = await supabase.from('creditHistories')
    .insert({
      credit_id: creditData.id,
      type: 'Buy',
      amount: credit,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  if (bonus_credits > 0) {
    const {data: creditHistoryData, error: creditHistoryError} = await supabase.from('creditHistories')
      .insert({
        credit_id: creditData.id,
        type: 'Bonus',
        amount: bonus_credits,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
  }
  if (creditHistoryError) {
    return NextResponse.json({ error: creditHistoryError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
    return new NextResponse(null, {status:204})

}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const supabase = await createClient()
  const { data, error } = await supabase.from('credits').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}
