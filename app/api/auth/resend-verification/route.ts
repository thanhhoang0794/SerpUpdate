import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { StatusCodes } from 'http-status-codes';
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const supabase = await createClient();

    // Kiểm tra email có hợp lệ không
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Gửi lại email xác minh
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: 'temporary_password_for_resend',  // Mật khẩu tạm thời nếu cần thiết
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`, // Trang chuyển hướng sau khi xác minh
      }
    });

    if (error) {
      console.error("Error resending email:", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error) {
    console.error('Error resending verification email:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
