import React, { useState } from 'react'
import { AccordionItem, AccordionItemContent, AccordionItemTrigger, AccordionRoot } from '@/components/ui/accordion'
import { Text, VStack, HStack, Input } from '@chakra-ui/react'
import { Checkbox } from '@/components/ui/checkbox'
import { Control, Controller, useFieldArray, UseFormSetValue, useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCampaign'
import { Button } from '../ui/button'
import { Tag } from '../ui/tag'
import { useParams } from 'next/navigation'
import { MdAdd, MdEdit, MdRemove } from 'react-icons/md'
import SelectLanguageCampaignDetail from './SelectLanguageCampaignDetail'
import SelectLocationCampaignDetail from './SelectLocationCampaignDetail'
import toast from 'react-hot-toast'
import { useQueryClient } from 'react-query'
import { useMutation } from 'react-query'
import { capitalize } from 'lodash'
import SelectSearchEngineCampaignDetail from './SelectSearchEngineCampaignDetail'
import { AddNoteDialog } from './AddNoteDialog'
import { useFormContext } from 'react-hook-form'
interface GeneralInformationProps {
  isOwnerCampaign: boolean
  isUpdating: boolean
}

const GeneralInformation: React.FC<GeneralInformationProps> = ({ isOwnerCampaign, isUpdating }) => {
  const { id } = useParams() as { id: string }
  const [editting, setEditting] = useState(false)
  const { control } = useFormContext<FormValues>()
  const { watch, setValue, reset } = useFormContext<FormValues>()

  // Watch specific fields
  const values = watch()

  const {
    campaignName,
    selectedLocation: location,
    selectedLanguage: language,
    isMobile,
    isDesktop,
    competitorDomains,
    ownDomain,
    ownDomainName,
    competitorDomainsName,
    selectedSearchEngine
  } = values

  const [tempGeneralInformation, setTempGeneralInformation] = useState({
    campaignName,
    isMobile,
    isDesktop,
    language,
    location,
    ownDomainName,
    competitorDomainsName,
    selectedSearchEngine
  })
  const devices: string[] = []
  if (isMobile) {
    devices.push('Mobile')
  }
  if (isDesktop) {
    devices.push('Desktop')
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

  function handleEditGeneralInformation() {
    setEditting(true)
    setTempGeneralInformation({
      campaignName,
      isMobile,
      isDesktop,
      language,
      location,
      ownDomainName,
      competitorDomainsName,
      selectedSearchEngine
    })
  }

  function handleCancelEditGeneralInformation() {
    setValue('campaignName', tempGeneralInformation.campaignName)
    setValue('isMobile', tempGeneralInformation.isMobile)
    setValue('isDesktop', tempGeneralInformation.isDesktop)
    setValue('selectedLanguage', tempGeneralInformation.language)
    setValue('selectedLocation', tempGeneralInformation.location)
    setValue('ownDomainName', tempGeneralInformation.ownDomainName)
    setValue('competitorDomainsName', tempGeneralInformation.competitorDomainsName)
    setValue('selectedSearchEngine', tempGeneralInformation.selectedSearchEngine)
    setEditting(false)
  }

  const { fields, append, remove } = useFieldArray<FormValues, 'competitorDomainsName'>({
    control,
    name: 'competitorDomainsName'
  })

  const isSaveDisabled = !(
    campaignName !== tempGeneralInformation.campaignName ||
    isMobile !== tempGeneralInformation.isMobile ||
    isDesktop !== tempGeneralInformation.isDesktop ||
    language !== tempGeneralInformation.language ||
    location !== tempGeneralInformation.location ||
    competitorDomains.length !== fields.length ||
    ownDomainName !== tempGeneralInformation.ownDomainName ||
    competitorDomainsName !== tempGeneralInformation.competitorDomainsName ||
    selectedSearchEngine !== tempGeneralInformation.selectedSearchEngine
  )
  function handleSaveGeneralInformation() {
    const changes = {
      campaignName: campaignName !== tempGeneralInformation.campaignName ? campaignName : undefined,
      devices:
        isMobile !== tempGeneralInformation.isMobile || isDesktop !== tempGeneralInformation.isDesktop
          ? { isMobile, isDesktop }
          : undefined,
      language: language !== tempGeneralInformation.language ? language : undefined,
      location: location !== tempGeneralInformation.location ? location : undefined,
      ownDomainName: ownDomainName !== tempGeneralInformation.ownDomainName ? ownDomainName : undefined,
      competitorDomainsName:
        competitorDomainsName !== tempGeneralInformation.competitorDomainsName ? competitorDomainsName : undefined,
      selectedSearchEngine:
        selectedSearchEngine !== tempGeneralInformation.selectedSearchEngine ? selectedSearchEngine : undefined
    }
    const changedFields = Object.fromEntries(Object.entries(changes).filter(([_, value]) => value !== undefined))

    if (Object.keys(changedFields).length > 0) {
      toast.promise(
        editCampaignDetailMutation.mutateAsync(changedFields),
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
    }
  }

  const [latestInputIndex, setLatestInputIndex] = useState<number | null>(null)

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
        <AccordionItemTrigger indicatorPlacement="none" backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
          <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'sm'}>
            General Information
          </Text>
        </AccordionItemTrigger>
        {editting ? (
          <AccordionItemContent paddingX={4}>
            <VStack width={'100%'} gap={4} paddingX={4}>
              <HStack width={'100%'} gap={5} paddingX={4}>
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
                    Search Engine
                  </Text>
                  <SelectSearchEngineCampaignDetail control={control} />
                </VStack>
              </HStack>
              <HStack width={'100%'} gap={5} paddingX={4}>
                <VStack width={'100%'} gap={2}>
                  <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                    Languages
                  </Text>
                  <SelectLanguageCampaignDetail control={control} />
                </VStack>
                <VStack width={'100%'} gap={2}>
                  <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                    Location
                  </Text>
                  <SelectLocationCampaignDetail control={control} />
                </VStack>
              </HStack>
              <VStack width={'100%'} gap={2} paddingX={4}>
                <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                  Own domain
                </Text>
                <Controller
                  control={control}
                  name="ownDomainName"
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
                <VStack key={domain.id} width={'100%'} gap={4} paddingX={4}>
                  <Text alignSelf={'flex-start'} color={'gray.700'} fontWeight={'medium'}>
                    Competitor domain {index + 1}
                  </Text>
                  <Controller
                    control={control}
                    name={`competitorDomainsName.${index}.domain`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        width={'100%'}
                        borderColor={'gray.200'}
                        onChange={event => {
                          field.onChange(event)
                        }}
                        placeholder="Enter competitor domain"
                        readOnly={index !== latestInputIndex}
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
                      if (latestInputIndex === index) {
                        setLatestInputIndex(null)
                      }
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
                gap={2}
                size={'sm'}
                variant={'outline'}
                fontSize={'sm'}
                fontWeight={'600'}
                onClick={() => {
                  append({
                    id: fields.length + 1,
                    domain: ''
                  })
                  setLatestInputIndex(fields.length)
                }}
                marginLeft={4}
              >
                <MdAdd /> <Text>Add Competitor domains</Text>
              </Button>
              <HStack width={'100%'} justifyContent={'flex-end'} gap={4} paddingX={4}>
                <Button
                  onClick={handleCancelEditGeneralInformation}
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
                  disabled={isSaveDisabled}
                  backgroundColor={'primary.500'}
                  paddingX={3}
                  borderRadius={'sm'}
                  gap={2}
                  size="sm"
                  onClick={handleSaveGeneralInformation}
                >
                  <Text fontSize={'sm'} color={'white'}>
                    Save
                  </Text>
                </Button>
              </HStack>
            </VStack>
          </AccordionItemContent>
        ) : (
          <AccordionItemContent paddingX={4}>
            <VStack width={'100%'} gap={4} paddingX={4}>
              <HStack width={'100%'} gap={5}>
                <VStack width={'100%'} alignItems={'flex-start'} gap={1}>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Campaign Name
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {campaignName}
                    </Text>
                  </HStack>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Domain
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {ownDomain?.domain}
                    </Text>
                  </HStack>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Competitor
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {competitorDomains.length || 0}
                    </Text>
                  </HStack>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Total keywords
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {ownDomain?.keywords.length || 0}
                    </Text>
                  </HStack>
                </VStack>
                <VStack width={'100%'} alignItems={'flex-start'} gap={1}>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Location
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {location}
                    </Text>
                  </HStack>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Language
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {language}
                    </Text>
                  </HStack>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Devices
                    </Text>
                    <HStack gap={2}>
                      {Array.isArray(devices) &&
                        devices.map(device => (
                          <Tag
                            color={'blue.800'}
                            borderRadius={'md'}
                            paddingX={2}
                            backgroundColor={'blue.100'}
                            key={device}
                            fontSize={'sm'}
                            fontWeight={'medium'}
                          >
                            {device}
                          </Tag>
                        ))}
                    </HStack>
                  </HStack>
                  <HStack width={'100%'} gap={6} paddingY={2}>
                    <Text fontWeight={'semibold'} fontSize={'sm'} color={'gray.500'}>
                      Search Engine
                    </Text>
                    <Text fontWeight={'medium'} fontSize={'sm'} color={'gray.900'}>
                      {capitalize(selectedSearchEngine)}
                    </Text>
                  </HStack>
                </VStack>
              </HStack>

              {isOwnerCampaign && (
                <HStack width={'100%'} gap={6} paddingY={2} justifyContent={'flex-end'}>
                  <AddNoteDialog control={control} setValue={setValue} />
                  <Button
                    size={'sm'}
                    colorPalette={'blue'}
                    variant={'outline'}
                    color={'primary.500'}
                    alignSelf={'flex-end'}
                    gap={2}
                    paddingX={3}
                    onClick={handleEditGeneralInformation}
                    disabled={isUpdating}
                  >
                    <MdEdit />
                    Edit
                  </Button>
                </HStack>
              )}
            </VStack>
          </AccordionItemContent>
        )}
      </AccordionItem>
    </AccordionRoot>
  )
}

export default GeneralInformation
