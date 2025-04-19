'use client'
import React, { useEffect, useState, Suspense, useMemo } from 'react'
import { VStack } from '@chakra-ui/react'
import GeneralInformation from './GeneralInformation'
import { useForm } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCampaign'
import ScheduleSettings from './ScheduleSettings'
import KeywordTopList from './KeywordTopList'
import SerpUpdateTable from './SerpUpdateTable'
import { useWatch } from 'react-hook-form'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from 'react-query'
import Loading from '../ui/loading'
import { campaignNameAtom } from '@/app/constant/atom'
import { useSetAtom } from 'jotai'
import { ShareCampaignDialog } from './ShareCampaignDialog'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabaseClient'
import { fetchCampaignDetail } from '@/app/(home-pages)/campaigns/[id]/api'
import CompareChart from './CompareChart'
import { FormProvider } from 'react-hook-form'

const MemoizedGeneralInformation = React.memo(GeneralInformation)
const MemoizedScheduleSettings = React.memo(ScheduleSettings)

export default function CampaignDetail() {
  const router = useRouter()
  const setCampaignName = useSetAtom(campaignNameAtom)
  const { id } = useParams() as { id: string }
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(true)
  React.useEffect(() => {
    const subscription = supabase
      .channel('campaigns-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns'
        },
        payload => {
          queryClient.invalidateQueries(['campaignDetail', id])
        }
      )
      .subscribe()
    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, id])

  const methods = useForm<FormValues>({
    defaultValues: {
      id: undefined,
      campaignName: '',
      isMobile: true,
      isDesktop: true,
      selectedLanguage: '',
      selectedLocation: '',
      ownDomain: undefined,
      competitorDomains: [],
      schedule: {
        time: '19:00',
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
      domains: [],
      isEditing: false,
      updating: false,
      selectedSearchEngine: undefined,
      campaignNote: ''
    }
  })

  const { control, reset } = methods

  const { data, isError } = useQuery(['campaignDetail', id], () => fetchCampaignDetail(id), {
    onSuccess: data => {
      if (!data) return
      const formattedData = {
        id: data?.id,
        ownDomainName: data?.domains?.find((d: any) => d.domain_type === 'own')?.domain,
        competitorDomainsName: data?.domains
          .filter((domain: any) => domain.domain_type === 'competitor')
          .map((domain: any) => ({
            id: domain.id,
            domain: domain.domain
          })),
        campaignName: data?.name,
        selectedLanguage: data?.language,
        selectedLocation: data?.country_code,
        selectedSearchEngine: data?.search_engine,
        campaignNote: data?.note,
        updating: data?.updating,
        isMobile: data?.devices === 'both' || data?.devices === 'mobile',
        isDesktop: data?.devices === 'both' || data?.devices === 'desktop',
        ownDomain: data?.domains?.find((d: any) => d.domain_type === 'own'),
        competitorDomains: data?.domains?.filter((d: any) => d.domain_type === 'competitor'),
        domains: data?.domains?.sort((a: any, b: any) =>
          a.domain_type === 'own' ? -1 : b.domain_type === 'own' ? 1 : 0
        ),
        selectedDomain: data?.domains?.[0],
        schedule: {
          time: data?.time_of_day || '19:00',
          days: {
            MON: data?.day_of_week?.includes('MON'),
            TUE: data?.day_of_week?.includes('TUE'),
            WED: data?.day_of_week?.includes('WED'),
            THU: data?.day_of_week?.includes('THU'),
            FRI: data?.day_of_week?.includes('FRI'),
            SAT: data?.day_of_week?.includes('SAT'),
            SUN: data?.day_of_week?.includes('SUN')
          }
        }
      }

      reset(formattedData)
      setCampaignName(data?.name)
      setIsLoading(false)
    }
  })

  if (isLoading) {
    return <Loading />
  }
  if (isError) {
    return null
  }

  return (
    <FormProvider {...methods}>
      <VStack width="100%" overflowY="auto" gap={4} padding={'0px 12px 24px 12px'}>
        {data?.isOwnerCampaign && <ShareCampaignDialog id={id} />}
        <MemoizedGeneralInformation isOwnerCampaign={data?.isOwnerCampaign} isUpdating={data?.updating} />
        <MemoizedScheduleSettings isOwnerCampaign={data?.isOwnerCampaign} isUpdating={data?.updating} />
        {data?.updating ? (
          <Loading />
        ) : (
          <Suspense fallback={<Loading />}>
            <KeywordTopList />
            <CompareChart />
            <SerpUpdateTable isOwnerCampaign={data?.isOwnerCampaign} />
          </Suspense>
        )}
      </VStack>
    </FormProvider>
  )
}
