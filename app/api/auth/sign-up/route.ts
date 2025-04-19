import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import joi from 'joi';
import validateForm from '@/utils/validateForm';
import { StatusCodes } from 'http-status-codes'

const userSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  username: joi.string().required().trim().strict()
});

const ipSchema = joi.object({
  ip: joi.string().required()
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { email, password, username, ip } = await request.json();
    // Validate user input
    const validatedUser = await validateForm({ email, password, username }, userSchema);
    const validatedIp = await validateForm({ ip }, ipSchema);
    if (validatedUser instanceof NextResponse) {
      return validatedUser;
    }
    if (validatedIp instanceof NextResponse) {
      return validatedIp;
    }

    const { data: ipExists, error: ipCheckError } = await supabase
      .from('registerLogs')
      .select('id')
      .eq('ip', ip)

    if (ipExists && ipExists?.length >= 3) {
      return NextResponse.json(
        { error: 'Too many requests from this IP.' },
        { status: StatusCodes.TOO_MANY_REQUESTS }
      );
    }

    const { data: usernameExists, error: usernameCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)

    if (usernameCheckError) {
      console.error('Error checking username:', usernameCheckError);
      return NextResponse.json({ error: 'Error checking username' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }

    if (usernameExists.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists.' },
        { status: StatusCodes.CONFLICT }
      );
    }

    const { data: emailExists, error: emailCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)

    if (emailCheckError) {
      console.error('Error checking email:', emailCheckError);
      return NextResponse.json({ error: 'Error checking email' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
    }

    if (emailExists.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists.' },
        { status: StatusCodes.CONFLICT }
      );
    }

    return NextResponse.json({
      email,
      message: 'Successfully signed up! Please check your email for verification.'
    }, { status: StatusCodes.OK });



  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}


