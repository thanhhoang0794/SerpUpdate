import React from 'react'
import { Table, Container } from '@chakra-ui/react'
import { columnNameHeader } from '@/app/constant/columnNameHeaderCampaignDetail'
import SerpUpdateTableItem from './SerpUpdateTableItem'
import { FormValues } from '@/app/types/formValuesCampaign'
import { formatHistoryDate } from '@/utils/formatDate'
import { Keyword } from '@/app/types/keywords'
import { useSearchParams } from 'next/navigation'
import { useFormContext } from 'react-hook-form'

interface SerpUpdateTableListProps {}

const SerpUpdateTableList: React.FC<SerpUpdateTableListProps> = () => {
  const { watch } = useFormContext<FormValues>()
  const values = watch()
  const searchParams = useSearchParams()
  const query = searchParams?.get('query') || ''
  const selectedDomain = values.selectedDomain

  const filteredKeywords = React.useMemo(() => {
    if (!selectedDomain?.keywords || !query.trim()) {
      return selectedDomain?.keywords || []
    }
    return selectedDomain.keywords.filter(keyword => keyword.keyword.toLowerCase().includes(query.toLowerCase()))
  }, [selectedDomain?.keywords, query])

  const historyDates = selectedDomain?.keywords?.[0]?.history
    ? Object.keys(selectedDomain.keywords[0].history)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
        .slice(0, 5)
        .map(date => formatHistoryDate(date))
    : []

  const dynamicHeaders = {
    ...columnNameHeader,
    ...historyDates.reduce(
      (acc, date, index) => ({
        ...acc,
        [`history${index}`]: date
      }),
      {}
    )
  }

  return (
    <>
      <Container
        maxWidth={'100%'}
        maxHeight={'70vh'}
        paddingX={2}
        paddingY={3}
        backgroundColor={'white'}
        borderRadius={'xl'}
        overflowY={'auto'}
      >
        <Table.Root paddingX={2} paddingY={3} size="lg" position={'relative'}>
          <Table.Header border="none" backgroundColor={'white'}>
            <Table.Row border="none" color={'gray.600'}>
              {Object.values(dynamicHeaders).map((item, index) => (
                <Table.ColumnHeader
                  fontWeight={700}
                  borderBottom={'none'}
                  key={index}
                  color="gray.600"
                  fontSize="xs"
                  paddingY={3}
                  paddingLeft={4}
                  maxWidth={'fit-content'}
                >
                  {item}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body paddingX={2}>
            {Array.isArray(filteredKeywords) &&
              filteredKeywords?.map((item: Keyword, index: number) => (
                <SerpUpdateTableItem
                  key={item?.id}
                  backgroundColor={index % 2 === 0 ? 'white' : 'gray.100'}
                  keyword={item}
                />
              ))}
          </Table.Body>
        </Table.Root>
      </Container>
    </>
  )
}

export default SerpUpdateTableList
