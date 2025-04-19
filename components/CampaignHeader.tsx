'use client'

import { Button } from './ui/button'
import { HStack } from '@chakra-ui/react'
import { FaPlus } from 'react-icons/fa'
import { Input } from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { InputGroup } from './ui/input-group'
import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { routes } from '@/utils/constant'

const CampaignHeader = () => {
  const searchParams: ReadonlyURLSearchParams = useSearchParams() as ReadonlyURLSearchParams
  const pathname = usePathname()
  const { replace } = useRouter()
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams || '')
    if (term) {
      params.set('query', term)
      if (params.has('page')) {
        params.delete('page')
      }
      if (params.has('pageSize')) {
        params.delete('pageSize')
      }
    } else {
      params.delete('query')
    }
    replace(`${pathname}?${params.toString()}`)
    console.log(term)
  }, 500)
  const router = useRouter()
  return (
    <HStack width="100%" justify="space-between" height={8}>
      <InputGroup width={'400px'} startElement={<FaSearch />} marginRight="10px">
        <Input
          backgroundColor={'white'}
          size={'sm'}
          variant={'outline'}
          placeholder="Search campaign by name"
          _placeholder={{ color: 'gray.400' }}
          padding={'0px 12px 0px 32px'}
          gap={2.5}
          onChange={e => handleSearch(e.target.value)}
          defaultValue={searchParams?.get('query')?.toString() || ''}
        />
      </InputGroup>
      {pathname !== routes.SHARE_CAMPAIGN && (
        <Button
          borderRadius={'md'}
        size={'sm'}
        gap={2}
        paddingX={3}
        backgroundColor="primary.500"
        _hover={{ backgroundColor: 'primary.600' }}
        onClick={() => router.push('/campaigns/create-new')}
        color="white"
      >
        <FaPlus /> Create new
      </Button>
      )}
    </HStack>
  )
}
export default CampaignHeader
