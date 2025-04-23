import { Box, HStack, SimpleGrid, Text } from '@chakra-ui/react'
import { StatLabel, StatRoot, StatHelpText, StatDownTrend, StatUpTrend } from '../ui/stat'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCampaign'
import { parse } from 'flatted'

const KeywordTopList = () => {
  const { watch } = useFormContext<FormValues>()
  const values = watch()
  const domain = values.ownDomain

  const keywordCounts = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }
  const keywordCountsHistory = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }
  const keywordCountsChange = { top1: 0, top3: 0, top5: 0, top10: 0, top30: 0, top100: 0 }

  if (domain?.keywords) {
    domain.keywords.forEach((keyword: any) => {
      let history: Record<string, number> = {}
      if (keyword?.history) {
        try {
          history = parse(keyword?.history) as Record<string, number>
        } catch (error) {
          console.error('Error parsing history:', error)
          history = {}
        }
      }
      const latestDate = Object.keys(history).sort().pop()
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
      }

      const secondLatestDate = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[1]
      if (!secondLatestDate) {
        keywordCountsChange.top1 = keywordCounts.top1
        keywordCountsChange.top3 = keywordCounts.top3
        keywordCountsChange.top5 = keywordCounts.top5
        keywordCountsChange.top10 = keywordCounts.top10
        keywordCountsChange.top30 = keywordCounts.top30
        keywordCountsChange.top100 = keywordCounts.top100
        return
      }
      const secondLatestValue = history[secondLatestDate]

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
      }

      keywordCountsChange.top1 = keywordCounts.top1 - keywordCountsHistory.top1
      keywordCountsChange.top3 = keywordCounts.top3 - keywordCountsHistory.top3
      keywordCountsChange.top5 = keywordCounts.top5 - keywordCountsHistory.top5
      keywordCountsChange.top10 = keywordCounts.top10 - keywordCountsHistory.top10
      keywordCountsChange.top30 = keywordCounts.top30 - keywordCountsHistory.top30
      keywordCountsChange.top100 = keywordCounts.top100 - keywordCountsHistory.top100
    })
  }

  const data = [
    {
      label: 'TOP 1',
      value: keywordCounts.top1,
      total: domain?.keywords.length,
      change: Math.abs(keywordCountsChange.top1),
      isIncrease: keywordCountsChange.top1 >= 0
    },
    {
      label: 'TOP 3',
      value: keywordCounts.top3,
      total: domain?.keywords.length,
      change: Math.abs(keywordCountsChange.top3),
      isIncrease: keywordCountsChange.top3 >= 0
    },
    {
      label: 'TOP 5',
      value: keywordCounts.top5,
      total: domain?.keywords.length,
      change: Math.abs(keywordCountsChange.top5),
      isIncrease: keywordCountsChange.top5 >= 0
    },
    {
      label: 'TOP 10',
      value: keywordCounts.top10,
      total: domain?.keywords.length,
      change: Math.abs(keywordCountsChange.top10),
      isIncrease: keywordCountsChange.top10 >= 0
    },
    {
      label: 'TOP 30',
      value: keywordCounts.top30,
      total: domain?.keywords.length,
      change: Math.abs(keywordCountsChange.top30),
      isIncrease: keywordCountsChange.top30 >= 0
    },
    {
      label: 'TOP 100',
      value: keywordCounts.top100,
      total: domain?.keywords.length,
      change: Math.abs(keywordCountsChange.top100),
      isIncrease: keywordCountsChange.top100 >= 0
    }
  ]
  return (
    <SimpleGrid columns={6} gap={4} width={'100%'}>
      {data.map((item, index) => (
        <Box key={index} p={4} borderRadius={'lg'} backgroundColor={'white'}>
          <StatRoot>
            <StatLabel>{item.label}</StatLabel>
            <HStack gap={0}>
              {typeof item.value === 'number' && (
                <Text fontWeight={'600'} fontSize={'2xl'} color={'gray.900'}>
                  {item.value}
                </Text>
              )}
              {typeof item.total === 'number' && (
                <Text alignSelf={'flex-end'} marginBottom={'4px'} fontWeight={'400'} fontSize={'md'} color={'gray.500'}>
                  /{item.total}
                </Text>
              )}
            </HStack>
            {item.change !== undefined && (
              <StatHelpText>
                <HStack>
                  {item.isIncrease ? (
                    <StatUpTrend variant="plain" padding={0} />
                  ) : (
                    <StatDownTrend variant="plain" padding={0} />
                  )}
                  <Text>{item.change} keywords</Text>
                </HStack>
              </StatHelpText>
            )}
          </StatRoot>
        </Box>
      ))}
    </SimpleGrid>
  )
}

export default KeywordTopList
