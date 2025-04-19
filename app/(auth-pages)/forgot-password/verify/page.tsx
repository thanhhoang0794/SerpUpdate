'use client'

import { Container, Image } from '@chakra-ui/react'
import { Message } from '@/components/form-message'
import { VStack, Text } from '@chakra-ui/react'
import React from 'react'

export default function ForgotPasswordSuccess(props: { searchParams: Promise<Message> }) {
  return (
    <Container width={'500px'} boxShadow={'md'} backgroundColor={'white'} padding={10} borderRadius={'2xl'}>
      <VStack gap={10} justifyContent={'space-between'}>
        <Image src={'/image.svg'} alt={'Logo'} width={250} height={'auto'} />
        <Image src={'/ForgotPasswordSuccess.svg'} alt={'Success'} width={128} height={'auto'} />
        <VStack gap={2}>
          <Text textStyle={'md'} fontWeight={'600'} color={'gray.600'} lineHeight={'24px'}>
            Your request was successfully sent.
          </Text>
          <Text textStyle={'md'} fontWeight={'600'} color={'gray.600'} lineHeight={'24px'}>
            Please check your email and follow the instructions.
          </Text>
        </VStack>
      </VStack>
    </Container>
  )
}
