import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from '@/components/ui/dialog'
import { DataListRoot, DataListItem } from '@/components/ui/data-list'
import React from 'react'
import { Separator, HStack, Button, Text } from '@chakra-ui/react'
import { Tag } from '@/components/ui/tag'
import { Control } from 'react-hook-form'
import { useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import { SearchEngine } from '@/app/types/enumSearchEngine'
import { capitalize } from 'lodash'

interface DialogNewCampaignProps {
  scheduleText: string
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void
  control: Control<FormValues>
  loading: boolean
}

const DialogNewCampaign = ({ scheduleText, isOpen, onClose, onSubmit, control, loading }: DialogNewCampaignProps) => {
  const campaignName =
    useWatch<FormValues, 'campaignName'>({
      control,
      name: 'campaignName'
    }) || ''
  const ownDomain =
    useWatch<FormValues, 'ownDomain'>({
      control,
      name: 'ownDomain'
    }) || ''
  const competitorDomains =
    useWatch<FormValues, 'competitorDomains'>({
      control,
      name: 'competitorDomains'
    }) || []
  const isMobile =
    useWatch<FormValues, 'isMobile'>({
      control,
      name: 'isMobile'
    }) || false
  const isDesktop =
    useWatch<FormValues, 'isDesktop'>({
      control,
      name: 'isDesktop'
    }) || false
  const keywords =
    useWatch<FormValues, 'keywords'>({
      control,
      name: 'keywords'
    }) || []
  const isScheduleActive =
    useWatch<FormValues, 'isScheduleActive'>({
      control,
      name: 'isScheduleActive'
    }) || false
  const devices: string[] = []
  const searchEngine =
    useWatch<FormValues, 'selectedSearchEngine'>({
      control,
      name: 'selectedSearchEngine'
    }) || SearchEngine.GOOGLE
  if (isMobile) {
    devices.push('Mobile')
  }
  if (isDesktop) {
    devices.push('Desktop')
  }

  return (
    <DialogRoot
      motionPreset="slide-in-bottom"
      placement={'center'}
      key={'sm'}
      size={'sm'}
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <Text fontSize="lg" fontWeight={'500'}>
              Preview your campaign
            </Text>
          </DialogTitle>
        </DialogHeader>
        <Separator />
        <DialogBody pb="8">
          <DataListRoot orientation="horizontal">
            <DataListItem label="Campaign name" value={campaignName} />
            <DataListItem label="Search engine" value={capitalize(searchEngine)} />
            <DataListItem
              label="Devices"
              value={
                <HStack gap={2}>
                  {Array.isArray(devices) &&
                    devices.map(device => (
                      <Tag
                        color={'blue.800'}
                        borderRadius={'md'}
                        paddingX={2}
                        backgroundColor={'blue.100'}
                        key={device}
                      >
                        {device}
                      </Tag>
                    ))}
                </HStack>
              }
            />

            <DataListItem label="Own domain" value={ownDomain} />
            {Array.isArray(competitorDomains) && competitorDomains?.length > 0 ? (
              <DataListItem label="Competitor domain" value={competitorDomains?.length} />
            ) : (
              ''
            )}
            {Array.isArray(keywords) && keywords?.length > 0 ? (
              <DataListItem label="Keywords Count" value={keywords?.length} />
            ) : (
              ''
            )}
            {isScheduleActive && scheduleText && <DataListItem label="Schedule" value={scheduleText} />}
          </DataListRoot>
        </DialogBody>
        <Separator />
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button borderRadius={'md'} paddingX={4} paddingY={2.5} borderColor={'gray.200'} variant="outline">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button
            borderRadius={'md'}
            paddingX={4}
            backgroundColor={'primary.500'}
            onClick={onSubmit}
            disabled={loading}
          >
            <Text fontWeight={'semibold'} fontSize="md">
              {loading ? 'Creating...' : 'Confirm and create campaign'}
            </Text>
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}

export default DialogNewCampaign
