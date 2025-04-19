'use client'

import React from 'react'
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion'
import { Text, VStack, Input, Button } from '@chakra-ui/react'
import { MdRemove, MdAdd } from 'react-icons/md'
import { Controller, useFieldArray } from 'react-hook-form'
import { Control } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'

interface DomainInformationProps {
  control: Control<FormValues>
}
const DomainInformation: React.FC<DomainInformationProps> = ({ control }) => {
  const { fields, append, remove } = useFieldArray<FormValues, 'competitorDomains'>({
    control,
    name: 'competitorDomains'
  })
  return (
    <AccordionRoot
      backgroundColor={'white'}
      borderRadius={'lg'}
      padding={2}
      variant={'plain'}
      collapsible
      defaultValue={['Domain information']}
    >
      <AccordionItem value={'Domain information'}>
        <AccordionItemTrigger backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            Domain information
          </Text>
        </AccordionItemTrigger>
        <AccordionItemContent marginTop={5} marginBottom={4} paddingX={4}>
          <VStack width={'100%'} gap={5} paddingX={4}>
            <VStack width={'100%'} gap={6}>
              <VStack width={'100%'} gap={2}>
                <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                  Own domain
                </Text>
                <Controller
                  control={control}
                  name="ownDomain"
                  render={({ field }) => (
                    <Input
                      {...field}
                      onChange={event => {
                        field.onChange(event)
                      }}
                      borderColor={'gray.200'}
                      width={'100%'}
                      placeholder="Enter campaign name"
                    />
                  )}
                />
              </VStack>
              {fields.map((domain, index) => (
                <VStack key={domain.id} width={'100%'} gap={4}>
                  <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                    Competitor domain {index + 1}
                  </Text>
                  <Controller
                    control={control}
                    name={`competitorDomains.${index}.value`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        width={'100%'}
                        borderColor={'gray.200'}
                        onChange={event => {
                          field.onChange(event)
                        }}
                        placeholder="Enter competitor domain"
                      />
                    )}
                  />
                  <Button
                    alignSelf={'flex-start'}
                    color={'red.500'}
                    variant={'outline'}
                    size={'sm'}
                    onClick={() => {
                      remove(index)
                    }}
                  >
                    <MdRemove /> Remove this domain
                  </Button>
                </VStack>
              ))}
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
                onClick={() => {
                  append({ id: fields.length + 1, value: '' })
                }}
              >
                <MdAdd /> <Text>Add Competitor domains</Text>
              </Button>
            </VStack>
          </VStack>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default DomainInformation
