'use client'
import React from 'react'
import { Text, Flex, VStack, HStack } from '@chakra-ui/react'
import { BsBank } from 'react-icons/bs'
import AmericanExpress from '@/public/AmericanExpress.svg'
import JCB from '@/public/JCB.svg'
import MasterCard from '@/public/MasterCard.svg'
import Visa from '@/public/Visa.svg'
import Paypal from '@/public/Paypal.svg'
import Image from 'next/image'
import { RadioCardItem, RadioCardLabel, RadioCardRoot } from '@/components/ui/radio-card'

export default function PaymentMethods({
  value,
  handleChangeMethod
}: {
  value: String
  handleChangeMethod: Function
}) {
  return (
    <RadioCardRoot
      orientation={'horizontal'}
      justify={'center'}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeMethod(e.target.value)}
      size={'sm'}
    >
      <RadioCardLabel>
        <Text fontSize="sm" color={'gray.500'} fontWeight={'semibold'} alignSelf={'flex-start'}>
          Select your payment method
        </Text>
      </RadioCardLabel>
      <VStack gap={3} width="100%">
        <RadioCardItem
          value="bankTransfer"
          width="100%"
          borderRadius={'md'}
          borderColor={'gray.200'}
          borderWidth={'1px'}
          indicatorPlacement="start"
          label={
            <VStack
              justifyContent={'flex-start'}
              align={'flex-start'}
              width={'404px'}
              height={'100%'}
            >
              <HStack
                justifyContent={'space-between'}
                alignItems={'flex-start'}
                width={'100%'}
                height={'100%'}
              >
                <Text
                  color={'gray.700'}
                  justifySelf={'flex-start'}
                  verticalAlign={'top'}
                  paddingTop={1.5}
                  lineHeight={0}
                  alignSelf={'flex-start'}
                >
                  Manual bank transfer
                </Text>
                <Flex
                  alignSelf={'flex-start'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  borderRadius={'4px'}
                  borderColor={'gray.200'}
                  borderWidth={'0.5px'}
                  width={12}
                  height={8}
                  color={'primary.500'}
                >
                  <BsBank />
                </Flex>
              </HStack>
            </VStack>
          }
          description={
            value === 'bankTransfer' && (
              <Text color={'gray.600'} fontSize={'sm'} fontWeight={'500'}>
                Transfer after clicking Place order. We'll provide you the transfer details then.
              </Text>
            )
          }
        />
        <RadioCardItem
          value="creditCard"
          width="100%"
          borderRadius={'md'}
          borderColor={'gray.200'}
          borderWidth={'1px'}
          indicatorPlacement="start"
          label={
            <HStack justifyContent={'space-between'} alignItems={'flex-start'} width={'404px'}>
              <Text color={'gray.700'} verticalAlign={'top'} paddingTop={1.5} lineHeight={0}>
                Debit/Credit card
              </Text>
              <HStack>
                <Flex
                  alignItems={'center'}
                  justifyContent={'center'}
                  borderRadius={'4px'}
                  borderColor={'gray.200'}
                  borderWidth={'0.5px'}
                  width={12}
                  height={8}
                  color={'primary.500'}
                >
                  <Image src={Visa} alt="Visa" />
                </Flex>
                <Flex
                  alignItems={'center'}
                  justifyContent={'center'}
                  borderRadius={'4px'}
                  borderColor={'gray.200'}
                  borderWidth={'0.5px'}
                  width={12}
                  height={8}
                  color={'primary.500'}
                >
                  <Image src={MasterCard} alt="MasterCard" />
                </Flex>
                <Flex
                  alignItems={'center'}
                  justifyContent={'center'}
                  borderRadius={'4px'}
                  borderColor={'gray.200'}
                  borderWidth={'0.5px'}
                  width={12}
                  height={8}
                  color={'primary.500'}
                >
                  <Image src={AmericanExpress} alt="American Express" />
                </Flex>
                <Flex
                  alignItems={'center'}
                  justifyContent={'center'}
                  borderRadius={'4px'}
                  borderColor={'gray.200'}
                  borderWidth={'0.5px'}
                  width={12}
                  height={8}
                  color={'primary.500'}
                >
                  <Image src={JCB} alt="JCB" />
                </Flex>
              </HStack>
            </HStack>
          }
          description={
            value === 'creditCard' && (
              <Text color={'gray.600'} fontSize={'sm'} fontWeight={'500'}>
                Securely pay with your debit or credit card.
              </Text>
            )
          }
        />
        <RadioCardItem
          value="paypal"
          width="100%"
          borderRadius={'md'}
          borderColor={'gray.200'}
          borderWidth={'1px'}
          indicatorPlacement="start"
          label={
            <HStack justifyContent={'space-between'} alignItems={'flex-start'} width={'404px'}>
              <Text color={'gray.700'} verticalAlign={'top'} paddingTop={1.5} lineHeight={0}>
                Pay with Paypal
              </Text>
              <Flex
                alignItems={'center'}
                justifyContent={'center'}
                borderRadius={'4px'}
                borderColor={'gray.200'}
                borderWidth={'0.5px'}
                width={12}
                height={8}
                color={'primary.500'}
              >
                <Image src={Paypal} alt="PayPal" />
              </Flex>
            </HStack>
          }
        />
      </VStack>
    </RadioCardRoot>
  )
}
