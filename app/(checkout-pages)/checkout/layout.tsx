import HeaderCheckout from '@/components/HeaderCheckout'
import { Flex, HStack, VStack } from '@chakra-ui/react'
import React from 'react'

export default async function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderCheckout />
      <Flex width={'100%'} minHeight={'100vh'} backgroundColor="#EDF2F7" alignItems={'center'} justifyContent={'center'}>
        {children}
      </Flex>
    </>
  )
}
