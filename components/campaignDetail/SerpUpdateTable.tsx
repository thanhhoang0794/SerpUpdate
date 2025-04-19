import React from 'react'
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion'
import { Text, VStack } from '@chakra-ui/react'
import { NativeSelectField, NativeSelectRoot } from '@/components/ui/native-select'
import SerpUpdateTableHeader from './SerpUpdateTableHeader'
import SerpUpdateTableList from './SerpUpdateTableList'
import { FormValues } from '@/app/types/formValuesCampaign'
import { Domain } from '@/app/types/domains'
import { Controller, useFormContext } from 'react-hook-form'
interface SerpUpdateTableProps {
  isOwnerCampaign: boolean
}

const SerpUpdateTable: React.FC<SerpUpdateTableProps> = ({ isOwnerCampaign }) => {
  const { control, watch } = useFormContext<FormValues>()
  const values = watch()
  const domains = values.domains

  return (
    <AccordionRoot
      borderRadius={'lg'}
      padding={2}
      backgroundColor={'white'}
      variant={'plain'}
      defaultValue={['General Information']}
      boxShadow={'base'}
    >
      <AccordionItem value={'General Information'}>
        <AccordionItemTrigger
          indicatorPlacement="none"
          backgroundColor={'primary.50'}
          paddingX={4}
          paddingY={2}
          width={'100%'}
        >
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            SERP Update Table
          </Text>

          <NativeSelectRoot backgroundColor={'white'} size={'sm'} width={'320px'}>
            <Controller
              name="selectedDomain"
              control={control}
              render={({ field }) => (
                <NativeSelectField
                  {...field}
                  value={field.value?.domain || ''}
                  onChange={event => {
                    const value = event.target.value
                    const matchedItem = domains.find(item => item.domain === value)
                    if (matchedItem) {
                      field.onChange(matchedItem)
                    }
                  }}
                >
                  {domains.map((item: Domain, index: number) => {
                    return (
                      <option value={item.domain} key={index}>
                        {item.domain}
                      </option>
                    )
                  })}
                </NativeSelectField>
              )}
            />
          </NativeSelectRoot>
        </AccordionItemTrigger>
        <AccordionItemContent paddingY={5}>
          <VStack width="100%" gap={5}>
            <SerpUpdateTableHeader isOwnerCampaign={isOwnerCampaign} />
            <SerpUpdateTableList />
          </VStack>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default SerpUpdateTable
