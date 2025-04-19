'use client'
import { HStack, Table, Flex, Text, Box, VStack, Icon } from '@chakra-ui/react'
import { MdMoney } from 'react-icons/md'
import { BuyMoreDialog } from './components/BuyMoreDialog'
import { FaCaretUp } from 'react-icons/fa'
import { FaCaretDown } from 'react-icons/fa'
import { StatUpTrend, StatDownTrend, StatRoot } from '@/components/ui/stat'
import { useQuery } from 'react-query'
import { fetchUserCredit, fetchPrice } from './api'
import Loading from '@/components/ui/loading'
import { formatHistoryDate } from '@/utils/formatDate'
import { format } from 'path'
import { useEffect, useState } from 'react'
export default function CreditPage() {
  const [data, setData] = useState<any>([])
  const [priceData, setPriceData] = useState<any>([])
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const promises = [fetchUserCredit(), fetchPrice()]
    Promise.all(promises).then(([credit, price]) => {
      setData(credit)
      setPriceData(price.data)
      setIsLoading(false)
    })
  }, [])

  return (
    <VStack
      width="940px"
      height={'max-content'}
      alignSelf="flex-start"
      spaceY={5}
      paddingLeft={6}
      overflowY="auto"
      scrollBehavior="smooth"
      marginBottom={15}
      css={{
        '&::-webkit-scrollbar': {
          display: 'none'
        },
        msOverflowStyle: 'none',
        scrollbarWidth: 'none'
      }}
    >
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <HStack
            width={'100%'}
            justifyContent="space-between"
            alignItems="center"
            paddingX={5}
            backgroundColor="white"
            borderRadius={8}
            paddingY={3}
            shadow="sm"
          >
            <HStack>
              <Icon color={'primary.500'} width={'25px'} height={'25px'}>
                <MdMoney />
              </Icon>
              <Text fontSize={'md'} fontWeight="500" color="gray.700">
                Your remain credit:{' '}
                <Text as="span" fontWeight="700">
                  {data[0]?.total_credits + data[0]?.bonus_credits}
                </Text>
              </Text>
            </HStack>
            <HStack>
              <BuyMoreDialog data={priceData} />
            </HStack>
          </HStack>
          <Box
            width={'100%'}
            backgroundColor="white"
            borderRadius={8}
            shadow="sm"
            paddingX={2}
            paddingY={3}
            paddingBottom={4}
          >
            <Box backgroundColor={'primary.50'} paddingX={4} paddingY={2} marginBottom={5}>
              <Text fontWeight="600" fontSize={'sm'} color={'gray.900'}>
                Credit History
              </Text>
            </Box>
            <Table.ScrollArea rounded="md" maxHeight="60vh">
              <Table.Root size="sm" stickyHeader striped>
                <Table.Header>
                  <Table.Row bg="bg.subtle" maxWidth="600px">
                    <Table.ColumnHeader fontWeight="700" fontSize={'xs'} color={'gray.600'} width={'200px'}>
                      Date
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="700" fontSize={'xs'} color={'gray.600'} width={'200px'}>
                      Amount
                    </Table.ColumnHeader>
                    <Table.ColumnHeader fontWeight="700" fontSize={'xs'} color={'gray.600'}>
                      Type
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data[0]?.creditHistories.map((item: any) => {
                    return (
                      <Table.Row key={item.id}>
                        <Table.Cell fontSize={'sm'} color={'gray.600'} fontWeight="500">
                          {formatHistoryDate(item.created_at)}
                        </Table.Cell>
                        <Table.Cell fontSize={'sm'} color={'gray.600'} fontWeight="500">
                          <Flex gap={1} alignItems="center">
                            <StatRoot>
                              {item.type === 'Buy' ? (
                                <StatUpTrend variant="plain">{item.amount}</StatUpTrend>
                              ) : item.type === 'Use' ? (
                                <StatDownTrend variant="plain">{item.amount}</StatDownTrend>
                              ) : (
                                <StatUpTrend variant="plain">{item.amount}</StatUpTrend>
                              )}
                            </StatRoot>
                          </Flex>
                        </Table.Cell>
                        <Table.Cell fontSize={'sm'} color={'gray.600'} fontWeight="500">
                          {item.type}
                        </Table.Cell>
                      </Table.Row>
                    )
                  })}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </Box>
        </>
      )}
    </VStack>
  )
}
