import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: Request) {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
            scopes: 'profile email',
        }
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }


    return NextResponse.json({
        data: data
    })
}
