'use client'

import { Button, Box, Image, HStack, VStack, Text, Separator, Flex } from '@chakra-ui/react'
import { FaGoogle } from 'react-icons/fa'
import TextField from '@/components/TextField'
import CheckboxField from '@/components/CheckboxField'
import { useForm, SubmitHandler } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { emailRegularExpression, passwordRegularExpression, usernameRegularExpression } from '@/utils/utils'
import TextFieldPassword from '@/components/TextFieldPassword'
import { useState, useEffect, useRef } from 'react'
import NextLink from 'next/link'
import { routes } from '@/utils/constant'
import ReCAPTCHA from 'react-google-recaptcha'
import { signUpAction, signInOrSignUpByGoogle } from '@/app/actions'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import { toast } from 'react-hot-toast'

type User = {
  username: string
  email: string
  password: string
  confirmPassword: string
  privacy: boolean
}

// create schema validation
const schema = yup.object({
  username: yup
    .string()
    .required('Username is Required')
    .matches(usernameRegularExpression, 'Username cannot contain special characters'),
  email: yup
    .string()
    .required('Email is Required')
    .matches(emailRegularExpression, 'Please enter a valid email address in format: name@example.com'),
  password: yup
    .string()
    .required('Password is Required')
    .matches(
      passwordRegularExpression,
      'Please enter a valid password. Minimum eight characters, at least one letter, one number and one special character'
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), undefined], 'Both password didn’t match')
    .required('Confirm password is Required'),
  privacy: yup.bool().oneOf([true], 'You must accept the terms and conditions').required()
})

function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({})
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const captchaRef = useRef<HCaptcha>(null)

  const {
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors }
  } = useForm<User>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      privacy: false
    },
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  const handleCaptchaChange = (value: string | null) => {
    setCaptchaToken(value)
  }

  const errorMessage = searchParams?.get('error')


  useEffect(() => {
    if (errorMessage && searchParams) {
      if (errorMessage.includes('Username')) {
        setError('username', { type: 'manual', message: errorMessage })
      }
      if (errorMessage.includes('Email')) {
        setError('email', { type: 'manual', message: errorMessage })
      }
      toast.error(errorMessage, {
        duration: 3000,
        position: 'top-right',
        style: {
          marginTop: '30px',
          borderLeft: '5px solid #E53E3E',
          padding: '12px 16px',
          color: 'gray.700',
          fontWeight: '700',
          fontSize: '16px',
          backgroundColor: '#FED7D7',
          borderRadius: '0'
        }
      })
      const newSearchParams = new URLSearchParams(searchParams.toString())
      newSearchParams.delete('error')
      router.replace(`${routes.SIGNUP}?${newSearchParams.toString()}`)
    }
  }, [errorMessage, setError])

  async function onSubmit(data: User) {
    setLoading(true)
    setServerErrors({})
    try {
      await signUpAction(data)
      if (!errorMessage) {
        return null
      }
      captchaRef.current?.resetCaptcha()
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  return (
    <HStack
      width="max-content"
      height="auto"
      background="bg"
      shadow="md"
      borderRadius="xl"
      padding={10}
      alignItems="start"
      gapX={10}
      marginY={10}
    >
      <VStack align="start">
        <Link href={routes.SIGNUP}>
          <Image src="/image.svg" alt="Logo" width="250px" height="45px" />
          <Text color="primary.500" fontSize={'md'} fontWeight="500">
            Sign Up for Free!
          </Text>
        </Link>
      </VStack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box minWidth="420px" maxWidth={"421px"} minHeight={131} display="flex" flexDirection="column">
          <Button type="button" backgroundColor="gray.100" height={12} fontSize="lg" fontWeight="400" color="gray.800" onClick={async () => await signInOrSignUpByGoogle("sign-up")}>
            <FaGoogle color="red" /> Sign up with Google
          </Button>
          <HStack marginTop={5}>
            <Separator />
            <Text flexShrink="0" color="gray.500" fontSize={'sm'}>
              Or sign up with email
            </Text>
            <Separator />
          </HStack>
          <TextField
            label="Username"
            placeholder="Enter your username"
            control={control}
            name="username"
            errors={errors.username}
          />
          <TextField
            label="Email"
            placeholder="Enter your email"
            control={control}
            name="email"
            errors={errors.email}
          />
          <TextFieldPassword
            label="Password"
            placeholder="Minimum 8 characters"
            control={control}
            name="password"
            errors={errors.password}
          />
          <TextFieldPassword
            label="Confirm password"
            placeholder="Confirm password"
            control={control}
            name="confirmPassword"
            errors={errors.confirmPassword}
          />
          <Flex justifyContent="start" marginTop={10}>
            <Box>
              <HCaptcha
                ref={captchaRef}
                sitekey={process.env.HCAPTCHA_SITE_KEY!}
                onVerify={(token) => {
                  setCaptchaToken(token)
                }}
              />
            </Box>
          </Flex>
          <CheckboxField
            control={control}
            name="privacy"
            errors={errors.privacy ? errors.privacy : undefined}
          />
          <Button
            type="submit"
            marginTop={2.5}
            backgroundColor="primary.500"
            height={12}
            fontSize="lg"
            fontWeight="600"
            disabled={!captchaToken || loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
          <HStack mt={4} justifyContent="center" spaceX={1} fontSize="18px" fontWeight="400">
            Already a user?
            <NextLink href={routes.SIGNIN}>
              <Text fontWeight="600" color="gray.800">
                Login
              </Text>
            </NextLink>
          </HStack>
        </Box>
      </form>
    </HStack>
  )
}

export default RegisterForm
