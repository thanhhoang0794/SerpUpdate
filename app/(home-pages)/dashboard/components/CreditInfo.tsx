'use client'
import { HStack, Text, VStack, Badge } from '@chakra-ui/react'
import { MdMailOutline, MdCardGiftcard, MdMoney } from 'react-icons/md'
import CreditSlider from './CreditSlider'
import { useAtom } from 'jotai'
import { infoCreditsAtom, userPlanTypeAtom, userInfoAtom, campaignAtomDashboard } from '@/app/constant/atom'
import { useMemo } from 'react'
import { PlanType } from '@/app/constant/planTypeEnum'

export default function CreditInfo() {
  const [userPlanType] = useAtom(userPlanTypeAtom)
  const [userInfo] = useAtom(userInfoAtom)
  const [infoCredits] = useAtom(infoCreditsAtom)
  const [campaign] = useAtom(campaignAtomDashboard)
  const isBonusCreditDashboard = userPlanType?.plan !== PlanType.FreePlan
  const paidPlanWithKeywordCampaign = userPlanType?.plan === PlanType.PaidPlan && campaign?.id > 0

  const latestTransactions = useMemo(() => {
    const buyTransaction = infoCredits?.creditHistories
      .filter((history: any) => history.type === 'Buy')
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]

    const bonusTransaction = infoCredits?.creditHistories
      .filter((history: any) => history.type === 'Bonus')
      .sort((a: any, b: any) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0]

    return { buyTransaction, bonusTransaction }
  }, [infoCredits])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <>
      {userPlanType?.plan === PlanType.PaidPlan || paidPlanWithKeywordCampaign ? (
        <HStack
          width={'100%'}
          justify={'space-between'}
          alignItems={'flex-start'}
          height={'fit-content'}
          spaceX={2}
          minHeight={'140px'}
        >
          <VStack
            alignItems={'flex-start'}
            backgroundColor={'white'}
            borderRadius={'md'}
            boxShadow={'md'}
            padding={6}
            width={'40%'}
          >
            <HStack>
              <MdMailOutline color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                {userInfo?.email}
              </Text>
              <Badge backgroundColor={'green.100'} fontSize={'xs'} fontWeight={'700'} color={'green.800'}>
                VERIFIED
              </Badge>
            </HStack>
            <HStack>
              <MdMoney color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                Your remain credit:{' '}
                <Text as={'span'} color={'gray.900'} fontWeight={'700'}>
                  {infoCredits?.total_credits}
                </Text>
              </Text>
            </HStack>
            <HStack>
              <MdCardGiftcard color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                Your bonus:{' '}
                <Text as={'span'} color={'gray.900'} fontWeight={'700'}>
                  {infoCredits?.bonus_credits}
                </Text>
              </Text>
            </HStack>
          </VStack>
          <VStack
            alignItems={'flex-start'}
            backgroundColor={'white'}
            borderRadius={'md'}
            boxShadow={'md'}
            padding={6}
            gap={0}
            width={'30%'}
          >
            <HStack>
              <MdMoney color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'600'} color={'gray.500'} fontSize={'sm'}>
                Last Payment
              </Text>
            </HStack>
            <HStack marginTop={2}>
              <Text fontWeight={'600'} color={'gray.900'} fontSize={'2xl'}>
                {latestTransactions.buyTransaction?.amount || 'N/A'}
              </Text>
              <Text fontWeight={'400'} color={'gray.700'} fontSize={'md'}>
                Credit
              </Text>
            </HStack>
            <Text fontStyle={'italic'} fontWeight={'400'} color={'gray.600'} fontSize={'sm'}>
              {latestTransactions.buyTransaction ? formatDate(latestTransactions.buyTransaction.updated_at) : 'N/A'}
            </Text>
          </VStack>
          <VStack
            alignItems={'flex-start'}
            backgroundColor={'white'}
            borderRadius={'md'}
            boxShadow={'md'}
            padding={6}
            gap={0}
            width={'30%'}
          >
            <HStack>
              <MdCardGiftcard color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'600'} color={'gray.500'} fontSize={'sm'}>
                Last Bonus
              </Text>
            </HStack>
            <HStack marginTop={2}>
              <Text fontWeight={'600'} color={'gray.900'} fontSize={'2xl'}>
                {latestTransactions.bonusTransaction?.amount || 'N/A'}
              </Text>
              <Text fontWeight={'400'} color={'gray.700'} fontSize={'md'}>
                Credit
              </Text>
            </HStack>
            <Text fontStyle={'italic'} fontWeight={'400'} color={'gray.600'} fontSize={'sm'}>
              {latestTransactions.bonusTransaction ? formatDate(latestTransactions.bonusTransaction.updated_at) : 'N/A'}
            </Text>
          </VStack>
        </HStack>
      ) : (
        <HStack
          backgroundColor={'white'}
          borderRadius={'md'}
          boxShadow={'md'}
          padding={6}
          w={'100%'}
          justify={'space-between'}
          alignItems={'flex-start'}
        >
          <VStack alignItems={'flex-start'}>
            <HStack>
              <MdMailOutline color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                {userInfo?.email}
              </Text>
              <Badge backgroundColor={'green.100'} fontSize={'xs'} fontWeight={'700'} color={'green.800'}>
                VERIFIED
              </Badge>
            </HStack>
            <HStack>
              <MdMoney color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                Your remain credit:{' '}
                <Text as={'span'} color={'gray.900'} fontWeight={'700'}>
                  0
                </Text>
              </Text>
            </HStack>
            <HStack>
              <MdCardGiftcard color={'#5271FF'} size={'24px'} />
              <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                Your bonus:{' '}
                <Text as={'span'} color={'gray.900'} fontWeight={'700'}>
                  {isBonusCreditDashboard ? 0 : 100}
                </Text>
              </Text>
            </HStack>
          </VStack>
          <CreditSlider />
        </HStack>
      )}
    </>
  )
}
