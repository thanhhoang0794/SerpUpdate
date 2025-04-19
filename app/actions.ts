'use server'

import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextResponse } from 'next/server'

type UserLogin = {
  username: string
  password: string
}

type UserSignUp = {
  username: string
  password: string
  email: string
}

type UserForgotPassword = {
  email: string
}

type UserResetPassword = {
  password: string
  confirmPassword: string
}

async function encodedRedirect(type: 'error' | 'success', path: string, message: string) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`)
}

export async function signUpAction(data: UserSignUp) {
  const { email, username, password } = data
  const origin = headers().get('origin')
  const rawIp =
    headers().get('x-forwarded-for')?.split(',')[0] ||
    headers().get('x-real-ip') ||
    headers().get('cf-connecting-ip') ||
    headers().get('x-client-ip') ||
    '0.0.0.0'
  const ip = rawIp.includes('::ffff:') ? rawIp.split('::ffff:')[1] : rawIp
  try {
    const response = await fetch(`${origin}/api/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, username, password, ip })
    })

    if (!response.ok && response.status >= 500) {
      throw new Error('Server error')
    }

    const result = await response.json()
    if (result?.error) {
      return encodedRedirect('error', '/sign-up', result?.error)
    }

    const responseIp = await fetch(`https://ipinfo.io/${ip}/json?token=2c8261bdc7bd06`, {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'GET'
    })
    const supabase = await createClient()
    const resultIp = await responseIp.json()

    if (resultIp?.country !== null && resultIp?.country !== undefined) {
      const { data: ipData, error: ipError } = await supabase.from('registerLogs').insert({
        ip: ip,
        email: email,
        hostname: resultIp?.hostname,
        country: resultIp?.country,
        city: resultIp?.city,
        region: resultIp?.region,
        timezone: resultIp?.timezone,
        org: resultIp?.org,
        postal: resultIp?.postal,
        loc: resultIp?.loc
      })
      if (ipError) {
        return NextResponse.json({ error: 'Error inserting ip data' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`,
        data: { email, username }
      }
    })

    if (error) {
      return encodedRedirect('error', '/sign-up', error.message)
    }

    // success: true,
    return encodedRedirect('success', '/sign-up/verify', email)
  } catch (error) {
    console.error('Lỗi trong quá trình đăng ký:', error)
    return encodedRedirect('error', '/sign-up', 'đã tồn tại')
  }
}

export async function signInOrSignUpByGoogle(type: 'sign-in' | 'sign-up') {
  let redirectUrl = ''
  try {
    const supabase = await createClient()
    const origin = (await headers()).get('origin')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/api/auth/callback`
      }
    })
    if (error) {
      return encodedRedirect('error', `/${type}`, error.message)
    }
    redirectUrl = data.url
  } catch (error) {
    console.log(error)
  } finally {
    if (!redirectUrl) {
      return encodedRedirect('error', `/${type}`, 'Failed to generate redirect URL.')
    }
    return redirect(redirectUrl)
  }
}

export async function signInAction(data: UserLogin) {
  try {
    const { username, password } = data
    const origin = (await headers()).get('origin')

    const response = await fetch(`${origin}/api/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    const result = await response.json()

    if (result?.error) {
      return encodedRedirect('error', '/sign-in', result?.error)
    }

    const email = result.email
    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return encodedRedirect('error', '/sign-in', 'Password is incorrect')
    }

    const { error: historyError } = await supabase.from('userLoginHistories').insert({
      user_id: result.id,
      user: username,
      logged_in_at: new Date().toISOString()
    })
    if (historyError) {
      console.error('Failed to track login history:', historyError)
    }
    return encodedRedirect('success', '/dashboard', 'Signed-in-successfully')
  } catch (error) {
    console.log(error)
  }
}

export async function forgotPasswordAction(data: UserForgotPassword) {
  const { email } = data
  const supabase = await createClient()
  const origin = (await headers()).get('origin')

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required')
  }

  // Kiểm tra xem email có tồn tại trong cơ sở dữ liệu hay không
  const { data: userExists, error: emailCheckError }: { data: any; error: any } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (!userExists) {
    return encodedRedirect('error', '/forgot-password', 'This email does not exist!')
  }

  if (emailCheckError) {
    console.error(emailCheckError.message)
    return encodedRedirect('error', '/forgot-password', 'Error checking email')
  }

  // Gọi Supabase để gửi email đặt lại mật khẩu
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/reset-password`
  })

  if (error) {
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }

  return encodedRedirect('success', '/forgot-password/verify', 'Check your email for a link to reset your password.')
}

export async function resetPasswordAction(data: UserResetPassword) {
  const { password } = data
  console.log(data)
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return encodedRedirect('error', '/reset-password', error.message)
  }

  return encodedRedirect('success', '/reset-password/success', 'Password updated')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/sign-in')
}
