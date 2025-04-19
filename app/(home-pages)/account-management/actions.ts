import { ProfileFormValues, AffiliateFormValues, PasswordFormValues } from './page'
import { signOutAction } from '@/app/actions'

export const updateUserProfile = async (data: ProfileFormValues, uid: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users`, {
      method: 'PUT',
      body: JSON.stringify({
        id: uid,
        image_url: data.avatar
      })
    })
    if (!response.ok) {
      throw new Error('Failed to update user profile')
    }
    const updatedData = await response.json()
    console.log(updatedData)
  }

export const updateUserAffiliate = async (data: AffiliateFormValues, uid: string) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/users`, {
      method: 'PUT',
      body: JSON.stringify({
        id: uid,
        bank_account_number: data.accountBank,
        bank_code: data.bank,
        bank_branch: data.branch,
        bank_city_or_province: data.city,
        bank_name: data.bankName
      })
    })
    if (!response.ok) {
      throw new Error('Failed to update user affiliate')
    }
  }

export const updateUserPassword = async (data: PasswordFormValues, uid: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);

        // Handle different types of errors
        switch (errorData.error) {
          case 'incorrect password':
            return 'Incorrect current password';
          case 'New password should be different from the old password.':
            return 'New password must be different from current password';
          default:
            return errorData.error || 'Failed to update password';
        }
      }

      // If successful
      signOutAction();
      return null;
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      return 'Failed to update password: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
  }