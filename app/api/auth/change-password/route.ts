import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import joi from 'joi';
import validateForm from '@/utils/validateForm';
import { StatusCodes } from 'http-status-codes'

const passwordSchema = joi.object({
  currentPassword: joi.string().required(),
  newPassword: joi.string().min(6).required(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { currentPassword, newPassword } = await request.json();

    // Validate user input
    const validatedPassword = await validateForm({ currentPassword, newPassword }, passwordSchema);
    if (validatedPassword instanceof NextResponse) {
      return validatedPassword;
    }

    // Call the Supabase function to change the password
    const { data, error } = await supabase.rpc('change_user_password', {
      current_plain_password: currentPassword,
      new_plain_password: newPassword,
    });

    console.log(data, error)

    if (error) {
      console.error('Error changing password:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Change Password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR });
  }
}
