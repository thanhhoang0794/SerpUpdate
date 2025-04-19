'use client'
import { Text, VStack } from '@chakra-ui/react'
import ReviewOrder from '../components/ReviewOrder'
import { useAtom } from 'jotai'
import { creditAtom, isEdittingAmountCredit } from '@/app/constant/atom'
import React from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
export default function Checkout() {
  const router = useRouter()
  const [creditValue, setCreditValue] = useAtom(creditAtom)
  const [isEditting, setIsEditting] = useAtom(isEdittingAmountCredit)
  if (!creditValue && !isEditting) {
    toast.error('Please enter the amount of credit', {
      duration: 3000,
      position: 'top-right',
      style: {
        borderLeft: '5px solid #E53E3E',
        padding: '12px 16px',
        color: 'gray.700',
        fontWeight: '700',
        fontSize: '16px',
        backgroundColor: '#FED7D7',
        borderRadius: '0'
      }
    })
    router.push('/credit')
  }

  return (
    <VStack
      borderRadius={'12px'}
      padding={5}
      backgroundColor={'white'}
      marginTop={14}
      width={'500px'}
      gap={5}
      height={'fit-content'}
    >
      <Text fontSize={'xl'} fontWeight={'600'}>
        Checkout
      </Text>
      <ReviewOrder />
    </VStack>
  )
}
