'use client'
import Image from 'next/image'
import React from 'react'
import { Box, Text, HStack, VStack, Button, Icon } from '@chakra-ui/react'
import { StatLabel, StatRoot, StatHelpText, StatDownTrend, StatUpTrend } from '@/components/ui/stat'
import { InfoTip } from '@/components/ui/toggle-tip'
import { FaArrowRight } from 'react-icons/fa'
import FeatureCardIcon from '@/public/FeatureCardIcon.svg'
import FeatureCardIcon2 from '@/public/FeatureCardIcon2.svg'
import { routes } from '@/utils/constant'
import { useRouter } from 'next/navigation'
import { FaCaretUp } from 'react-icons/fa'
import { FaCaretDown } from 'react-icons/fa'
import UpcomingFeaturePopup from './UpcomingFeaturePopup'
import { useAtom } from 'jotai'
import { totalTopKeywordsDashboardAtom, userPlanTypeAtom } from '@/app/constant/atom'
import { PlanType } from '@/app/constant/planTypeEnum'

export default function FeatureCard() {
  const [userPlanType] = useAtom(userPlanTypeAtom)
  const [totalTopKeywords] = useAtom(totalTopKeywordsDashboardAtom)
  const router = useRouter()

  const paidPlanWithKeywordCampaign = userPlanType?.plan === PlanType.PaidPlan && totalTopKeywords

  const totalKeywordCount = Array.isArray(totalTopKeywords)
    ? totalTopKeywords.reduce((acc: number, campaignUser: any) => acc + campaignUser.campaigns.keyword_count, 0)
    : 0

  const domains = Array.isArray(totalTopKeywords)
    ? totalTopKeywords
        .map((campaignUser: any) =>
          campaignUser.campaigns.domains.filter((domain: any) => domain.domain_type === 'own')
        )
        .flat()
    : []

  const keywordCounts = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }
  const keywordCountsHistory = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }
  const keywordCountsChange = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }

  domains.forEach((domain: any) => {
    domain.keywords.forEach((keyword: any) => {
      const history = keyword.history || {}
      const dates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      if (keyword.history === null || keyword.position === null) {
        keywordCounts.top100++
        keywordCountsHistory.top100++
      }

      const latestDate = dates[0]
      if (!latestDate) return
      const latestValue = history[latestDate]

      if (latestValue === 1) {
        keywordCounts.top1++
      } else if (latestValue <= 3 && latestValue > 1) {
        keywordCounts.top3++
      } else if (latestValue <= 5 && latestValue > 3) {
        keywordCounts.top5++
      } else if (latestValue <= 10 && latestValue > 5) {
        keywordCounts.top10++
      } else if (latestValue <= 30 && latestValue > 10) {
        keywordCounts.top30++
      } else if (latestValue <= 100 && latestValue > 30) {
        keywordCounts.top100++
      } else if (latestValue === 0) {
        keywordCounts.top100++
      } else if (latestValue === null) {
        keywordCounts.top100++
      }

      const secondLatestDate = dates[1]
      if (!secondLatestDate) {
        keywordCountsChange.top1 = keywordCounts.top1
        keywordCountsChange.top3 = keywordCounts.top3
        keywordCountsChange.top5 = keywordCounts.top5
        keywordCountsChange.top10 = keywordCounts.top10
        keywordCountsChange.top30 = keywordCounts.top30
        keywordCountsChange.top100 = keywordCounts.top100
        return
      }
      const secondLatestValue = history[secondLatestDate as string]

      if (secondLatestValue === 1) {
        keywordCountsHistory.top1++
      } else if (secondLatestValue <= 3 && secondLatestValue > 1) {
        keywordCountsHistory.top3++
      } else if (secondLatestValue <= 5 && secondLatestValue > 3) {
        keywordCountsHistory.top5++
      } else if (secondLatestValue <= 10 && secondLatestValue > 5) {
        keywordCountsHistory.top10++
      } else if (secondLatestValue <= 30 && secondLatestValue > 10) {
        keywordCountsHistory.top30++
      } else if (secondLatestValue <= 100 && secondLatestValue > 30) {
        keywordCountsHistory.top100++
      } else if (secondLatestValue === 0) {
        keywordCountsHistory.top100++
      } else if (secondLatestValue === null) {
        keywordCountsHistory.top100++
      }
    })
  })
  keywordCountsChange.top1 = keywordCounts.top1 - keywordCountsHistory.top1
  keywordCountsChange.top3 = keywordCounts.top3 - keywordCountsHistory.top3
  keywordCountsChange.top5 = keywordCounts.top5 - keywordCountsHistory.top5
  keywordCountsChange.top10 = keywordCounts.top10 - keywordCountsHistory.top10
  keywordCountsChange.top30 = keywordCounts.top30 - keywordCountsHistory.top30
  keywordCountsChange.top100 = keywordCounts.top100 - keywordCountsHistory.top100

  const dataTotalKeywords = [
    {
      label: 'TOP 1',
      value: keywordCounts.top1,
      total: domains.reduce((acc: number, domain: any) => acc + domain.keywords.length, 0),
      change: Math.abs(keywordCountsChange.top1),
      isIncrease: keywordCountsChange.top1 >= 0
    },
    {
      label: 'TOP 3',
      value: keywordCounts.top3,
      total: domains.reduce((acc: number, domain: any) => acc + domain.keywords.length, 0),
      change: Math.abs(keywordCountsChange.top3),
      isIncrease: keywordCountsChange.top3 >= 0
    },
    {
      label: 'TOP 5',
      value: keywordCounts.top5,
      total: domains.reduce((acc: number, domain: any) => acc + domain.keywords.length, 0),
      change: Math.abs(keywordCountsChange.top5),
      isIncrease: keywordCountsChange.top5 >= 0
    },
    {
      label: 'TOP 10',
      value: keywordCounts.top10,
      total: domains.reduce((acc: number, domain: any) => acc + domain.keywords.length, 0),
      change: Math.abs(keywordCountsChange.top10),
      isIncrease: keywordCountsChange.top10 >= 0
    },
    {
      label: 'TOP 30',
      value: keywordCounts.top30,
      total: domains.reduce((acc: number, domain: any) => acc + domain.keywords.length, 0),
      change: Math.abs(keywordCountsChange.top30),
      isIncrease: keywordCountsChange.top30 >= 0
    },
    {
      label: 'TOP 100',
      value: keywordCounts.top100,
      total: domains.reduce((acc: number, domain: any) => acc + domain.keywords.length, 0),
      change: Math.abs(keywordCountsChange.top100),
      isIncrease: keywordCountsChange.top100 >= 0
    }
  ]

  return (
    <HStack justifyContent={'space-between'} width={'full'} columnGap={4}>
      <Box width={'100%'} backgroundColor={'white'} padding={2} paddingBottom={6} borderRadius={'lg'} boxShadow={'md'}>
        <HStack backgroundColor={'primary.50'} paddingX={4} paddingY={'6px'} alignItems={'center'} borderRadius={'sm'}>
          <Text fontSize={'sm'} fontWeight={'600'} color={'gray.900'}>
            SERP Checker
          </Text>
          <InfoTip size={'lg'} content={`This is SERP Checker`} />
        </HStack>
        {!paidPlanWithKeywordCampaign ? (
          <HStack marginTop={6} paddingLeft={4} gapX={6} alignItems={'flex-start'}>
            <Image src={FeatureCardIcon} alt={'FeatureCardIcon'} />
            <VStack alignItems={'flex-start'}>
              <Box fontWeight="medium" color={'gray.700'}>
                <Text as={'span'} fontWeight={'700'} fontSize="md">
                  Speed
                </Text>{' '}
                searches very fast, and <br />
                <Text as={'span'} fontWeight={'700'} fontSize="md">
                  Statt
                </Text>{' '}
                is good at statistics
              </Box>
              <Button
                variant={'outline'}
                size={'sm'}
                color={'primary.500'}
                marginTop={2}
                borderColor={'primary.500'}
                borderRadius={'lg'}
                onClick={() => {
                  router.push(routes.CAMPAIGN)
                }}
              >
                View more <FaArrowRight />
              </Button>
            </VStack>
          </HStack>
        ) : (
          <VStack marginTop={3} height={'175px'}>
            <HStack paddingX={9} gapX={20} alignItems={'center'} justify={'space-between'} marginBottom={2}>
              <VStack gap={0}>
                <Text fontWeight={'600'} fontSize={'6xl'} color={'gray.900'}>
                  {totalKeywordCount}
                </Text>
                <Text fontWeight={'500'} fontSize={'md'} color={'gray.700'}>
                  keywords
                </Text>
              </VStack>
              <VStack alignItems={'flex-start'}>
                <HStack gapX={4} align={'start'}>
                  {dataTotalKeywords.map((item, index) => (
                    <Box key={`item-${index}`}>
                      <VStack gap={0} minWidth={20} alignItems={'flex-start'}>
                        <Text fontWeight={'600'} fontSize={'sm'} color={'gray.500'}>
                          {item.label}
                        </Text>
                        <Text fontWeight={'600'} fontSize={'2xl'} color={'gray.900'}>
                          {item.value}
                        </Text>
                        <StatRoot>
                          {item.change !== 0 && (
                            <StatHelpText>
                              <HStack>
                                {item.isIncrease ? (
                                  <StatUpTrend variant="plain" padding={0} />
                                ) : (
                                  <StatDownTrend variant="plain" padding={0} />
                                )}
                                <Text fontWeight={'400'} fontSize={'sm'} color={'gray.900'}>
                                  {item.change}
                                </Text>
                              </HStack>
                            </StatHelpText>
                          )}
                        </StatRoot>
                      </VStack>
                    </Box>
                  ))}
                </HStack>
              </VStack>
            </HStack>
            <Button
              variant={'outline'}
              size={'sm'}
              color={'primary.500'}
              marginTop={2}
              borderColor={'primary.500'}
              borderRadius={'lg'}
            >
              View more <FaArrowRight />
            </Button>
          </VStack>
        )}
      </Box>
    </HStack>
  )
}
