'use client'
import { VStack } from '@chakra-ui/react'
import { useSearchParams } from 'next/navigation'
import { PopUpCongratulation } from './components/PopUpCongratulation'
import FeatureCard from './components/FeatureCard'
import CreditInfo from './components/CreditInfo'
import Header from './components/Header'
import { useEffect, useState } from 'react'
import Loading from '@/components/ui/loading'
import { useAtom } from 'jotai'
import { userInfoAtom, userPlanTypeAtom, infoCreditsAtom, totalTopKeywordsDashboardAtom } from '@/app/constant/atom'
import { fetchUserCampaigns, fetchUserInfo, fetchCredit } from './api'
import { PlanType } from '@/app/constant/planTypeEnum'

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const status = searchParams ? searchParams.get('status') : null
  const [isLoading, setIsLoading] = useState(true)
  const [userInfo, setUserInfo] = useAtom(userInfoAtom)
  const [userPlanType, setUserPlanType] = useAtom(userPlanTypeAtom)
  const [infoCredits, setInfoCredits] = useAtom(infoCreditsAtom)
  const [totalTopKeywords, setTotalTopKeywords] = useAtom(totalTopKeywordsDashboardAtom)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const userInfo = await fetchUserInfo()
      setUserPlanType({ plan: userInfo?.profile.plan_type })

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
        })
      }
      if (userInfo?.profile.plan_type === PlanType.PaidPlan) {
        const [credit, data] = await Promise.all([fetchCredit(), fetchUserCampaigns()])

        if (credit && 'total_credits' in credit) {
          setInfoCredits({
            total_credits: credit.total_credits,
            bonus_credits: credit.bonus_credits,
            creditHistories: credit.creditHistories
          })
        }
        if (data && data.campaignUsers && data.campaignUsers.length > 0) {
          setTotalTopKeywords(data.campaignUsers)
        }
      }
      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <VStack width={'100%'} paddingX={6} gapY={4} overflowY={'auto'}>
      {status === 'free-plan-unlocked' && <PopUpCongratulation />}
      <Header />
      <FeatureCard />
      <CreditInfo />
    </VStack>
  )
}
