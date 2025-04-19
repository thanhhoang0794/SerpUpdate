'use client'
import { Box, VStack, Image, Text, Flex, Center, HStack } from "@chakra-ui/react";
import NextLink from 'next/link'
import { routes } from '@/utils/constant'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react';
import axios from 'axios';

function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const success = searchParams?.get('success');

  return (
    <>
      <VStack background="bg" shadow="md" borderRadius="2xl" padding={10} width="500px" minHeight={96}>
        <Box>
          <Image src="/image.svg" alt="Logo" width="250px" height="45px" />
        </Box>

        <VStack align="center" marginTop={6} w={"100%"} spaceY={6} textAlign="center">
          <Box>
            <Image src="/icon_mail_sent.svg" alt="Success" width="155px" height="auto" />
          </Box>
          <VStack fontSize="16px" fontWeight="600" color="gray.600" align="center" gap={0}>
            <Text>We’ve sent a verification email to:</Text>
            <Text width="full">{success}</Text>
          </VStack>
          <VStack fontSize="12px" fontWeight="400" color="gray.600" align="center" gap={0}>
            <Text>Click the link in your email to verify account. If you can’t</Text>
            <HStack width="full">find the email check your spam folder or<Text color="primary.500">
              click here to resend
            </Text></HStack>
          </VStack>
        </VStack>
      </VStack>
      <Center fontSize="12px" fontWeight="600" color="gray.600">
        After verifying your email!
        <NextLink href={routes.SIGNIN}>
          <Text color="primary.500" marginLeft={1}>
            Login
          </Text>
        </NextLink>
      </Center>
      
      
    </>
  )
}

export default VerifyEmailPage;
