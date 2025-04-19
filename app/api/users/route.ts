import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'
import { PlanType } from '@/app/constant/planTypeEnum'
import { SupabaseClient } from '@supabase/supabase-js';
import { TypeCredit } from '@/app/types/enumTypeCredit';

async function checkAndClearExpiredBonus(supabase: SupabaseClient, userId: string) {
  const { data: userProfile } = await supabase
    .from('users')
    .select('plan_type, plan_changed_at')
    .eq('id', userId)
    .single();

  if (userProfile?.plan_type === PlanType.FreePlan) {
    const freePlanStartTime = new Date(userProfile.plan_changed_at);
    const currentTime = new Date();
    const hoursDiff = (currentTime.getTime() - freePlanStartTime.getTime()) / (1000 * 60 * 60);
    if (hoursDiff >= 24) {
      const { data: creditData, error: creditError } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (creditError) {
        console.error('Error fetching credit data: ', creditError);
        return;
      }

      if(creditData?.bonus_credits > 0) {
        await supabase
          .from('creditHistories')
          .insert({
            user_id: userId,
            amount: creditData?.bonus_credits ?? 0,
            type: TypeCredit.Expired,
          });
        await supabase
          .from('credits')
          .update({ 
            bonus_credits: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      }
    }
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const supabase = await createClient()
    const id = searchParams.get('id')

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError) {
      return NextResponse.json({ error: authError?.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    const userQuery = supabase
      .from('users')
      .select('*')

    if (id) {
      const { data: userData, error: userError } = await userQuery.eq('id', id).single()
      if (userError) return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      await checkAndClearExpiredBonus(supabase, id)
      return NextResponse.json({
        auth: authData.user,
        profile: userData
      })
    }

    const { data: userData, error: userError } = await userQuery
      .eq('email', authData.user?.email)
      .single()

    if (userError) {
      return NextResponse.json({ error: userError?.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    await checkAndClearExpiredBonus(supabase, userData.id)

    return NextResponse.json({
      auth: authData.user,
      profile: userData
    })
  } catch (error) {
    console.error('Error fetching user data: ', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { data, error } = await supabase.from('users').insert([body])
  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  const email = userData.user?.email
  if (!email) {
    return NextResponse.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
  }
  const { data, error } = await supabase
    .from('users')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('email', email)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { id } = body
  const { data, error } = await supabase.from('users').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  return NextResponse.json(data)
}
