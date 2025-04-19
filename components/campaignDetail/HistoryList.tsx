import { HistoryKeywordRanking } from "@/app/types/historyKeywordRanking"
import { VStack } from "@chakra-ui/react"
import  HistoryItem  from "./HistoryItem"

interface HistoryListProps {
  history: {
    rank: number,
    domain: string,
    title: string,
    description?: string,
    url: string,
    type: string,
    breadcrumb?: string,
    highlight?: boolean
  }[]
}

const HistoryList = ({ history }: HistoryListProps) => {
  return (
    <VStack>
      {history?.map((item: HistoryKeywordRanking) => (
        <HistoryItem key={item.domain} history={item} />
      ))}
    </VStack>
  )
}

export default HistoryList
