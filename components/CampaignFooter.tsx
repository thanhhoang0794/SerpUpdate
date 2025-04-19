'use client'

import React from 'react'
import { HStack, Text } from '@chakra-ui/react'
import { PaginationRoot, PaginationPrevTrigger, PaginationNextTrigger, PaginationItems } from './ui/pagination'
import { NativeSelectField, NativeSelectRoot } from '@/components/ui/native-select'
import { Pagination } from '@/app/types/paginations'
import { ReadonlyURLSearchParams, useRouter, useSearchParams } from 'next/navigation'
interface CampaignFooterProps {
  pagination: Pagination
}

const CampaignFooter: React.FC<CampaignFooterProps> = ({ pagination }) => {
  const router = useRouter()
  const searchParams: ReadonlyURLSearchParams = useSearchParams() as ReadonlyURLSearchParams
  const newSearchParams = new URLSearchParams(searchParams)

  const handlePageChange = (newPage: number) => {
    newSearchParams.set('page', newPage.toString())
    router.replace(`?${newSearchParams.toString()}`)
  }
  const handlePageSizeChange = (newPageSize: number) => {
    newSearchParams.set('pageSize', newPageSize.toString())
    newSearchParams.set('page', '1')
    router.replace(`?${newSearchParams.toString()}`)
  }
  return (
    <HStack width="100%" justifyContent={'space-between'} alignItems={'center'}>
      <PaginationRoot
        alignSelf="flex-start"
        count={pagination?.total}
        pageSize={parseInt(searchParams?.get('pageSize') || '10', 10)}
        page={parseInt(searchParams?.get('page') || '1', 10)}
        variant={'solid'}
        onPageChange={(e: { page: number }) => handlePageChange(Number(e.page))}
      >
        <HStack>
          <PaginationPrevTrigger />
          <PaginationItems />
          <PaginationNextTrigger />
        </HStack>
      </PaginationRoot>
      <HStack gap={3} alignItems={'center'} justifyContent={'center'}>
        <Text fontSize="sm" color="gray.600">
          Show
        </Text>
        <NativeSelectRoot size="sm" width="150px" backgroundColor={'white'} border={'1px gray.200'}>
          <NativeSelectField
            value={parseInt(searchParams?.get('pageSize') || '10', 10)}
            onChange={e => handlePageSizeChange(parseInt(e.currentTarget.value))}
          >
            <option value={5}>5 rows</option>
            <option value={10}>10 rows</option>
            <option value={15}>15 rows</option>
            <option value={20}>20 rows</option>
          </NativeSelectField>
        </NativeSelectRoot>
      </HStack>
    </HStack>
  )
}

export default CampaignFooter
