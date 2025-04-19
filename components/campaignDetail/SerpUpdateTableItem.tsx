'use client'

import { Table, Text, HStack } from '@chakra-ui/react'
import { StatRoot, StatHelpText, StatDownTrend, StatUpTrend } from '../ui/stat'
import { FaDesktop, FaMobile } from 'react-icons/fa'
import { useState } from 'react'
import DrawerHistory from './DrawerHistory'

const SerpUpdateTableItem = ({ keyword, backgroundColor }: { keyword: any; backgroundColor: string }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedData, setSelectedData] = useState({
    date: '',
    id: 0,
    keyword: ''
  })

  const history = keyword?.history || {}
  const recentHistory =
    Object.entries(history)
      .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
      .slice(0, 5)
      .map(([date, value]) => ({ date, value: value as number })) || []

  let change = '-'
  if (recentHistory.length > 1) {
    if (recentHistory[1].value === 0 || recentHistory[0].value === 0) {
      change = '-'
    } else {
      change = String(recentHistory[1].value - recentHistory[0].value)
    }
  } else {
    change = '-'
  }

  const historyValues = Object.values(history).filter(
    (value): value is number => typeof value === 'number' && value !== 0
  )
  const best = historyValues.length > 0 ? Math.min(...historyValues) : 0

  const renderHistoryCells = () => {
    if (!Array.isArray(recentHistory)) return []

    return recentHistory?.map(({ date, value }, index) => (
      <Table.Cell
        key={index}
        paddingY={3}
        paddingLeft={4}
        fontWeight={'500'}
        color={'gray.700'}
        fontSize={'sm'}
        cursor="pointer"
        onClick={() => {
          setSelectedData({
            date: new Date(date).toISOString(),
            id: keyword.id,
            keyword: keyword.keyword
          })
          setIsOpen(true)
        }}
        _hover={{
          backgroundColor: 'gray.50'
        }}
      >
        {value === 0 ? '100+' : value}
      </Table.Cell>
    ))
  }

  return (
    <>
      <Table.Row border="none" backgroundColor={backgroundColor} paddingX={2}>
        <Table.Cell width="fit-content" paddingY={3} paddingLeft={4}>
          <Text>{keyword.keyword}</Text>
        </Table.Cell>
        
        <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color="gray.500" fontSize={'sm'}>
          {keyword.device === 'mobile' ? <FaMobile /> : keyword.device === 'desktop' ? <FaDesktop /> : <FaDesktop />}
        </Table.Cell>
        <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
          <StatRoot>
            <StatHelpText>
              <HStack>
                {change !== '-' ? (
                  <>
                    {Number(change) !== 0 &&
                      (Number(change) < 0 ? (
                        <StatDownTrend variant="plain" padding={0} />
                      ) : (
                        <StatUpTrend variant="plain" padding={0} />
                      ))}
                    <Text>{Number(change) === 0 ? '-' : Math.abs(Number(change))}</Text>
                  </>
                ) : (
                  <Text>{change}</Text>
                )}
              </HStack>
            </StatHelpText>
          </StatRoot>
        </Table.Cell>
        <Table.Cell paddingY={3} paddingLeft={4} fontWeight={'500'} color={'gray.700'} fontSize={'sm'}>
          {best}
        </Table.Cell>
        {renderHistoryCells()}
      </Table.Row>
      <DrawerHistory isOpen={isOpen} setIsOpen={setIsOpen} data={selectedData} />
    </>
  )
}

export default SerpUpdateTableItem
