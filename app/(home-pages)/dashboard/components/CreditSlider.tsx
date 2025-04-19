'use client'
import { Slider } from '@/components/ui/slider'
import { Box, HStack, Text, VStack, Button } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { MdMoney } from 'react-icons/md'
import { useAtom } from 'jotai'
import { userPlanTypeAtom } from '@/app/constant/atom'
import { PlanType } from '@/app/constant/planTypeEnum'
import { routes } from '@/utils/constant'
import { useRouter } from 'next/navigation'
import { convertValue } from '@/utils/convertCredit'
import React from 'react'
import { fetchPrice } from '../../credit/api'
import Loading from '@/components/ui/loading'

interface PriceData {
  id: number
  price_usd: number
  total_credits: number
  percent_bonus: number
  total_credits_bonus: number
  total_credits_with_bonus: number
  created_at: Date
  updated_at: Date
}

function convertPriceData(priceData: PriceData[]) {
  if (!priceData) return { marks: [], min: 0, max: 0 }
  const marks = [
    { value: priceData[0]?.total_credits, label: priceData[0]?.total_credits },
    { value: priceData[priceData.length - 1]?.total_credits, label: priceData[priceData.length - 1]?.total_credits }
  ]
  let min = priceData[0]?.total_credits
  let max = priceData[priceData.length - 1]?.total_credits
  return { marks, min, max }
}

export default function CreditSlider() {
  const [userPlanType] = useAtom(userPlanTypeAtom)
  const [value, setValue] = useState([5000])
  const [formattedValue, setFormattedValue] = useState('')
  const [endValue, setEndValue] = useState([5000])
  const [marks, setMarks] = useState<Array<{ value: number; label: number }>>([])
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(0)
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [bonusPercentage, setBonusPercentage] = useState(0)
  const [bonusCredit, setBonusCredit] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [totalMoneyValue, setTotalMoneyValue] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  function handleValueChange(e: any) {
    setValue(e.value)
    const formattedValue = e.value[0].toLocaleString()
    setFormattedValue(formattedValue)
  }
  function handleValueChangeEnd(e: any) {
    setEndValue(e.value)
    const formattedValue = e.value[0].toLocaleString()
    setFormattedValue(formattedValue)
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
    const bonusPercentage = calculateBonusPercentage(endValue[0])
    const bonusCredit = endValue[0] * (bonusPercentage / 100)
    const totalCredit = endValue[0] + bonusCredit
    setBonusPercentage(bonusPercentage)
    setBonusCredit(bonusCredit)
    setTotalCredit(totalCredit)
    setTotalMoneyValue(convertValue(endValue[0]))
  }

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const price = await fetchPrice()
      setPriceData(price.data)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    const { marks, min, max } = convertPriceData(priceData)
    setMarks(marks)
    setMin(min)
    setMax(max)
    const formattedValue = value[0].toLocaleString()
    setFormattedValue(formattedValue)
    handleConvertCreditToMoney()
  }, [priceData])

  useEffect(() => {
    handleConvertCreditToMoney()
  }, [endValue])

  if (isLoading) {
    return <Loading />
  }
  return (
    <Box
      w={'670px'}
      backgroundColor={'gray.50'}
      padding={4}
      border={'1px solid'}
      borderColor={'primary.300'}
      borderRadius={'md'}
    >
      <VStack alignItems={'flex-start'}>
        <Text fontWeight={'500'} fontSize={'md'} marginBottom={8}>
          Get your credit
        </Text>
        <Slider
          width="100%"
          value={[value[0] < 5000 ? 5000 : value[0]]}
          onValueChange={(e: any) => handleValueChange(e)}
          onValueChangeEnd={(e: any) => handleValueChangeEnd(e)}
          colorPalette="blue"
          min={min}
          max={max}
          step={5000}
        />
        <style>
          {`
                            .chakra-slider__thumb {
                                position: relative;
                            }
                            .chakra-slider__thumb::after {
                                font-family: 'Inter', sans-serif;
                                content: '${formattedValue}';
                                position: absolute;
                                top: -40px;
                                left: 50%;
                                transform: translateX(-50%);
                                padding: 2px 8px;
                                font-size: 14px;
                                font-weight: 400;
                                border-radius: 4px;
                                color: #FFFFFF;
                                background-color: #1A202C;
                                box-shadow: 0 2px 4px 0 rgba(0,0,0,0.1);
                            }
                                .chakra-slider__thumb::before {
                                content: '';
                                position: absolute;
                                top: -15px;
                                left: 50%;
                                transform: translateX(50%);
                                width: 0;
                                height: 0;
                                rotate: 180deg;
                                border-left: 10px solid transparent;
                                border-right: 10px solid transparent;
                                border-bottom: 8px solid #1A202C;
                            }
                        `}
        </style>
        <HStack justify={'space-between'} width={'100%'}>
          <Text fontSize={'md'} fontWeight={'500'} color={'gray.700'}>
            {priceData[0]?.total_credits}
          </Text>
          <Text fontSize={'md'} fontWeight={'500'} color={'gray.700'}>
            {priceData[priceData.length - 1]?.total_credits}
          </Text>
        </HStack>
        <HStack justify={'space-between'} width={'100%'} alignItems={'flex-end'}>
          <VStack alignItems={'flex-start'} width={'100%'} marginTop={2} gapY={1}>
            <Box fontSize={'sm'} color={'gray.500'}>
              <Text as={'span'} paddingRight={6}>
                Price
              </Text>
              <Text as={'span'} color={'green.500'} fontWeight={'700'} fontSize={'3xl'} marginLeft={2}>
                ${convertValue(endValue[0]).toFixed(0)}
              </Text>
            </Box>
            <Box fontSize={'sm'} color={'gray.500'}>
              <Text as={'span'} paddingRight={4}>
                Bonus
              </Text>
              <Text as={'span'} color={'gray.700'} fontWeight={'500'} fontSize={'md'}>
                {bonusCredit} credit
              </Text>
            </Box>
          </VStack>
          {userPlanType?.plan === PlanType.FreePlan && (
            <Button
              variant="solid"
              backgroundColor="primary.500"
              color="white"
              size="md"
              onClick={() => router.push(routes.CREDIT)}
            >
              <MdMoney /> Buy now
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}
