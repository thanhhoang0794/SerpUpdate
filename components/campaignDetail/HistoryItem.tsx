import { HistoryKeywordRanking } from '@/app/types/historyKeywordRanking'
import { VStack, HStack, Box, Text, Link } from '@chakra-ui/react'
import Image from 'next/image'

interface HistoryItemProps {
  history: HistoryKeywordRanking
}

const HistoryItem = ({ history }: HistoryItemProps) => {
  return (
    <Box
      padding={3}
      borderRadius="md"
      bg={history.highlight ? 'blue.50' : 'transparent'}
      borderWidth={history.highlight ? '1px' : '0'}

      borderColor="blue.200"
      _hover={{ bg: 'gray.50' }}
      width="100%"
    >
      <VStack align="start" gap={1} flex={1} width="100%">
        <HStack gap={2}>
          <Text color="gray.500" fontSize="sm" pt={1}>
            {history.rank}.
          </Text>
          <Image height="16" width="16" src={`http://www.google.com/s2/favicons?domain=${history.domain}`} alt={''} />
          <Text color="gray.600" fontSize="sm">
            {history.domain}
          </Text>
        </HStack>
        <Link
          href={history.url}
          target="_blank"
          color="blue.600"
          fontWeight="medium"
          fontSize="lg"
          _hover={{ textDecoration: 'underline' }}
        >
          {history.title}
        </Link>
        <Link color="green.500" fontSize="sm" textDecoration="none">
          {history.url}
        </Link>

        {history?.description ? (
          <Text color="gray.700" fontSize="sm">
            {history?.description}
          </Text>
        ) : (
          <Text color="gray.700" fontSize="sm">
            {history?.breadcrumb}
          </Text>
        )}

      </VStack>
    </Box>
  )
}

export default HistoryItem
