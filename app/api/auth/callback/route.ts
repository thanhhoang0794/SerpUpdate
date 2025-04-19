import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/campaigns'
  const redirectTo = searchParams.get("redirect_to")?.toString();

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 400 });
    }
    const { error: historyError } = await supabase
      .from('userLoginHistories')
      .insert({
        user_id: user?.id,
        user: user?.email,
        logged_in_at: new Date().toISOString(),
      })
    if (historyError) {
      console.error('Failed to track login history:', historyError)
    }
    if (!error) {
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (redirectTo) {
        return NextResponse.redirect(`${origin}${redirectTo}`)
      } else if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}