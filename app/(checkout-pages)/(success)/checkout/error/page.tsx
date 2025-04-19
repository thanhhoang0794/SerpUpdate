'use client'
import { Box, VStack, Image, Text, Container } from '@chakra-ui/react'
import React from 'react'
import { useSearchParams } from 'next/navigation'

function FailedPage() {
  const orderId = useSearchParams()?.get('orderId') || ''
  return (
    <Container display={'flex'} justifyContent="center" paddingTop={'200px'}>
      <VStack background="bg" shadow="md" borderRadius="2xl" padding={10} width="500px" maxHeight={'408px'} gap={2.5}>
        <Box>
          <Image src="/image.svg" alt="Logo" width="250px" height="45px" />
        </Box>

        <VStack align="center" width={'100%'} spaceY={6} marginTop={10} textAlign="center">
          <Box>
            <Image src="/thank-for-order.svg" alt="Success" width="108px" height="auto" />
          </Box>
          <VStack fontSize="md" fontWeight="600" color="gray.900" align="center" gap={0}>
            <Text>Your transaction is cancelled!</Text>
            <Text>Your order number is: {orderId}</Text>
            <Text>If you have any questions, please contact us at support@udt.group</Text>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  )
}

export default FailedPage
