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
        .select('*, campaigns!inner(*,domains!inner(*, keywords!inner(id,keyword,position)))', { count: 'exact' })
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

      //  if (campaignUsers) {
      //   for (const cu of campaignUsers) {
      //     for (const domain of cu.campaigns.domains) {
      //       const { count } = await supabase
      //         .from('keywords')
      //         .select('*', { count: 'exact' })
      //         .eq('domain_id', domain.id)
      //         .eq('is_active', true);
      //       const batchSize = 1000;
      //       let allKeywords: any[] = [];
            
      //       for (let i = 0; i < (count ?? 0); i += batchSize) {
      //         const { data: keywords } = await supabase
      //           .from('keywords')
      //           .select('id,keyword,position')
      //           .eq('domain_id', domain.id)
      //           .eq('is_active', true)
      //           .range(i, i + batchSize - 1);    
      //         if (keywords) {
      //           allKeywords = [...allKeywords, ...keywords];
      //         }
      //       }

      //     domain.keywords = allKeywords;
      //     }
      //   }
      // }
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
        .select('*, campaigns!inner(*,domains!inner(*, keywords!inner(id,keyword,position)))', { count: 'exact' })
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

      // if (campaignUsers) {
      //   for (const cu of campaignUsers) {
      //     for (const domain of cu.campaigns.domains) {
      //       const { count } = await supabase
      //         .from('keywords')
      //         .select('*', { count: 'exact' })
      //         .eq('domain_id', domain.id)
      //         .eq('is_active', true);
      //       const batchSize = 1000;
      //       let allKeywords: any[] = [];
            
      //       for (let i = 0; i < (count ?? 0); i += batchSize) {
      //         const { data: keywords } = await supabase
      //           .from('keywords')
      //           .select('id,keyword,position')
      //           .eq('domain_id', domain.id)
      //           .eq('is_active', true)
      //           .range(i, i + batchSize - 1);    
      //         if (keywords) {
      //           allKeywords = [...allKeywords, ...keywords];
      //         }
      //       }

      //     domain.keywords = allKeywords;
      //     }
      //   }
      // }

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

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      name,
      devices,
      country_code,
      language,
      day_of_week,
      time_of_day,
      own_domain,
      competitor_domains,
      keywords,
      search_engine
    } = await request.json()
    const deviceOptions = devices === 'both' ? ['desktop', 'mobile'] : [devices]

    const { data: campaign, error } = await supabase
      .from('campaigns')
      .insert({
        name,
        keyword_count: devices === 'both' ? (keywords.length * 2) : keywords.length,
        devices,
        country_code,
        language,
        day_of_week,
        time_of_day,
        search_engine,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
    if (error) {
      return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const campaignId = campaign?.[0]?.id

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

    const { data: campaignUsers, error: campaignUsersError } = await supabase
      .from('campaignUsers')
      .insert({ campaign_id: campaignId, user_id: userId, is_creator: true, can_edit: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()

    if (campaignUsersError) {
      return NextResponse.json({ error: campaignUsersError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const { data: ownDomains, error: ownDomainsError } = await supabase
      .from('domains')
      .insert({ campaign_id: campaignId, domain: own_domain, domain_type: 'own', slug: own_domain.replace(/\./g, '-'), is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .select()
    if (ownDomainsError) {
      return NextResponse.json({ error: ownDomainsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const ownDomainId = ownDomains?.[0]?.id

    for (const keyword of keywords) {
      for (const device of deviceOptions) {
        const { data: keywordData, error: keywordError } = await supabase
          .from('keywords')
          .insert({
            domain_id: ownDomainId,
            keyword: keyword,
            device: device,
            country_code,
            language,
            search_engine,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()

        if (keywordError) {
          return NextResponse.json({ error: keywordError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
        }
      }
    }

    for (const domain of competitor_domains) {
      let value = domain.value
      let { data: competitorDomain, error: competitorDomainError } = await supabase
        .from('domains')
        .insert({
          campaign_id: campaignId,
          domain: value,
          domain_type: 'competitor',
          slug: value.replace(/\./g, '-'),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (competitorDomainError) {
        return NextResponse.json({ error: competitorDomainError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      let competitorDomainId = competitorDomain?.[0]?.id

      for (const keyword of keywords) {
        const deviceOptions = devices === 'both' ? ['desktop', 'mobile'] : [devices]
        for (const device of deviceOptions) {
          const { data: keywordData, error: keywordError } = await supabase
            .from('keywords')
            .insert({
              domain_id: competitorDomainId,
              keyword: keyword,
              device: device,
              country_code,
              language,
              search_engine,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()

          if (keywordError) {
            return NextResponse.json({ error: keywordError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
          }
        }
      }
    }


    return NextResponse.json({ data: campaignId, message: 'Campaign created successfully' })
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { id, ...updates } = body

  const { data, error } = await supabase.from('campaigns').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const { error } = await supabase.from('campaigns').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
   return new NextResponse(null, {status:204})
}
