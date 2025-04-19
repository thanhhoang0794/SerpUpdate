'use client'
import { VStack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import ProfileForm from './components/ProfileForm'
import AffiliateForm from './components/AffiliateForm'
import PasswordForm from './components/PasswordForm'
import Loading from '@/components/ui/loading'
import { passwordSchema, profileSchema } from './schemas'
import { updateUserPassword, updateUserProfile } from './actions'
import { updateUserAffiliate } from './actions'

// Define a new type for the form values
export type ProfileFormValues = {
  avatar?: string
  username?: string
  email?: string
  registrationDate?: string
}
export type AffiliateFormValues = {
  affiliatePasscode?: string
  accountBank: string
  bank: string
  city: string
  branch: string
  bankName: string
}
export type PasswordFormValues = {
  currentPassword: string
  password: string
  confirmPassword: string
}

function Page() {
  const [isLoading, setIsLoading] = useState(true) // Thêm trạng thái loading
  const [isEdited, setIsEdited] = useState({
    profile: false,
    affiliate: false,
    password: false
  })
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const [uid, setUid] = useState('');

  const [defaultValues, setDefaultValues] = useState({
    profile: { avatar: '', username: '', email: '', registrationDate: '' },
    affiliate: { affiliatePasscode: '', accountBank: '', bank: '', city: '', branch: '', bankName: '' },
    password: { currentPassword: '', password: '', confirmPassword: '' }
  })

  // New state to track last saved values
  const [lastSavedValues, setLastSavedValues] = useState<{
    profile: ProfileFormValues
    affiliate?: AffiliateFormValues
    password?: PasswordFormValues
  }>(defaultValues)

  const [userProfile, setUserProfile] = useState<ProfileFormValues>(defaultValues.profile)
  const [userAffiliate, setUserAffiliate] = useState<AffiliateFormValues>(defaultValues.affiliate);
  const [userPassword, setUserPassword] = useState<PasswordFormValues>(defaultValues.password);

  const profileForm = useForm<ProfileFormValues>({
    defaultValues: defaultValues.profile,
    resolver: yupResolver(profileSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })
  const affiliateForm = useForm<AffiliateFormValues>({
    defaultValues: defaultValues.affiliate,
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })
  const passwordForm = useForm<PasswordFormValues>({
    defaultValues: defaultValues.password,
    resolver: yupResolver(passwordSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  const fetchUserProfile = async () => {
    try {
      const origin = window?.location?.origin;
      const response = await fetch(`${origin}/api/users`)
      const { auth, profile } = await response.json();

      if (!auth || !profile) {
        throw new Error('Failed to fetch user profile')
      }
      setUid(auth.id);
      setIsGoogleLogin(auth.app_metadata.provider === 'google' ? true : false);

      const formattedDate = new Date(auth.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })

      // Cập nhật default values và state
      const fetchedValues = {
        profile: {
          avatar: profile.image_url,
          username: isGoogleLogin ? auth.user_metadata.full_name : auth.user_metadata.username,
          email: isGoogleLogin ? auth.user_metadata.email : auth.user_metadata.email,
          registrationDate: formattedDate
        },
        affiliate: {
          affiliatePasscode: profile.affiliate_id,
          accountBank: profile.bank_account_number,
          bank: profile.bank_code,
          branch: profile.bank_branch,
          city: profile.bank_city_or_province,
          bankName: profile.bank_name
        },
        password: defaultValues.password
      }

      setDefaultValues(fetchedValues)
      setLastSavedValues(fetchedValues)
      setUserProfile(fetchedValues.profile)
      setUserAffiliate(fetchedValues.affiliate);
      setUserPassword(fetchedValues.password);

      // Reset form với default values mới
      profileForm.reset(fetchedValues.profile)
      affiliateForm.reset(fetchedValues.affiliate);
      passwordForm.reset(fetchedValues.password);
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setIsLoading(false) // Kết thúc loading
    }
  }
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const handleCancel = (box: 'profile' | 'affiliate' | 'password') => {
    const forms = { profile: profileForm, affiliate: affiliateForm, password: passwordForm }
    forms[box].reset(lastSavedValues[box])
    setIsEdited(prev => ({ ...prev, [box]: false }))
  }
  const handleSave = async (box: 'profile' | 'affiliate' | 'password', data: any) => {
    if (box === 'profile') {
      setUserProfile(data)
      await updateUserProfile(data, uid)
    } else if (box === 'affiliate') {
      setUserAffiliate(data);
      await updateUserAffiliate(data, uid)
    } else if (box === 'password') {
      setUserPassword(data);
      const errorMessage = await updateUserPassword(data, uid);
      if (errorMessage) {
        return errorMessage; // Return the error message
      }
    }

    // Update last saved values
    setLastSavedValues(prev => ({ ...prev, [box]: data }))

    toast.success(
      <div>
        <span style={{ fontWeight: '700' }}>
          {`${box.charAt(0).toUpperCase() + box.slice(1)} updated successfully!`}
        </span>
        <br />
        <span style={{ fontWeight: '400' }}>Your profile has been updated</span>
      </div>,
      {
        duration: 3000,
        position: 'top-right',
        style: {
          borderLeft: '5px solid #38A169',
          padding: '12px 16px',
          color: '#2D3748',
          fontWeight: '700',
          fontSize: '16px',
          marginTop: '40px',
          backgroundColor: '#C6F6D5',
          borderRadius: '0'
        },
        iconTheme: {
          primary: '#38A169',
          secondary: 'white'
        }
      }
    )

    // Reset form state to disable Save button
    const forms = { profile: profileForm, affiliate: affiliateForm, password: passwordForm }
    forms[box].reset(data)

    setIsEdited(prev => ({ ...prev, [box]: false }))
    return null;
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack
      width="940px"
      height={'max-content'}
      alignSelf="flex-start"
      spaceY={5}
      paddingLeft={6}
      overflowY="auto"
      scrollBehavior="smooth"
      marginBottom={15}
      css={{
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      <ProfileForm
        userProfile={userProfile}
        isGoogleLogin={isGoogleLogin}
        uid={uid}
        handleSave={handleSave}
        setIsEdited={setIsEdited}
      />
      <AffiliateForm
        userAffiliate={userAffiliate}
        handleSave={handleSave}
        setIsEdited={setIsEdited}
        isEdited={isEdited}
        handleCancel={handleCancel}
      />
      {!isGoogleLogin && (
        <PasswordForm
          userPassword={userPassword}
          handleSave={handleSave}
          setIsEdited={setIsEdited}
          isEdited={isEdited}
          handleCancel={handleCancel}
        />
      )}
    </VStack>
  )
}

export default Page
