'use client'

import { Text, VStack, HStack, Textarea, Box, Button, Input } from '@chakra-ui/react'
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot
} from '@/components/ui/accordion'
import React from 'react'
import { MdOutlineFileDownload } from 'react-icons/md'
import { Control, useWatch, Controller } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import { usePathname } from 'next/navigation'
import { routes } from '@/utils/constant'
interface SelectKeywordsProps {
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  control: Control<FormValues>
}
const SelectKeywords: React.FC<SelectKeywordsProps> = ({ handleFileUpload, control }) => {
  const keywordText = useWatch<FormValues, 'keywordText'>({
    control,
    name: 'keywordText'
  })
  const pathname = usePathname()
  return (
    <AccordionRoot
      backgroundColor={'white'}
      borderRadius={'lg'}
      padding={2}
      variant={'plain'}
      collapsible
      defaultValue={['Keywords']}
    >
      <AccordionItem value={'Keywords'}>
        {pathname === routes.CREATE_NEW_CAMPAIGN && (
          <AccordionItemTrigger backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
            <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
              Keywords
            </Text>
          </AccordionItemTrigger>
        )}
        <AccordionItemContent marginTop={5} marginBottom={4}>
          <VStack width={'100%'} gap={5} paddingX={4}>
            <VStack width={'100%'} gap={6}>
              <VStack width={'100%'} gap={2}>
                <HStack width={'100%'} justifyContent={'space-between'}>
                  <Text fontSize={'md'} color={'gray.700'} fontWeight={'medium'}>
                    Keywords
                  </Text>
                  <Text color={'primary.500'} fontWeight={'medium'} fontSize={'md'}>
                    Type the keyword and press Enter to add it
                  </Text>
                </HStack>
                <Controller
                  control={control}
                  name="keywordText"
                  render={({ field }) => (
                    <Textarea
                      minHeight={'90px'}
                      resize={'none'}
                      placeholder="Enter your keywords here"
                      borderColor={'gray.200'}
                      value={field.value}
                      onChange={event => {
                        field.onChange(event)
                      }}
                    />
                  )}
                />
                <Text alignSelf={'flex-start'} fontSize={'sm'} color={'gray.500'}>
                  {keywordText
                    ? keywordText
                        .trim()
                        .split('\n')
                        .filter((keyword: string) => keyword.trim() !== '').length
                    : 0}{' '}
                  keyword(s)
                </Text>
              </VStack>
              <HStack width={'100%'} gap={4}>
                <Text lineClamp={0} fontSize={'sm'} color={'gray.500'}>
                  Import keywords by uploading a file in one of the following formats: .txt, .xls,
                  or .xlsx
                </Text>
                <Box position="relative">
                  <Button
                    alignSelf={'flex-start'}
                    color={'primary.500'}
                    borderColor={'primary.500'}
                    paddingX={3}
                    gap={2}
                    size={'sm'}
                    variant={'outline'}
                    fontSize={'sm'}
                    fontWeight={'600'}
                  >
                    <MdOutlineFileDownload />
                    <Input
                      type="file"
                      position="absolute"
                      top={0}
                      left={0}
                      width="100%"
                      height="100%"
                      opacity={0}
                      cursor="pointer"
                      title=""
                      accept=".txt,.xls,.xlsx"
                      onChange={handleFileUpload}
                      _hover={{ cursor: 'pointer' }}
                    />
                    <Text>Import</Text>
                  </Button>
                </Box>
              </HStack>
            </VStack>
          </VStack>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default SelectKeywords
