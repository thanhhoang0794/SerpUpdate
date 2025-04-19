import { fetchKeywordRanking } from '@/app/(home-pages)/campaigns/[id]/api'
import {
  DrawerBackdrop,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerRoot
} from '@/components/ui/drawer'
import { Text } from '@chakra-ui/react'
import React from 'react'
import { useQuery } from 'react-query'
import Loading from '../ui/loading'
import HistoryList from './HistoryList'
import { formatHistoryDateForDrawer } from '@/utils/formatDate'
interface DrawerHistoryProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  data: {
    date: string
    id: number
    keyword: string
  }
}

const DrawerHistory = ({ isOpen, setIsOpen, data }: DrawerHistoryProps) => {
  const {
    data: historyData,
    isLoading,
    isError

  } = useQuery(['keywordRanking', data.id, data.date], () => fetchKeywordRanking(data.id, data.date), {
    keepPreviousData: true,
    enabled: isOpen,
    staleTime: 5000,
    cacheTime: 10000
  })

  return (
    <DrawerRoot size={'xl'} open={isOpen} onOpenChange={e => setIsOpen(e.open)}>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Top 100 domains for {data.keyword} on {formatHistoryDateForDrawer(data.date)}
          </DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          {isLoading ? (
            <Loading />
          ) : isError ? (
            <Text> No data found</Text>
          ) : (
            <HistoryList history={historyData?.keywordDataJson} />
          )}
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  )
}

export default DrawerHistory
