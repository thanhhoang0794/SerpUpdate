import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import joi from 'joi';
import validateForm from '@/utils/validateForm';
import { StatusCodes } from 'http-status-codes';

const userSchema = joi.object({
  email: joi.string().email().required(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { email } = await request.json();

    // Validate user input
    const validatedUser = await validateForm({ email }, userSchema);
    if (validatedUser instanceof NextResponse) {
      return validatedUser;
    }

    // Check if the email already exists in `public.users`
    const { data: emailExists, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();  // Sử dụng .single() để nhận một đối tượng thay vì một mảng

    // Nếu email không tồn tại, thông báo rằng email không tồn tại
    if (!emailExists) {
      return NextResponse.json(
        { error: 'Email does not exist.' },
        { status: 404 }
      );
    }

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError);
      return NextResponse.json({ error: 'Error checking email' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }

    // TODO: Add code to send verification email with reset link
    // Ví dụ: await sendResetPasswordEmail(email);

    return NextResponse.json({
      email,
      message: 'Successfully Forgot Password! Please check your email for verification link.'
    }, { status: 200 });

  } catch (error) {
    console.error('Forget Password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
