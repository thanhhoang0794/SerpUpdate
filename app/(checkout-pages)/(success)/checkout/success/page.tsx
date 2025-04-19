'use client'
import { Box, VStack, Image, Text, Flex, Center, HStack, Container } from '@chakra-ui/react'
import { useSearchParams, useRouter } from 'next/navigation'
import React from 'react'

function ThankForOderPage() {
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
            <Text>Thank you for your order!</Text>
            <Text fontWeight={700}>Your order number is: {orderId}</Text>
            <Text>If you have any questions, please contact us at support@udt.group</Text>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  )
}

export default ThankForOderPage
