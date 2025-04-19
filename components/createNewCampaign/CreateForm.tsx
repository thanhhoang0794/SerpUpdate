'use client'

import { Box, Text, VStack, HStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { read, utils } from 'xlsx'
import SelectKeywords from './SelectKeywords'
import DomainInformation from './DomainInformation'
import ScheduleSettings from './ScheduleSettings'
import GeneralInformation from './GeneralInformation'
import DialogNewCampaign from './DialogNewCampaign'
import toast from 'react-hot-toast'
import { useForm, useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import { useRouter } from 'next/navigation'
import { SearchEngine } from '@/app/types/enumSearchEngine'

const CreateForm = () => {
  const router = useRouter()
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      campaignName: '',
      isScheduleActive: false,
      isMobile: false,
      isDesktop: false,
      selectedLanguage: '',
      selectedLocation: '',
      ownDomain: '',
      competitorDomains: [],
      keywordText: '',
      schedule: {
        time: '09:00',
        days: {
          MON: false,
          TUE: false,
          WED: false,
          THU: false,
          FRI: false,
          SAT: false,
          SUN: false
        }
      },
      keywords: [],
      selectedSearchEngine: SearchEngine.GOOGLE
    }
  })

  const campaignName = useWatch<FormValues, 'campaignName'>({
    control,
    name: 'campaignName'
  })
  const isMobile = useWatch<FormValues, 'isMobile'>({
    control,
    name: 'isMobile'
  })
  const isDesktop = useWatch<FormValues, 'isDesktop'>({
    control,
    name: 'isDesktop'
  })
  const selectedLanguage = useWatch<FormValues, 'selectedLanguage'>({
    control,
    name: 'selectedLanguage'
  })
  const selectedLocation = useWatch<FormValues, 'selectedLocation'>({
    control,
    name: 'selectedLocation'
  })
  const ownDomain = useWatch<FormValues, 'ownDomain'>({
    control,
    name: 'ownDomain'
  })
  const keywordText = useWatch<FormValues, 'keywordText'>({
    control,
    name: 'keywordText'
  })
  const schedule = useWatch<FormValues, 'schedule'>({
    control,
    name: 'schedule'
  })
  const competitorDomains = useWatch<FormValues, 'competitorDomains'>({
    control,
    name: 'competitorDomains'
  })

  console.log('competitorDomains', competitorDomains)

  function handleShowModal() {
    setValue('keywords', [...new Set(keywordText.split('\n').map(keyword => keyword.trim()))])
    setIsModalVisible(true)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase()
      if (fileType === 'txt') {
        const text = await file.text()
        const cleanedText = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '')
          .join('\n')
        const uniqueKeywords = [...new Set(cleanedText.split('\n'))]
        setValue('keywordText', uniqueKeywords.join('\n'))
        toast.success(
          <div>
            <strong>Import keywords successfully</strong>
            <br />
            Keyword list has been updated
          </div>,
          {
            duration: 3000,
            position: 'top-right',
            style: {
              backgroundColor: '#C6F6D5',
              color: '#256053'
            }
          }
        )
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const data = await file.arrayBuffer()
        const workbook = read(data)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = utils.sheet_to_json<string[]>(firstSheet, { header: 1 })
        const uniqueKeywords = [...new Set(rows.map(row => row[0]))]
        const text = uniqueKeywords
          .map(keyword => keyword)
          .filter(keyword => keyword)
          .join('\n')

        setValue('keywordText', text)
        toast.success(
          <div>
            <strong>Import keywords successfully</strong>
            <br />
            Keyword list has been updated
          </div>,
          {
            duration: 3000,
            position: 'top-right',
            style: {
              borderLeft: '5px solid #38A169',
              padding: '12px 16px',
              color: '#2D3748',
              fontWeight: '700',
              fontSize: '16px',
              marginTop: '40px',
              backgroundColor: '#C6F6D5',
              borderRadius: '0'
            }
          }
        )
      }
      e.target.value = ''
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const isSaveDisabled = !(
    String(campaignName).trim().length > 0 &&
    (isMobile || isDesktop) &&
    String(selectedLanguage).trim().length > 0 &&
    String(selectedLocation).trim().length > 0 &&
    String(ownDomain).trim().length > 0 &&
    String(keywordText).trim().length > 0
  )

  function handleDialogSubmit() {
    handleSubmit(onSubmit)()
  }

   async function handleUpdate(id: string) {
     try {
       const response = await fetch('/api/update-campaign', {
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

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    let deviceType: string = ''

    if (data.isMobile && data.isDesktop) {
      deviceType = 'both'
    } else if (data.isMobile) {
      deviceType = 'mobile'
    } else if (data.isDesktop) {
      deviceType = 'desktop'
    }
    let activeDays: string[] = []
    let timeOfDay: string = ''
    if (data.isScheduleActive) {
      activeDays = Object.entries(data.schedule.days)
        .filter(([key, value]) => value === true)
        .map(([key]) => key)
      timeOfDay = data.schedule.time
    }

    const newCampaignData = {
      name: data.campaignName || '',
      devices: deviceType || '',
      country_code: data.selectedLocation || '',
      language: data.selectedLanguage || '',
      day_of_week: activeDays || [],
      time_of_day: timeOfDay || null,
      own_domain: data.ownDomain || '',
      keywords: data.keywords || [],
      competitor_domains: data.competitorDomains || [],
      search_engine: data.selectedSearchEngine || SearchEngine.GOOGLE
    }
    try {
      const origin = window.location.origin
      const response = await fetch(`${origin}/api/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCampaignData)
      })
      const result = await response.json()
      handleUpdate(result.data)
      setIsModalVisible(false)
      setLoading(false)
      router.push(`/campaigns`)
      toast.success(
        <div>
          <strong>Campaign created successfully</strong>
        </div>,
        {
          duration: 3000,
          position: 'top-right',
          style: {
            backgroundColor: '#C6F6D5',
            color: '#256053'
          }
        }
      )
    } catch (error) {
      console.error('Error creating campaign:', error)
    }
  }

  return (
    <Box marginLeft={6} alignSelf={'flex-start'} width={'100%'} overflowY={'auto'}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack width={'82%'} gap={4} borderRadius={'lg'}>
          <GeneralInformation control={control} />
          <DomainInformation control={control} />
          <SelectKeywords control={control} handleFileUpload={handleFileUpload} />
          <ScheduleSettings control={control} />
          <HStack width={'100%'} justifyContent={'flex-end'} gap={4}>
            <Button
              onClick={() => router.back()}
              variant={'solid'}
              size="md"
              backgroundColor={'gray.100'}
              paddingX={4}
              borderRadius={'md'}
            >
              <Text fontSize={'md'} color={'gray.800'}>
                Cancel
              </Text>
            </Button>
            <Button
              backgroundColor={'primary.500'}
              paddingX={4}
              borderRadius={'md'}
              disabled={isSaveDisabled}
              size="md"
              onClick={handleShowModal}
            >
              <Text fontSize={'md'} color={'white'}>
                Save
              </Text>
            </Button>
          </HStack>
        </VStack>
        <DialogNewCampaign
          control={control}
          scheduleText={`${schedule.time} every ${Object.entries(schedule.days)
            .filter(([_, isActive]) => isActive)
            .map(([day]) => day)
            .join(', ')}`}
          isOpen={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleDialogSubmit}
          loading={loading}
        />
      </form>
    </Box>
  )
}

export default CreateForm
