import { Button, HStack, Separator, Text, VStack, Input } from '@chakra-ui/react'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { MdEdit } from 'react-icons/md'
import { useAtom } from 'jotai'
import { creditAtom, isEdittingAmountCredit } from '@/app/constant/atom'
import { convertValue } from '@/utils/convertCredit'
import { useRouter } from 'next/navigation'
import { handleMakeInvoice } from '../action'
import { fetchCreateTransaction, handlePayment } from '../api'
import { getCurrencyRate } from '@/utils/getCurrencyRate'
import PaymentProcessing from './PaymentProcessing'
import { fetchPrice } from '@/app/(home-pages)/credit/api'
export default function ReviewOrder() {
  const [creditValue, setCreditValue] = useAtom(creditAtom)
  const [isProcessing, setIsProcessing] = useState(false)
  const [tempCreditValue, setTempCreditValue] = useState(0)
  const [isEditting, setIsEditting] = useAtom(isEdittingAmountCredit)
  const [totalMoneyValue, setTotalMoneyValue] = useState(0)
  const router = useRouter()
  const [priceData, setPriceData] = useState<any>([])
  const [bonusPercentage, setBonusPercentage] = useState(0)
  const [bonusCredit, setBonusCredit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)

  async function handlePlaceOrder() {
    if (!creditValue || !totalMoneyValue) {
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
      return
    } else {
      try {
        setIsProcessing(true)
        const rate = await getCurrencyRate()
        const finalValue = Math.round(totalMoneyValue * rate * 100).toString()
        const date = Date.now()
        const vpc_MerTxnRef = `TEST_${date}`

        toast.promise(
          handleMakeInvoice('Credit', finalValue, vpc_MerTxnRef).then(async result => {
            await handlePayment(result)
          }),
          {
            loading: 'Creating invoice...',
            success: 'Invoice created successfully',
            error: 'Failed to create invoice'
          }
        )
        await fetchCreateTransaction(finalValue, vpc_MerTxnRef, creditValue)
      } catch (error) {
        setIsProcessing(false)
        toast.error('Payment failed. Please try again.')
      }
    }
  }

  let isTempCreditEqualToCreditValue = tempCreditValue === creditValue
  function handleAddVoucher() {
    toast.error('Discount voucher currently not available', {
      duration: 1500,
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
  }

  function calculateBonusPercentage(creditAmount: number) {
    const sortedPrices = [...priceData].sort((a, b) => a.total_credits - b.total_credits)
    let bonusPercentage = 0
    for (const price of sortedPrices) {
      if (creditAmount >= price.total_credits) {
        bonusPercentage = price.percent_bonus
      } else {
        break
      }
    }
    return bonusPercentage
  }

  function handleConvertCreditToMoney() {
    const bonusPercentage = calculateBonusPercentage(creditValue)
    const bonusCredit = creditValue * (bonusPercentage / 100)
    const totalCredit = creditValue + bonusCredit
    setBonusPercentage(bonusPercentage)
    setBonusCredit(bonusCredit)
    setTotalCredit(totalCredit)
    setTotalMoneyValue(convertValue(creditValue))
  }

  function handleUpdateCredit() {
    setIsEditting(!isEditting)
    setTempCreditValue(creditValue)
    handleConvertCreditToMoney()
  }
  function handleCancelUpdateCredit() {
    setCreditValue(tempCreditValue)
    setIsEditting(!isEditting)
    handleConvertCreditToMoney()
  }

  function handleSaveCredit() {
    if (creditValue < 5000 || typeof creditValue !== 'number' || creditValue % 5000 !== 0) {
      toast.error(creditValue % 5000 !== 0 ? 'Amount must be a multiple of 5000' : 'Minimum credit value is 5000', {
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
      setCreditValue(tempCreditValue)
      setIsEditting(!isEditting)
      return
    }
    toast.success('Credit updated successfully', {
      duration: 3000,
      position: 'top-right',
      style: {
        borderLeft: '5px solid #38A169',
        padding: '12px 16px',
        color: 'gray.700',
        fontWeight: '700',
        fontSize: '16px',
        backgroundColor: '#C6F6D5',
        borderRadius: '0'
      }
    })
    setIsEditting(!isEditting)
    handleConvertCreditToMoney()
  }
  useEffect(() => {
    fetchPrice().then(res => {
      setPriceData(res.data)
      handleConvertCreditToMoney()
    })
  }, [])
  useEffect(() => {
    isTempCreditEqualToCreditValue = tempCreditValue === creditValue
    handleConvertCreditToMoney()
  }, [creditValue,priceData])
  if (isProcessing) {
    return <PaymentProcessing />
  }
  return (
    <VStack gap={4} alignItems={'flex-end'}>
      <VStack gap={2} width={'100%'}>
        <HStack gap={2} justifyContent={'space-between'} width={'100%'} paddingY={2}>
          <Text fontSize={'sm'} fontWeight={'600'} color={'gray.500'}>
            Amount of credit
          </Text>
          {isEditting && creditValue > 0 ? (
            <Input
              size={'sm'}
              placeholder="Enter your credit"
              type="number"
              min={1000}
              max={100000}
              step={100}
              width={'380px'}
              color={'gray.700'}
              paddingX={3}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setCreditValue(Number(e.target.value))
              }}
            />
          ) : (
            <Text fontSize={'sm'} fontWeight={'500'} color={'gray.900'}>
              {creditValue ? `x ${creditValue}` : '0'}
            </Text>
          )}
        </HStack>
        {!isEditting && (
          <HStack gap={2} justifyContent={'space-between'} width={'100%'} paddingY={2}>
            <Text fontSize={'sm'} fontWeight={'600'} color={'gray.500'}>
              Bonus credit ({bonusPercentage}%)
            </Text>
            <Text fontSize={'sm'} fontWeight={'500'} color={'gray.900'}>
              {`x ${bonusCredit}`}
            </Text>
          </HStack>
        )}
        {!isEditting && (
          <HStack gap={2} justifyContent={'space-between'} width={'100%'} paddingY={2}>
            <Text fontSize={'sm'} fontWeight={'600'} color={'gray.500'}>
              Total credit
            </Text>
            <Text fontSize={'sm'} fontWeight={'500'} color={'gray.900'}>
              x {totalCredit}
            </Text>
          </HStack>
        )}
        {!isEditting && (
          <HStack gap={2} justifyContent={'space-between'} width={'100%'} paddingY={2}>
            <Text fontSize={'sm'} fontWeight={'600'} color={'gray.500'}>
              Sub total
            </Text>
            <Text fontSize={'sm'} fontWeight={'500'} color={'gray.900'}>
              {totalMoneyValue ? `$${totalMoneyValue}` : '0'}
            </Text>
          </HStack>
        )}

        {isEditting ? (
          <HStack width={'100%'} justifyContent={'flex-end'} gap={4}>
            <Button
              variant={'solid'}
              size="sm"
              backgroundColor={'gray.100'}
              paddingX={3}
              borderRadius={'md'}
              gap={2}
              onClick={handleCancelUpdateCredit}
            >
              <Text fontSize={'sm'} color={'gray.800'}>
                Cancel
              </Text>
            </Button>
            <Button
              disabled={isTempCreditEqualToCreditValue}
              backgroundColor={'primary.500'}
              paddingX={3}
              borderRadius={'sm'}
              gap={2}
              size="sm"
              onClick={handleSaveCredit}
            >
              <Text fontSize={'sm'} color={'white'}>
                Save
              </Text>
            </Button>
          </HStack>
        ) : (
          <Button
            variant={'outline'}
            size={'sm'}
            color={'primary.500'}
            fontSize={'sm'}
            fontWeight={'600'}
            borderRadius={'md'}
            alignSelf={'flex-end'}
            paddingX={3}
            borderColor={'primary.500'}
            borderWidth={'1px'}
            onClick={handleUpdateCredit}
          >
            <MdEdit /> Update
          </Button>
        )}
      </VStack>
      <Separator />
      <HStack gap={2}>
        <VStack gap={2}>
          <Text fontSize={'md'} fontWeight={'600'} color={'gray.700'} alignSelf={'flex-start'}>
            Discount code
          </Text>
          <Input
            size={'sm'}
            placeholder="Enter your code to get discount"
            width={'380px'}
            color={'gray.700'}
            paddingX={3}
          />
        </VStack>
        <Button
          disabled={isEditting}
          variant={'outline'}
          size={'sm'}
          color={'primary.500'}
          fontSize={'sm'}
          fontWeight={'600'}
          borderRadius={'md'}
          borderColor={'primary.500'}
          borderWidth={'1px'}
          alignSelf={'flex-end'}
          onClick={handleAddVoucher}
        >
          Apply
        </Button>
      </HStack>
      <Separator />
      <HStack
        justifyContent={'space-between'}
        backgroundColor={'primary.50'}
        padding={4}
        gap={4}
        borderRadius={'md'}
        width={'100%'}
      >
        <Text fontSize={'md'} fontWeight={'semibold'} color={'gray.900'}>
          Order total
        </Text>
        {!isEditting && (
          <Text fontSize={'md'} fontWeight={'700'} color={'gray.900'}>
            {totalMoneyValue ? `$${totalMoneyValue}` : '$0'}
          </Text>
        )}
      </HStack>
      <HStack width={'100%'} justifyContent={'space-between'}>
        <Button
          fontSize={'sm'}
          fontWeight={'600'}
          borderRadius={'md'}
          borderColor={'primary.500'}
          variant={'outline'}
          color={'primary.500'}
          onClick={() => router.back()}
        >
          Return
        </Button>

        <Button
          disabled={!totalMoneyValue || isEditting}
          fontSize={'sm'}
          fontWeight={'600'}
          borderRadius={'md'}
          borderColor={'primary.500'}
          variant={'outline'}
          color={'primary.500'}
          onClick={handlePlaceOrder}
        >
          Continue
        </Button>
      </HStack>
    </VStack>
  )
}
