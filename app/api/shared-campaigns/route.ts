import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'

export const dynamic = 'force-dynamic';

async function getOwnerEmail(campaignUser: any, supabase: any) {
  const { data: creatorData, error: creatorError } = await supabase
    .from('campaignUsers')
    .select('user_id')
    .eq('campaign_id', campaignUser.campaign_id)
    .eq('is_creator', true)
    .single()

  if (creatorError) {
    throw new Error(creatorError.message)
  }

  const { data: ownerData, error: ownerError } = await supabase
    .from('users')
    .select('email')
    .eq('id', creatorData.user_id)
    .single()

  if (ownerError) {
    throw new Error(ownerError.message)
  }

  return ownerData.email
}

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
    const campaignUsersQuery = supabase
      .from('campaignUsers')
      .select('*, campaigns!inner(*,domains!inner(*, keywords!inner(id,keyword,position)))', { count: 'exact' })
      .eq('user_id', userId)
      .eq('campaigns.is_active', true)
      .eq('campaigns.domains.is_active', true)
      .eq('campaigns.domains.keywords.is_active', true)
      .eq('is_creator', false)
      .order('updated_at', { ascending: false })
      .range(start, end)

    if (query) {
      campaignUsersQuery.ilike('campaigns.name', `%${query}%`).not('campaigns', 'is', null)
    }

    const { data: campaignUsers, error: campaignUsersError, count } = await campaignUsersQuery

    if (campaignUsersError?.details.includes('0 rows')) {
      return NextResponse.json({ message: 'No campaigns found' }, { status: 200 })
    }
    if (campaignUsersError || !campaignUsers) {
      return NextResponse.json({ error: campaignUsersError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    // Add logic to get the owner's email of the campaign
    for (const campaignUser of campaignUsers) {
      try {
        campaignUser.campaigns.shared_By = await getOwnerEmail(campaignUser, supabase)
      } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
    }

    return NextResponse.json({
      campaignUsers,
      pagination: { total: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize) }
    })
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}



