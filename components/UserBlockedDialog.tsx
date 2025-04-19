'use client'
import { signOutAction } from '@/app/actions'
import { Box, VStack, Image, Text, Flex, Center, HStack, Container, Button } from '@chakra-ui/react'
import React from 'react'

function UserBlockedDialog() {
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
          <VStack fontSize="md" fontWeight="600" color="gray.900" align="center" gap={2}>
            <Text>Your account has been blocked. Please contact support@udt.group for more information.</Text>
            <Button colorPalette={'blue'} variant={'outline'} color={'primary.500'} onClick={() => signOutAction()}>
              Sign Out
            </Button>
          </VStack>
        </VStack>
      </VStack>
    </Container>
  )
}

export default UserBlockedDialog
