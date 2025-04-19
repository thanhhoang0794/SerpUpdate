import React from 'react'
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot
} from '@/components/ui/accordion'
import { Switch } from '@/components/ui/switch'
import { Text, VStack, HStack, Input, Flex } from '@chakra-ui/react'
import { Control, Controller, useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
interface ScheduleSettingsProps {
  control: Control<any>
}
const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({ control }) => {
  const schedule = useWatch<FormValues, 'schedule'>({
    control,
    name: 'schedule'
  })

  const isScheduleActive = useWatch<FormValues, 'isScheduleActive'>({
    control,
    name: 'isScheduleActive'
  })

  return (
    <AccordionRoot
      backgroundColor={'white'}
      borderRadius={'lg'}
      padding={2}
      variant={'plain'}
      collapsible
      defaultValue={['Schedule settings']}
    >
      <AccordionItem value={'Schedule settings'}>
        <AccordionItemTrigger backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            Schedule settings
          </Text>
        </AccordionItemTrigger>
        <AccordionItemContent marginTop={5} marginBottom={4} paddingX={4}>
          <VStack width={'100%'} gap={5} paddingX={4}>
            <HStack width={'100%'} gap={3}>
              <Controller
                control={control}
                name="isScheduleActive"
                render={({ field }) => (
                  <Switch
                    onChange={(e) => {
                      return field.onChange((e.target as HTMLInputElement).checked)
                    }}
                    colorPalette="blue"
                    checked={field.value}
                  >
                    <Text fontWeight={'400'} color={'black'} fontSize={'md'}>
                      Allow active schedules
                    </Text>
                  </Switch>
                )}
              />
            </HStack>

            {isScheduleActive && (
              <VStack width={'100%'} gap={4}>
                <HStack gap={6} justifySelf={'flex-start'} alignSelf={'flex-start'}>
                  <Controller
                    control={control}
                    name="schedule.time"
                    render={({ field }) => (
                      <Input
                        type="time"
                        step="3600"
                        {...field}
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        width={'240px'}
                        paddingX={4}
                      />
                    )}
                  />
                  <HStack borderColor={'gray.200'} borderWidth={1} borderRadius={'md'} gap={0}>
                    {Object.entries(schedule?.days)?.map(([day], index: number) => (
                      <Controller
                        key={index}
                        name={`schedule.days.${day}`}
                        control={control}
                        render={({ field }) => (
                          <Flex
                            backgroundColor={field.value ? 'primary.500' : 'primary.50'}
                            borderTopLeftRadius={day === 'MON' ? 'md' : 'none'}
                            borderBottomLeftRadius={day === 'MON' ? 'md' : 'none'}
                            borderTopRightRadius={day === 'SUN' ? 'md' : 'none'}
                            borderBottomRightRadius={day === 'SUN' ? 'md' : 'none'}
                            justify={'center'}
                            align={'center'}
                            width={'75px'}
                            height={'40px'}
                            color={field.value ? 'white' : 'gray.700'}
                            _hover={{ cursor: 'pointer' }}
                            onClick={() => field.onChange(!field.value)}
                          >
                            {day}
                          </Flex>
                        )}
                      />
                    ))}
                  </HStack>
                </HStack>
              </VStack>
            )}
          </VStack>
        </AccordionItemContent>
      </AccordionItem>
    </AccordionRoot>
  )
}

export default ScheduleSettings
