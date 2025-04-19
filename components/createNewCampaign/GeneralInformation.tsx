import React from 'react'
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion'
import { Text, VStack, HStack, Input } from '@chakra-ui/react'
import { Checkbox } from '@/components/ui/checkbox'
import SelectLanguage from './SelectLanguage'
import SelectLocation from './SelectLocation'
import { Control, Controller } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import SelectSearchEngine from './SelectSearchEngine'
interface GeneralInformationProps {
  control: Control<FormValues>
}
const GeneralInformation: React.FC<GeneralInformationProps> = ({ control }) => {
  return (
    <AccordionRoot
      borderRadius={'lg'}
      padding={2}
      backgroundColor={'white'}
      collapsible
      variant={'plain'}
      defaultValue={['General Information']}
    >
      <AccordionItem value={'General Information'}>
        <AccordionItemTrigger backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            General Information
          </Text>
        </AccordionItemTrigger>
        <AccordionItemContent marginTop={5} marginBottom={4} paddingX={4}>
          <VStack width={'100%'} gap={5} paddingX={4}>
            <HStack width={'100%'} gap={6}>
              <VStack width={'100%'} gap={2}>
                <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                  Campaign Name
                </Text>
                <Controller
                  control={control}
                  name="campaignName"
                  render={({ field }) => (
                    <Input {...field} borderColor={'gray.200'} width={'100%'} placeholder="Enter campaign name" />
                  )}
                />
              </VStack>
              <VStack width={'100%'} gap={2}>
                <Text alignSelf={'flex-start'} fontWeight={'medium'} color={'gray.700'}>
                  Devices
                </Text>
                <HStack width={'100%'} gap={6} paddingY={2.5}>
                  <Controller
                    control={control}
                    name="isMobile"
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        value={String(field.value)}
                        checked={field.value}
                        onCheckedChange={checked => {
                          field.onChange(checked)
                        }}
                        colorPalette="blue"
                        fontSize={'sm'}
                        color={'gray.800'}
                      >
                        Mobile
                      </Checkbox>
                    )}
                  />
                  <Controller
                    control={control}
                    name="isDesktop"
                    render={({ field }) => (
                      <Checkbox
                        {...field}
                        value={String(field.value)}
                        checked={field.value}
                        onCheckedChange={checked => {
                          field.onChange(checked)
                        }}
                        colorPalette="blue"
                        fontSize={'sm'}
                        color={'gray.800'}
                      >
                        Desktop
                      </Checkbox>
                    )}
                  />
                </HStack>
              </VStack>
              <VStack width={'100%'} gap={2}>
                <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                  Search engine
                </Text>
                <SelectSearchEngine control={control} />
              </VStack>
            </HStack>
            <HStack width={'100%'} gap={6}>
              <VStack width={'100%'} gap={2}>
                <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                  Languages
                </Text>
                <SelectLanguage control={control} />
              </VStack>
              <VStack width={'100%'} gap={2}>
                <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                  Location
                </Text>
                <SelectLocation control={control} />
              </VStack>
            </HStack>
          </VStack>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default GeneralInformation
