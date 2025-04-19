'use client'
import React, { Suspense } from 'react'
import { Table, VStack, Container } from '@chakra-ui/react'
import CampaignItem from './CampaignItem'
import CampaignHeader from './CampaignHeader'
import CampaignFooter from './CampaignFooter'
import { useSearchParams, usePathname } from 'next/navigation'
import { useQuery, useQueryClient } from 'react-query'
import { columnNameHeader } from '@/app/constant/columnNameHeaderCampaignList'
import { Campaign, SharedCampaign } from '@/app/types/campaigns'
import Loading from './ui/loading'
import { routes } from '@/utils/constant'
import { supabase } from '@/lib/supabaseClient'
import { fetchUserInfo } from '@/app/(home-pages)/dashboard/api'
import { useAtom } from 'jotai'
import { userInfoAtom } from '@/app/constant/atom'

// Define a new type that includes is_creator
type CampaignUser = {
  id: number | null | undefined
  campaigns: Campaign
  is_creator: boolean
}

// Define a new type that includes is_creator for shared campaigns
type SharedCampaignUser = {
  id: number | null | undefined
  campaigns: SharedCampaign
  is_creator: boolean
}

async function fetchCampaigns(page: number, pageSize: number, query: string) {
  const origin = window?.location?.origin
  const response = await fetch(
    `${origin}/api/campaigns?page=${page}&pageSize=${pageSize}&query=${query}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns')
  }
  return response.json()
}

async function fetchSharedCampaigns(page: number, pageSize: number, query: string) {
  const origin = window?.location?.origin
  const response = await fetch(
    `${origin}/api/shared-campaigns?page=${page}&pageSize=${pageSize}&query=${query}`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch campaigns')
  }
  return response.json()
}

const CampaignList = () => {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom)
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const page = parseInt(searchParams?.get('page') || '1', 10)
  const pageSize = parseInt(searchParams?.get('pageSize') || '10', 10)
  const query = searchParams?.get('query') || ''

  const isShareCampaign = pathname === routes.SHARE_CAMPAIGN

  React.useEffect(() => {
    fetchUserInfo().then((userInfo) => {
      if (userInfo?.auth.app_metadata.provider === 'email') {
        setUserInfo({
          email: userInfo?.auth.user_metadata.email,
          username: userInfo?.auth.user_metadata.username,
          avatar: userInfo?.profile.image_url
        })
      } else {
        setUserInfo({
          email: userInfo?.auth.user_metadata.email,
          username: userInfo?.auth.user_metadata.full_name,
          avatar: userInfo?.profile?.image_url
        });
      }
    })
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
          queryClient.invalidateQueries(isShareCampaign ? ['shared-campaigns'] : ['campaigns'])
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [queryClient, isShareCampaign])

  const { data, error, isLoading } = useQuery(
    isShareCampaign
      ? ['shared-campaigns', page, pageSize, query]
      : ['campaigns', page, pageSize, query],
    () =>
      isShareCampaign
        ? fetchSharedCampaigns(page, pageSize, query)
        : fetchCampaigns(page, pageSize, query),
    {
      keepPreviousData: true,
      staleTime: 5000
    }
  )

  React.useEffect(() => {
    if (isShareCampaign) {
      if (data?.pagination?.totalPages > page) {
        queryClient.prefetchQuery(['shared-campaigns', page + 1, pageSize, query], () =>
          fetchSharedCampaigns(page + 1, pageSize, query)
        )
      }
    } else {
      if (data?.pagination?.totalPages > page) {
        queryClient.prefetchQuery(['campaigns', page + 1, pageSize, query], () =>
          fetchCampaigns(page + 1, pageSize, query)
        )
      }
    }
  }, [data, page, pageSize, queryClient, isShareCampaign])

  if (error instanceof Error) return <div>Error: {error?.message}</div>

  return (
    <VStack width="100%" gap={4} padding={'0px 24px 36px 24px'}>
      <CampaignHeader />
      {isLoading ? (
        <Loading />
      ) : data?.message ? (
        <div>{data?.message}</div>
      ) : (
        <>
          <Container
            maxWidth={'100%'}
            maxHeight={'74vh'}
            paddingX={2}
            paddingY={3}
            backgroundColor={'white'}
            borderRadius={'xl'}
            overflowY={'auto'}
          >
            <Table.Root paddingX={2} paddingY={3} size="lg" position={'relative'}>
              <Table.Header border="none" backgroundColor={'white'}>
                <Table.Row border="none" color={'gray.600'}>
                  {Object.entries(columnNameHeader)
                    .filter(([key]) => isShareCampaign || key !== 'shareBy')
                    .map(([key, item], index) => {
                      return (
                        <Table.ColumnHeader
                          fontWeight={700}
                          borderBottom={'none'}
                          key={index}
                          color="gray.600"
                          fontSize="xs"
                          paddingY={3}
                          paddingLeft={4}
                          maxWidth={'fit-content'}
                        >
                          {item}
                        </Table.ColumnHeader>
                      )
                    })}
                  <Table.ColumnHeader borderBottom={'none'}> </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Suspense fallback={<div>Loading...</div>}>
                <Table.Body paddingX={2}>
                  {Array.isArray(data?.campaignUsers) &&
                    data?.campaignUsers.map(
                      (item: CampaignUser | SharedCampaignUser, index: number) => (
                        <CampaignItem
                          key={item?.id}
                          backgroundColor={index % 2 === 0 ? 'white' : 'gray.100'}
                          campaign={item?.campaigns}
                          isCreator={item?.is_creator}
                        />
                      )
                    )}
                </Table.Body>
              </Suspense>
            </Table.Root>
          </Container>
          <CampaignFooter pagination={data?.pagination} />
        </>
      )}
    </VStack>
  )
}

export default CampaignList
