'use client'

import { Button } from '@/components/ui/button'
import { HStack } from '@chakra-ui/react'
import { Input } from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import { InputGroup } from '@/components/ui/input-group'
import { ReadonlyURLSearchParams, useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import { MdOutlineFileDownload, MdRefresh } from 'react-icons/md'
import { toast } from 'react-hot-toast'
import { writeFile, utils } from 'xlsx'
import { FormValues } from '@/app/types/formValuesCampaign'
import { AddKeyWordDialog } from './AddKeyWordDialog'
import { RemoveKeyWordDialog } from './RemoveKeyWordDialog'
import { useFormContext } from 'react-hook-form'
import { parse } from 'flatted'
import React from 'react'
interface SerpUpdateTableHeaderProps {
  isOwnerCampaign: boolean
}

const CampaignHeader = ({ isOwnerCampaign }: SerpUpdateTableHeaderProps) => {
  const { control, watch } = useFormContext<FormValues>()
  const values = watch()
  const searchParams: ReadonlyURLSearchParams = useSearchParams() as ReadonlyURLSearchParams
  const pathname = usePathname()
  const selectedDomain = values.selectedDomain
  const router = useRouter()
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
    router.replace(`${pathname}?${params.toString()}`)
  }, 500)

  const { id } = useParams() as { id: string }

  async function handleUpdate() {
    try {
      const response = await fetch(`${origin}/api/update-campaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ campaignId: id })
      })
      const result = await response.json()
      if (response.status >= 500) {
        throw new Error('Server error')
      } else if (response.status === 400) {
        toast.error(result.error)
        return
      }
      toast.success('Campaign is updating')
      return
    } catch (error) {
      toast.error('Failed to update campaign')
      console.error('Error:', error)
    }
  }

  function handleExport() {
    const data = selectedDomain?.keywords

    const filteredData = data.map((keyword: any) => {
      let history = {}
  if (keyword?.history) {
    try {
      history = parse(keyword?.history)
    } catch (error) {
      console.error('Error parsing history:', error)
      history = {}
        }
      }
       const recentHistory =
         Object.entries(history)
           .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
           .slice(0, 5)
           .map(([date, value]) => ({ date, value: value as number })) || []
      return {
        keyword: keyword.keyword,
        device: keyword.device,
        url: keyword.url,
        change: recentHistory[0]?.value - recentHistory[1]?.value,
        ...recentHistory.reduce(
          (acc, date) => ({
            ...acc,
            [date.date]: date.value
          }),
          {}
        )
      }
    })

    const worksheet = utils.json_to_sheet(filteredData)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, selectedDomain?.domain)

    writeFile(workbook, `${selectedDomain?.domain}.csv`, { bookType: 'csv' })

    toast.success(
      <div>
        <strong>Exported successfully</strong>
      </div>,
      {
        duration: 3000,
        position: 'bottom-left',
        style: {
          backgroundColor: '#C6F6D5',
          color: '#256053'
        }
      }
    )
  }

  return (
    <HStack width="100%" justify="space-between" padding={3} height={8}>
      <InputGroup width={'400px'} startElement={<FaSearch />} marginRight="10px">
        <Input
          backgroundColor={'white'}
          size={'sm'}
          variant={'outline'}
          placeholder="Search keywords"
          _placeholder={{ color: 'gray.400' }}
          padding={'0px 12px 0px 32px'}
          gap={2.5}
          onChange={e => handleSearch(e.target.value)}
          defaultValue={searchParams?.get('query')?.toString() || ''}
        />
      </InputGroup>
      <HStack>
        {isOwnerCampaign && <AddKeyWordDialog />}
        {isOwnerCampaign && <RemoveKeyWordDialog control={control} />}
        <Button
          backgroundColor={'white'}
          borderRadius={'md'}
          size={'sm'}
          gap={2}
          paddingX={3}
          variant={'solid'}
          fontSize={'sm'}
          fontWeight={'semibold'}
          color="gray.800"
          onClick={handleExport}
        >
          <MdOutlineFileDownload /> Export
        </Button>
        {isOwnerCampaign && (
          <Button
            backgroundColor={'white'}
            borderRadius={'md'}
            size={'sm'}
            gap={2}
            paddingX={3}
            variant={'solid'}
            fontSize={'sm'}
            fontWeight={'semibold'}
            color="gray.800"
            onClick={() => {
              handleUpdate()
            }}
          >
            <MdRefresh /> Update
          </Button>
        )}
      </HStack>
    </HStack>
  )
}
export default CampaignHeader
