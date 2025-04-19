import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    const id = searchParams.get('id')
    if (id) {
      const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single()
      if (error) {
        return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
      return NextResponse.json(data)
    }

    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: userError?.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    const email = userData.user?.email
    const { data: user, error: userQueryError } = await supabase.from('users').select('id').eq('email', email).single()
    if (userQueryError || !user) {
      return NextResponse.json({ error: userQueryError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }
    const userId = user?.id

    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
    const query = searchParams.get('query')

    const start = (page - 1) * pageSize
    const end = start + pageSize - 1
    if (query) {
      const {
        data: campaignUsers,
        error: campaignUsersError,
        count
      } = await supabase
        .from('campaignUsers')
        .select('*, campaigns!inner(*,domains!inner(*, keywords!inner(*)))', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_creator', true)
        .eq('campaigns.is_active', true)
        .eq('campaigns.domains.is_active', true)
        .eq('campaigns.domains.keywords.is_active', true)
        .ilike('campaigns.name', `%${query}%`)
        .not('campaigns', 'is', null)
        .order('updated_at', { ascending: false })
        .range(start, end)

      if (campaignUsersError?.details.includes('0 rows')) {
        return NextResponse.json({ message: 'No campaigns found' }, { status: 200 })
      }
      if (campaignUsersError || !campaignUsers) {
        return NextResponse.json({ error: campaignUsersError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      return NextResponse.json({
        campaignUsers,
        pagination: { total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) }
      })
    } else {
      const {
        data: campaignUsers,
        error: campaignUsersError,
        count
      } = await supabase
        .from('campaignUsers')
        .select('*, campaigns!inner(*,domains!inner(*, keywords!inner(*)))', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_creator', true)
        .eq('campaigns.is_active', true)
        .eq('campaigns.domains.is_active', true)
        .eq('campaigns.domains.keywords.is_active', true)
        .order('updated_at', { ascending: false })
        .range(start, end)
        .limit(2000)

      if (campaignUsersError || !campaignUsers) {
        return NextResponse.json({ error: campaignUsersError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      return NextResponse.json({
        campaignUsers,
        pagination: { total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) }
      })
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}