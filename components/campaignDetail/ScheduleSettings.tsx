import React, { useState } from 'react'
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion'
import { Text, VStack, HStack, Input, Flex, Button } from '@chakra-ui/react'
import { Controller } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCampaign'
import { MdEdit } from 'react-icons/md'
import { toast } from 'react-hot-toast'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from 'react-query'
import { useFormContext } from 'react-hook-form'

interface ScheduleSettingsProps {
  isOwnerCampaign: boolean
  isUpdating: boolean
}

const ScheduleSettings: React.FC<ScheduleSettingsProps> = ({ isOwnerCampaign, isUpdating }) => {
  const { id } = useParams() as { id: string }
  const { control, setValue, watch } = useFormContext<FormValues>()
  const [editting, setEditting] = useState(false)

  const values = watch()
  const { schedule, isScheduleActive } = values
  const [tempSchedule, setTempSchedule] = useState(schedule)
  const [tempTime, setTempTime] = useState(schedule?.time)

  const handleEditSchedule = () => {
    setTempTime(schedule?.time)
    setTempSchedule(schedule)
    setEditting(true)
  }

  const handleCancelEdit = () => {
    setValue('schedule.time', tempTime)
    setValue('schedule', tempSchedule)
    setEditting(false)
  }

  const queryClient = useQueryClient()
  const origin = window.location.origin
  const editCampaignDetailMutation = useMutation({
    mutationFn: (data: any) => {
      return fetch(`${origin}/api/campaignDetail/?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries(['campaignDetail', id])
    }
  })

  function handleSaveSchedule() {
    const scheduleData = {
      time_of_day: schedule.time,
      day_of_week: Object.entries(schedule.days)
        .filter(([_, value]) => value === true)
        .map(([day]) => day)
    }
    toast.promise(
      editCampaignDetailMutation.mutateAsync(scheduleData),
      {
        loading: 'Updating campaign...',
        success: 'Successfully saved',
        error: err => `This just happened: ${err.toString()}`
      },
      {
        duration: 5000,
        position: 'top-right',
        success: {
          style: {
            borderLeft: '5px solid #38A169',
            padding: '12px 16px',
            color: '#2D3748',
            fontWeight: '700',
            fontSize: '16px',
            backgroundColor: '#C6F6D5',
            borderRadius: '0'
          }
        }
      }
    )
    setEditting(false)
    setTempSchedule(schedule)
    setTempTime(schedule?.time)
  }

  return (
    <AccordionRoot
      backgroundColor={'white'}
      borderRadius={'lg'}
      padding={2}
      variant={'plain'}
      defaultValue={['Schedule settings']}
    >
      <AccordionItem value={'Schedule settings'}>
        <AccordionItemTrigger indicatorPlacement="none" backgroundColor={'primary.50'} paddingX={6} paddingY={2}>
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            Schedule settings
          </Text>
        </AccordionItemTrigger>
        {editting ? (
          <AccordionItemContent paddingX={6}>
            <VStack width={'100%'} gap={4} paddingX={2}>
              <HStack width={'100%'} gap={6} justifySelf={'flex-start'} alignSelf={'flex-start'}>
                <Controller
                  control={control}
                  name="schedule.time"
                  render={({ field }) => (
                    <Input
                      type="time"
                      {...field}
                      step="3600"
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
                      name={`schedule.days.${day}` as any}
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
                          width={'128px'}
                          height={'40px'}
                          color={field.value ? 'white' : 'gray.700'}
                          _hover={editting ? { cursor: 'pointer' } : { cursor: 'disabled' }}
                          onClick={() => {
                            if (!editting) return
                            field.onChange(!field.value)
                          }}
                        >
                          {day}
                        </Flex>
                      )}
                    />
                  ))}
                </HStack>
              </HStack>
              <HStack width={'100%'} justifyContent={'flex-end'} gap={4}>
                <Button
                  onClick={handleCancelEdit}
                  variant={'solid'}
                  size="sm"
                  backgroundColor={'gray.100'}
                  paddingX={3}
                  borderRadius={'md'}
                  gap={2}
                >
                  <Text fontSize={'sm'} color={'gray.800'}>
                    Cancel
                  </Text>
                </Button>
                <Button
                  backgroundColor={'primary.500'}
                  onClick={handleSaveSchedule}
                  paddingX={3}
                  borderRadius={'sm'}
                  gap={2}
                  size="sm"
                >
                  <Text fontSize={'sm'} color={'white'}>
                    Save
                  </Text>
                </Button>
              </HStack>
            </VStack>
          </AccordionItemContent>
        ) : (
          <AccordionItemContent paddingX={6}>
            <VStack width={'100%'} gap={4} paddingX={2} justifyContent={'space-between'}>
              <HStack width={'100%'} gap={6} justifySelf={'flex-start'} alignSelf={'flex-start'}>
                <Controller
                  control={control}
                  name="schedule.time"
                  render={({ field }) => (
                    <Input
                      type="time"
                      {...field}
                      value={field.value}
                      onChange={e => field.onChange(e.target.value)}
                      disabled={!isScheduleActive}
                      width={'240px'}
                      paddingX={6}
                    />
                  )}
                />
                <HStack borderColor={'gray.200'} borderWidth={1} borderRadius={'md'} gap={0}>
                  {Object.entries(schedule?.days)?.map(([day], index: number) => (
                    <Controller
                      key={index}
                      name={`schedule.days.${day}` as any}
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
                          width={'128px'}
                          height={'40px'}
                          color={field.value ? 'white' : 'gray.700'}
                          _hover={isScheduleActive ? { cursor: 'pointer' } : { cursor: 'disabled' }}
                          onClick={() => {
                            if (!isScheduleActive) return
                            field.onChange(!field.value)
                          }}
                        >
                          {day}
                        </Flex>
                      )}
                    />
                  ))}
                </HStack>
              </HStack>
              {isOwnerCampaign && (
                <Button
                  size={'sm'}
                  colorPalette={'blue'}
                  variant={'outline'}
                  color={'primary.500'}
                  alignSelf={'flex-end'}
                  gap={2}
                  paddingX={3}
                  onClick={handleEditSchedule}
                  disabled={isUpdating}
                >
                  <MdEdit />
                  Edit
                </Button>
              )}
            </VStack>
          </AccordionItemContent>
        )}
      </AccordionItem>
    </AccordionRoot>
  )
}

export default ScheduleSettings
