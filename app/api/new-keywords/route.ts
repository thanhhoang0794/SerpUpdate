import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'
import { StatusCodes } from 'http-status-codes'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    const { data, error } = await supabase.from('keywords').select('*').eq('id', id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    return NextResponse.json(data)
  } else {
    const { data, error } = await supabase.from('keywords').select('*')
    if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    return NextResponse.json(data)
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  const { data, error } = await supabase.from('keywords').insert([body])

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase.from('keywords').update({...updates, updated_at: new Date().toISOString()}).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const { id } = await request.json()
  const { data, error } = await supabase.from('keywords').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}
