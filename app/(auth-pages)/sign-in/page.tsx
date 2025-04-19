'use client'
import { Box, Link as ChakraLink, Container, Image, HStack, Separator } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Message } from '@/components/form-message'
import { Button } from '@/components/ui/button'
import { VStack, Fieldset, Input, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { routes } from '@/utils/constant'
import { useEffect, useState } from 'react'
import { PasswordInput } from '@/components/ui/password-input'
import { IoLogoGoogle } from 'react-icons/io5'
import { signInAction, signInOrSignUpByGoogle } from '@/app/actions'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

type User = {
  username: string
  password: string
}

export default function Login(props: { searchParams: Promise<Message> }) {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<User>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  useEffect(() => {
    if (searchParams?.has('error')) {
      const errorMessage = searchParams.get('error')
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
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('error')
      router.replace(`?${newSearchParams.toString()}`)
    }
  }, [searchParams, router])

  const onSubmit = async (data: User) => {
    setLoading(true)
    await signInAction(data)
    setLoading(false)
  }

  return (
    <Container width={'500px'} boxShadow={'md'} backgroundColor={'white'} padding={10} borderRadius={'2xl'}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Fieldset.Root>
          <VStack gap={10} justifyContent={'space-between'}>
            <Image src={'/image.svg'} alt={'Logo'} width={250} height={'auto'} />
            <VStack gap={5} width={'100%'}>
              <Button
                type={'button'}
                w={'100%'}
                backgroundColor={'gray.100'}
                _hover={{ backgroundColor: 'gray.200' }}
                height={12}
                size={'lg'}
                fontSize={'lg'}
                fontWeight={'400'}
                color={'gray.800'}
                paddingX={6}
                onClick={async () => await signInOrSignUpByGoogle('sign-in')}
              >
                <IoLogoGoogle width={3} height={3} /> Continue with Google
              </Button>

              <HStack width={'100%'}>
                <Separator />
                <Text flexShrink={'0'} color={'gray.500'} fontSize={'sm'} margin={'0 20px'}>
                  Or
                </Text>
                <Separator />
              </HStack>
              <VStack gap={2} width={'100%'}>
                <Text textStyle={'md'} alignSelf={'flex-start'} fontWeight={'500'} color={'gray.700'}>
                  Username
                </Text>
                <Input
                  color={errors.username ? 'red.500' : 'gray.700'}
                  borderColor={errors.username ? 'red.500' : 'gray.200'}
                  _focus={
                    errors.username
                      ? { borderColor: 'red.500', outlineColor: 'red.500', color: 'gray.700' }
                      : { borderColor: 'gray.200' }
                  }
                  type="text"
                  size={'md'}
                  variant={'outline'}
                  placeholder={'Enter username'}
                  {...register('username', {
                    required: 'Username is required'
                  })}
                />
                {errors.username && (
                  <Text alignSelf={'flex-start'} color={'red.500'}>
                    {String(errors.username.message)}
                  </Text>
                )}
              </VStack>
              <VStack gap={3} width={'100%'}>
                <VStack gap={2} width={'100%'}>
                  <Text textStyle={'md'} alignSelf={'flex-start'} fontWeight={'500'} color={'gray.700'}>
                    Password
                  </Text>
                  <PasswordInput
                    color={errors.password ? 'red.500' : 'gray.700'}
                    borderColor={errors.password ? 'red.500' : 'gray.200'}
                    _focus={
                      errors.password
                        ? { borderColor: 'red.500', outlineColor: 'red.500', color: 'gray.700' }
                        : { borderColor: 'gray.200' }
                    }
                    type="password"
                    size={'md'}
                    variant={'outline'}
                    placeholder="Enter password"
                    {...register('password', {
                      required: 'Password is required'
                    })}
                  />
                  {errors.password && (
                    <Text alignSelf={'flex-start'} color={'red.500'}>
                      {String(errors.password.message)}
                    </Text>
                  )}
                </VStack>
                <Box alignSelf={'flex-start'}>
                  <NextLink href={routes.FORGOT_PASSWORD}>
                    <Text textStyle={'md'} fontWeight="500" color={'primary.500'} _hover={{ color: 'primary.600' }}>
                      Forget password?
                    </Text>
                  </NextLink>
                </Box>
              </VStack>
            </VStack>
            <VStack gap={3} width={'100%'}>
              <Button
                width={'100%'}
                size={'lg'}
                backgroundColor={'primary.500'}
                borderRadius={'md'}
                paddingX={6}
                type="submit"
                _hover={{ backgroundColor: 'primary.600' }}
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </Button>

              <HStack mt={2} justifyContent="center" spaceX={1} fontSize="18px" fontWeight="400">
                Don’t have an account?
                <NextLink href={routes.SIGNUP}>
                  <Text fontWeight="600" color="gray.800" _hover={{ color: 'gray.600' }}>
                    Sign up
                  </Text>
                </NextLink>
              </HStack>
            </VStack>
          </VStack>
        </Fieldset.Root>
      </form>
    </Container>
  )
}
