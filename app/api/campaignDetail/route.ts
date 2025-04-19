import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Keyword } from '@/app/types/keywords'
import Domain from '@/database/models/domain';
import {toJSON, fromJSON} from 'flatted'
import { StatusCodes } from 'http-status-codes'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')
  const id = searchParams.get('id')

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: userError?.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const {data: campaignData, error: campaignError} = await supabase.from('campaignUsers').select('*').eq('campaign_id', id).eq('user_id', userData.user.id).single()
    if(campaignError || !campaignData) {
      return  NextResponse.json({ error: 'User not authorized for this campaign'}, { status: StatusCodes.FORBIDDEN })
    }

    if (action === 'sharedUsers') {
      const { data: campaignData, error: campaignError } = await supabase.from('campaignUsers').select('*').eq('campaign_id', id)

      if (campaignError) {
        return NextResponse.json({ error: campaignError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const userDetailsPromises = campaignData.map(async (campaign) => {
        const { data: userData, error: userError } = await supabase.from('users').select('email, image_url').eq('id', campaign.user_id).single()

        if (userError) return { error: userError.message }

        return {
          ...campaign,
          user_access: {
            email: userData.email,
            image_url: userData.image_url
          }
        }
      })

      const responseData = await Promise.all(userDetailsPromises)
      return NextResponse.json(responseData)
    } else {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*,domains!inner(*, keywords!inner(*))')
        .eq('id', id)
        .eq('domains.is_active', true)
        .eq('domains.keywords.is_active', true)
        .order('id', { foreignTable: 'domains.keywords', ascending: false })
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }

      const { data: ownerData, error: ownerError } = await supabase
        .from('campaignUsers')
        .select('can_edit')
        .eq('campaign_id', id)
        .eq('user_id', userData.user.id)
        .single();

      const isOwnerCampaign = ownerError ? false : ownerData ? ownerData.can_edit : false;

      const responseData = {
        ...data,
        isOwnerCampaign
      };

      return NextResponse.json(responseData)
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  if (body.action === 'checkEmail') {
    const { email } = body;

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (userError) {
      return NextResponse.json({ error: 'Email does not exist' }, { status: StatusCodes.NOT_FOUND });
    }

    if (!userData) {
      return NextResponse.json({ error: 'Email does not exist' }, { status: StatusCodes.NOT_FOUND });
    }

    return NextResponse.json({ message: 'Email exists' });
  }

  const { emails, campaign_id } = body

  const results = []

  for (const email of emails) {
    const { data: userData, error: userError } = await supabase.from('users').select('id, email').eq('email', email).single()

    if (userError) {
      results.push({ email, error: userError.message })
      continue
    }

    const newBody = {
      user_id: userData.id,
      campaign_id: campaign_id,
      is_creator: false,
      can_edit: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase.from('campaignUsers').insert([newBody])

    if (error) {
      results.push({ email, error: error.message })
    } else {
      results.push({ email, data })
    }
  }

  return NextResponse.json(results)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const body = await request.json();
  const { email, campaign_id } = body; // Sử dụng email để tìm user_id


  // Check if action is checkEmailIsExist
  if (body.action === 'checkEmailIsExist') {
    const { data: userData, error: userError } = await supabase.from('users').select('id').eq('email', email).single()

    if (userError || !userData) {
      return NextResponse.json({ email, error: "Email doesn't exist" }, { status: StatusCodes.BAD_REQUEST })
    }
  }

  // Tìm user_id dựa trên email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError) {
    return NextResponse.json({ email, campaign_id, error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
  const { data, error } = await supabase
    .from('campaignUsers')
    .delete()
    .eq('user_id', userData.id)
    .eq('campaign_id', campaign_id);

  if (error) {
    return NextResponse.json({ email, campaign_id, error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  } else {
    return NextResponse.json({ email, campaign_id, data });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    const body = await request.json()
    const id = searchParams.get('id')
    const newDate = new Date().toISOString()

     // Kiểm tra xem có thay đổi về devices/language/location không
    const hasDevicesChange = body?.devices ? true : false;
    const hasLanguageChange = body?.language ? true : false;
    const hasLocationChange = body?.location ? true : false;
    const hasSearchEngineChange = body?.selectedSearchEngine ? true : false;
    const hasMetadataChanges = hasDevicesChange || hasLanguageChange || hasLocationChange || hasSearchEngineChange;
    const updateData: any = {};

    let campaignDevice: string | null = null;
    if (body?.devices) {
      if (body.devices.isMobile && body.devices.isDesktop) {
        campaignDevice = 'both';
      } else if (body.devices.isMobile) {
        campaignDevice = 'mobile';
      } else if (body.devices.isDesktop) {
        campaignDevice = 'desktop';
      }
      updateData.devices = campaignDevice;
    }
    if (body?.location || body?.language) {
      updateData.country_code = body?.location;
      updateData.language = body?.language;
    }
    if (body?.selectedSearchEngine) {
      updateData.search_engine = body?.selectedSearchEngine;
    }


    if (body?.campaignName || body?.time_of_day || body?.day_of_week) {
      updateData.name = body?.campaignName;
      updateData.time_of_day = body?.time_of_day
      updateData.day_of_week = body?.day_of_week
    }

    const { data: originalCampaign } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single();

    const originalDevice = originalCampaign?.devices;

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase.from('campaigns').update({...updateData, updated_at: newDate}).eq('id', id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
      }
    }
    if(hasMetadataChanges) {
      const { data: campaignData, error: campaignDataError } = await supabase
        .from('campaigns')
        .select('*,domains!inner(*, keywords!inner(*))')
        .eq('id', id)
        .eq('domains.is_active', true)
        .eq('domains.keywords.is_active', true)
        .single();
      if (campaignDataError) {
        return NextResponse.json({ error: campaignDataError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
      }
      const bodyData = {
          campaign_id: id,
          snapshot_type: 'update_campaign',
          snapshot_data: toJSON(campaignData),
          snapshot_date: newDate,
          created_at: newDate,
          updated_at: newDate
        } 
      const {data: campaignSnapshot, error: campaignSnapshotError} = await supabase.from('campaignSnapshots').insert([bodyData])
      if (campaignSnapshotError) {
        return NextResponse.json({ error: campaignSnapshotError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
      const ownDomain = campaignData.domains.find(
        (domain: Domain) => domain.domain_type === 'own'
      );
      const templateKeywords = ownDomain?.keywords || [];

      for (const domain of campaignData.domains) {
        const { error: keywordsError } = await supabase
          .from('keywords')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('domain_id', domain.id)
          .eq('is_active', true);

        if (keywordsError) {
          return NextResponse.json({ error: keywordsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
        }
        const newKeywords = [];
        let totalKeywords = 0;
        if(body?.devices) {
          if (campaignDevice === 'both') {
            // Tạo một bản sao cho 2 device
          templateKeywords.forEach((keyword: Keyword) => {
            newKeywords.push(
              {
                domain_id: domain.id,
                keyword: keyword.keyword,
                device: 'mobile',
                country_code: body?.location || keyword.country_code,
                language: body?.language || keyword.language,
                search_engine: body?.selectedSearchEngine || keyword.search_engine,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            )
            newKeywords.push(
              {
                domain_id: domain.id,
                keyword: keyword.keyword,
                device: 'desktop',
                country_code: body?.location || keyword.country_code,
                language: body?.language || keyword.language,
                search_engine: body?.selectedSearchEngine || keyword.search_engine,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            )
          });
          totalKeywords = newKeywords.length
          } else {
            if (originalDevice === 'both') {
            // Trường hợp 1: Ban đầu có cả 2 device, giờ chỉ lấy 1 device
            newKeywords.push(...templateKeywords
            .filter((keyword: Keyword) => keyword.device === campaignDevice)
            .map((keyword: Keyword) => ({
            domain_id: domain.id,
            keyword: keyword.keyword,
            device: campaignDevice,
            country_code: body?.location || keyword.country_code,
            language: body?.language || keyword.language,
            search_engine: body?.selectedSearchEngine || keyword.search_engine,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }))
            );
            totalKeywords = newKeywords.length ;
            } else {
            // Trường hợp 2: Ban đầu chỉ có 1 device
            newKeywords.push(...templateKeywords.map((keyword: Keyword) => ({
              domain_id: domain.id,
              keyword: keyword.keyword,
              device: campaignDevice,
              country_code: body?.location || keyword.country_code,
              language: body?.language || keyword.language,
              search_engine: body?.selectedSearchEngine || keyword.search_engine,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })));
            totalKeywords = newKeywords.length
            }
          }
        } else {
          if (body?.location || body?.language || body?.selectedSearchEngine) {
            newKeywords.push(...templateKeywords.map((keyword: Keyword) => ({
              domain_id: domain.id,
              keyword: keyword.keyword,
              device: keyword.device,  // giữ nguyên device cũ
              country_code: body?.location || keyword.country_code,
              language: body?.language || keyword.language,
              search_engine: body?.selectedSearchEngine || keyword.search_engine,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })));
            totalKeywords = newKeywords.length
          }
        }
        const { error: insertKeywordsError } = await supabase
          .from('keywords')
          .insert(newKeywords);
        if (insertKeywordsError) {
          return NextResponse.json({ error: insertKeywordsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
        }
        const { error: updateCampaignError } = await supabase
          .from('campaigns')
          .update({ 
            keyword_count: totalKeywords,
            updated_at: new Date().toISOString() 
          })
          .eq('id', id);
      }
    }

    if(body?.ownDomainName) {
      if(!hasMetadataChanges){
        const {data: campaignData} = await supabase.from('campaigns')
        .select('*,domains!inner(*, keywords!inner(*))')
        .eq('id', id)
        .eq('domains.is_active', true)
        .eq('domains.keywords.is_active', true)
        .single()

        const bodyData = {
          campaign_id: id,
          snapshot_type: 'update_domain',
          snapshot_data: toJSON(campaignData),
          snapshot_date: newDate,
          created_at: newDate,
          updated_at: newDate
        } 
        const {data: campaignSnapshot, error: campaignSnapshotError} = await supabase.from('campaignSnapshots').insert([bodyData])
        if (campaignSnapshotError) {
          return NextResponse.json({ error: campaignSnapshotError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
        }
        const ownDomain = campaignData.domains.find(
          (domain: Domain) => domain.domain_type === 'own'
        )
        const domainKeywords = ownDomain?.keywords || []
        if (ownDomain && domainKeywords.length > 0) {
          const { error: keywordsError } = await supabase
            .from('keywords')
            .update({ is_active: false, updated_at: newDate })
            .eq('domain_id', ownDomain.id)
          if (keywordsError) {
            return NextResponse.json({ error: keywordsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
          } 
          const newKeywords = domainKeywords.map((keyword: Keyword) => ({
            domain_id: ownDomain.id,
            keyword: keyword.keyword,
            device: keyword.device,
            country_code: keyword.country_code,
            language: keyword.language,
            search_engine: keyword.search_engine,
            is_active: true,
            created_at: newDate,
            updated_at: newDate
          }));    
          if (newKeywords.length > 0) {
            const { error: insertError } = await supabase
              .from('keywords')
              .insert(newKeywords);

            if (insertError) {
              return NextResponse.json({ error: insertError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
            }
          }   
        }
      }
      const { error: domainError } = await supabase
        .from('domains')
        .update({ domain: body.ownDomainName, updated_at: newDate })
        .eq('campaign_id', id)
        .eq('domain_type', 'own')
        .eq('is_active', true);

      if (domainError) {
        console.log(domainError)
        return NextResponse.json({ error: domainError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
      }
    }
    if(body?.competitorDomainsName) {
      if(!hasMetadataChanges){
        const {data: campaignData} = await supabase.from('campaigns')
        .select('*,domains!inner(*, keywords!inner(*))')
        .eq('id', id)
        .eq('domains.is_active', true)
        .eq('domains.keywords.is_active', true)
        .single()

        const bodyData = {
          campaign_id: id,
          snapshot_type: 'update_competitor_domains',
          snapshot_data: toJSON(campaignData),
          snapshot_date: newDate,
          created_at: newDate,
          updated_at: newDate
        } 
        const {data: campaignSnapshot, error: campaignSnapshotError} = await supabase.from('campaignSnapshots').insert([bodyData])
        if (campaignSnapshotError) {
          return NextResponse.json({ error: campaignSnapshotError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
        }
      }
      const { data: existingDomains, error: existingDomainsError } = await supabase
        .from('domains')
        .select('*')
        .eq('campaign_id', id)
        .eq('domain_type', 'competitor')
        .eq('is_active', true);
      if (existingDomainsError) {
        return NextResponse.json({ error: existingDomainsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
      }

      const existingDomainsSet = new Set(existingDomains.map((domain:Domain) => domain.domain.toLowerCase()));
      const newDomainsSet = new Set(body.competitorDomainsName
        .map((domain:{id:string, domain:string}) => domain.domain.toLowerCase()));
      const domainsToDeactivate = existingDomains.filter(
        (domain:Domain) => !newDomainsSet.has(domain.domain.toLowerCase())
        );
      const domainsToAdd = body.competitorDomainsName.filter(
        (competitorDomain:{id:string, domain:string}) => !existingDomainsSet.has(competitorDomain.domain.toLowerCase())
        );
      if(domainsToDeactivate.length > 0) {
          for (const domain of domainsToDeactivate) {
            const { error: deactivateDomainError } = await supabase
              .from('domains')
              .update({ is_active: false, updated_at: newDate })
              .eq('id', domain.id);
  
            if (deactivateDomainError) {
              return NextResponse.json({ error: deactivateDomainError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
            }
  
            const { error: deactivateKeywordsError } = await supabase
              .from('keywords')
              .update({ is_active: false, updated_at: newDate })
              .eq('domain_id', domain.id);
  
            if (deactivateKeywordsError) {
              return NextResponse.json({ error: deactivateKeywordsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
            }
          }
        }
      if (domainsToAdd.length > 0) {
        console.log(domainsToAdd)
          const newDomains = domainsToAdd.map((domain:{id:String,domain:String}) => ({
            campaign_id: id,
            domain: domain.domain,
            slug: domain.domain.replace(/[^a-zA-Z0-9]/g, '-'),
            domain_type: 'competitor',
            is_active: true,
            created_at: newDate,
            updated_at: newDate
          }));

          const {data: newDomainsData, error: insertError } = await supabase
          .from('domains')
          .insert(newDomains)
          .select('id');

          if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
          }
          const { data: ownDomainData, error: ownDomainError } = await supabase
            .from('domains')
            .select('id, keywords!inner(*)')
            .eq('campaign_id', id)
            .eq('domain_type', 'own')
            .eq('is_active', true)
            .eq('keywords.is_active', true)
            .single();
          
          if (ownDomainError) {
            return NextResponse.json({ error: ownDomainError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
          }
          const ownDomainKeywords = ownDomainData?.keywords || [];
          for (const domain of newDomainsData) {
            const newKeywords = ownDomainKeywords.map((keyword: Keyword) => ({
              domain_id: domain.id,
              keyword: keyword.keyword,
              device: keyword.device,
              country_code: keyword.country_code,
              language: keyword.language,
              search_engine: keyword.search_engine,
              is_active: true,
              created_at: newDate,
              updated_at: newDate
            }));
            if (newKeywords.length > 0) {
              const { error: insertKeywordsError } = await supabase
                .from('keywords')
                .insert(newKeywords);
              if (insertKeywordsError) {
                return NextResponse.json({ error: insertKeywordsError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
              }
            }
          }
      }
    }
    return new NextResponse(null, {status:StatusCodes.NO_CONTENT})
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: error }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}



