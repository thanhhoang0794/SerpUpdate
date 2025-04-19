"use client"

import { Image, Center, VStack } from "@chakra-ui/react"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { yupResolver } from '@hookform/resolvers/yup'
import { emailRegularExpression } from '@/utils/utils'
import * as yup from 'yup'
import { useRouter, useSearchParams } from 'next/navigation'
import TextField from "@/components/TextField"
import { useState, useEffect } from 'react'
import { forgotPasswordAction } from "@/app/actions"
import { routes } from '@/utils/constant'
import Link from 'next/link'

type User = {
  email: string
}

// create schema validation
const schema = yup.object({
  email: yup
    .string()
    .required('Email is Required')
    .matches(emailRegularExpression, 'Please enter a valid email address in format: name@example.com'),
})

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false)
  const [serverErrors, setServerErrors] = useState<{ [key: string]: string }>({})

  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors }
  } = useForm<User>({
    resolver: yupResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onSubmit"
  })

  const errorMessage = searchParams?.get('error');

  useEffect(() => {
    if (errorMessage) {
      setError('email', { type: 'manual', message: errorMessage })
      const newSearchParams = new URLSearchParams(errorMessage)
      newSearchParams.delete('error')
      router.replace(`${routes.FORGOT_PASSWORD}?${newSearchParams.toString()}`)
    }
  }, [errorMessage, setError])

  const onSubmit = async (data: User) => {
    setLoading(true)
    setServerErrors({})
    await forgotPasswordAction(data)

    setLoading(false)
  }


  return (
    <VStack width={"500px"} height={"auto"} boxShadow="md" backgroundColor={"white"} padding={10} borderRadius="2xl">
      <Center>
        <Link href={routes.FORGOT_PASSWORD}>
          <Image src="/image.svg" alt="Logo" width="250px" height="45px" />
        </Link>
      </Center>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack minWidth="420px" minHeight={131} gap={0} marginTop={3} alignItems={"start"}>
          <TextField
            label="Email"
            placeholder="Enter your email"
            control={control}
            name="email"
            errors={errors.email}
          />

          <Button
            type="submit"
            width={"full"}
            marginTop={10}
            backgroundColor="primary.500"
            height={12}
            fontSize="lg"
            fontWeight="600"
            disabled={loading}
          >
            {loading ? 'Getting Password...' : 'Get Password'}
          </Button>
        </VStack>
      </form>
    </VStack>
  )
}
