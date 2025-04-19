'use client'
import { Code, HStack, Input, Separator, Stack, Text, VStack } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import { MdMoney } from 'react-icons/md'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { creditAtom } from '@/app/constant/atom'
import { useAtom } from 'jotai'
import { convertValue } from '@/utils/convertCredit'

interface BuyMoreDialogProps {
  data: {
    id: number
    price_usd: number
    total_credits: number
    percent_bonus: number
    total_credits_bonus: number
    total_credits_with_bonus: number
    created_at: Date
    updated_at: Date
  }[]
}

export function BuyMoreDialog({ data }: BuyMoreDialogProps) {
  const [creditValue, setCreditValue] = useAtom(creditAtom)
  const router = useRouter()
  const initialValue = [5000]
  const [value, setValue] = useState(initialValue)
  const [totalCredits, setTotalCredits] = useState(0)
  const [endValue, setEndValue] = useState(initialValue)
  const [errorMessage, setErrorMessage] = useState('')
  const [isInvalid, setIsInvalid] = useState(false)
  const [marks, setMarks] = useState<Array<{ value: number; label: number }>>([])
  const [min, setMin] = useState(0)
  const [max, setMax] = useState(0)

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = parseInt(e.target.value)

    if (!isNaN(inputValue)) {
      const newValue = Math.min(Math.max(inputValue, 0), 1000000)
      setValue([newValue])
      setEndValue([newValue])

      if (newValue % 5000 !== 0) {
        setErrorMessage('Amount must be a multiple of 5000')
        setIsInvalid(true) 
      } else if (newValue < 5000) {
        setErrorMessage('Minimum amount is 5,000')
        setIsInvalid(true) 
      } else {
        setErrorMessage('')
        setIsInvalid(false) 
      }
    }
  }

  function convertPriceData(data: any) {
    const marks = [
      { value: data[0]?.total_credits, label: data[0].total_credits },
      { value: data[data.length - 1]?.total_credits, label: data[data.length - 1].total_credits }
    ]
    let min = data[0].total_credits
    let max = data[data.length - 1].total_credits
    return { marks, min, max }
  }

  function handleBuyNow() {
    setCreditValue(endValue[0])
    router.push('/checkout')
  }
  useEffect(() => {
    const { marks, min, max } = convertPriceData(data)
    setMarks(marks)
    setMin(min)
    setMax(max)
  }, [data])
  return (
    <HStack>
      <DialogRoot key={'lg'} size={'lg'} placement="center">
        <DialogTrigger asChild>
          <Button
            variant="solid"
            size={'sm'}
            backgroundColor="primary.500"
            color="white"
            _hover={{ backgroundColor: 'primary.600' }}
          >
            <MdMoney size={20} />
            <Text fontWeight="600" fontSize={'sm'}>
              Buy more
            </Text>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy credit</DialogTitle>
          </DialogHeader>
          <Separator marginTop={2} width="100%" border="1px solid" borderColor="gray.200" />
          <DialogBody>
            <VStack paddingX={1} paddingY={7}>
              <Slider
                width="100%"
                value={[value[0] < 5000 ? 5000 : value[0]]}
                onValueChange={(e: any) => setValue(e.value)}
                onValueChangeEnd={(e: any) => setEndValue(e.value)}
                colorPalette="blue"
                marks={marks}
                min={min}
                max={max}
                step={5000}
              />
            </VStack>
            <HStack marginTop={5} gap={5} alignItems="flex-start">
              <Text fontWeight="500" fontSize="md" color="gray.700" width="100%">
                Amount of credit:
                <Input
                  type="number"
                  fontWeight="400"
                  color="gray.700"
                  marginTop={2}
                  border="1px solid"
                  borderColor={errorMessage ? 'red.500' : 'gray.200'}
                  borderRadius={1}
                  paddingX={2}
                  value={value[0]}
                  onChange={handleInputChange}
                />
                {errorMessage && (
                  <Text fontSize="sm" color="red.500" marginTop={1} fontWeight="400">
                    {errorMessage}
                  </Text>
                )}
              </Text>
              <Text fontWeight="500" fontSize="md" color="gray.700" width="100%">
                Price:
                <Input
                  disabled
                  fontWeight="400"
                  color="gray.900"
                  backgroundColor="gray.100"
                  marginTop={2}
                  border="1px solid"
                  borderColor="gray.300"
                  borderRadius={1}
                  paddingX={2}
                  width="100%"
                  value={`$ ${convertValue(endValue[0]).toFixed(0)}`}
                />
              </Text>
            </HStack>
          </DialogBody>
          <Separator marginTop={4} width="100%" border="1px solid" borderColor="gray.200" />
          <DialogFooter>
            <Button
              disabled={isInvalid}
              variant="solid"
              size={'sm'}
              backgroundColor="primary.500"
              color="white"
              _hover={{ backgroundColor: 'primary.600' }}
              onClick={handleBuyNow}
            >
              Buy now
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </HStack>
  )
}
