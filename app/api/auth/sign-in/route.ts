'use server'

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import joi from 'joi'
import validateForm from '@/utils/validateForm'
import { StatusCodes } from 'http-status-codes'

const loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required()
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { username, password } = await request.json()

    const validatedLogin = await validateForm({ username, password }, loginSchema)

    if (validatedLogin instanceof NextResponse) {
      return validatedLogin
    }

    const { data: checkUserData, error: userError } = await supabase.from('users').select('*').eq('username', username)

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: StatusCodes.BAD_REQUEST })
    }

    if (checkUserData && checkUserData.length === 0) {
      return NextResponse.json({ error: 'Username does not exist' }, { status: StatusCodes.NOT_FOUND })
    }

    if(checkUserData[0].is_active === false) {
      return NextResponse.json({ error: 'Account is not active. Please contact support .' }, { status: StatusCodes.UNAUTHORIZED })
    }

    return NextResponse.json(
      {
        id: checkUserData[0].id,
        email: checkUserData[0].email,
        message: 'Username has in database'
      },
      { status: StatusCodes.OK }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
