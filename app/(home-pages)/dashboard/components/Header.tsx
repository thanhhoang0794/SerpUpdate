'use client'

import { HStack, VStack, Text, Button, Box } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { routes } from '@/utils/constant'
import { useAtom } from 'jotai'
import { userPlanTypeAtom, userInfoAtom } from '@/app/constant/atom'
import { updateUserPlan, addBonusCredits } from '../api'
import { PlanType } from '@/app/constant/planTypeEnum'

export default function Header() {
  const [userPlanType, setUserPlanType] = useAtom(userPlanTypeAtom)
  const [userInfo, setUserInfo] = useAtom(userInfoAtom)
  const userName = userInfo?.username
  const router = useRouter()

  async function handleGetFreePlan() {
    try {
      await updateUserPlan(PlanType.FreePlan)
      await addBonusCredits(50)

      setUserPlanType(prevState => ({
        ...prevState,
        plan: PlanType.FreePlan
      }))
      router.push(routes.DASHBOARD_FREE_PLAN_POPUP)
    } catch (error) {
      console.error('Error updating plan:', error)
    }
  }

  return (
    <Box width="100%">
      {userPlanType?.plan === PlanType.NoPlan && (
        <HStack
          width="100%"
          justifyContent="space-between"
          backgroundColor="white"
          paddingX={6}
          paddingY={10}
          borderRadius="lg"
          boxShadow="md"
          flex="1"
        >
          <VStack alignItems="flex-start">
            <HStack>
              <Text fontSize="2xl" fontWeight="600">
                Hi {userName}! Welcome to
              </Text>
              <Text as="span" color="primary.500" fontSize="2xl" fontWeight={'700'}>
                SERP
                <Text as="span" color="#97BC62" fontSize="2xl" fontWeight={'700'}>
                  UPDATE
                </Text>
              </Text>
            </HStack>
            <Text fontSize={'md'} color="gray.700" fontWeight="medium">
              Check your keyword rankings now with a{' '}
              <Text as="span" fontWeight="700">
                free trial!
              </Text>
            </Text>
          </VStack>
          <Button
            variant="solid"
            backgroundColor="primary.500"
            color="white"
            size="lg"
            borderRadius="md"
            onClick={handleGetFreePlan}
          >
            Get free plan
          </Button>
        </HStack>
      )}
      {userPlanType?.plan === PlanType.FreePlan && (
        <HStack
          width="100%"
          justifyContent="space-between"
          backgroundColor="white"
          paddingX={6}
          paddingY={10}
          borderRadius="lg"
          boxShadow="md"
          flex="1"
        >
          <VStack alignItems="flex-start">
            <Text fontSize="2xl" fontWeight="600">
              Hi {userName}! You're on
              <Text as="span" color="primary.500" marginLeft={1} fontWeight={'700'}>
                Free Plan
              </Text>
            </Text>
            <Text fontSize={'md'} fontWeight="medium" color="gray.700">
              Buy more{' '}
              <Text as="span" fontWeight={'700'}>
                credit
              </Text>
              , get more{' '}
              <Text as="span" fontWeight={'700'}>
                bonus!
              </Text>
            </Text>
          </VStack>
          <Button
            variant="solid"
            backgroundColor="primary.500"
            color="white"
            size="lg"
            borderRadius="md"
            onClick={() => router.push(routes.CREDIT)}
          >
            Buy Credit
          </Button>
        </HStack>
      )}
      {userPlanType?.plan === PlanType.PaidPlan && (
        <HStack
          width="100%"
          justifyContent="space-between"
          backgroundColor="white"
          paddingX={6}
          paddingY={10}
          borderRadius="lg"
          boxShadow="md"
          flex="1"
        >
          <VStack alignItems="flex-start">
            <Text fontSize="2xl" fontWeight="600">
              Keep
              <Text as="span" color="primary.500" marginLeft={1} fontWeight={'700'}>
                tracking
              </Text>
              , keep
              <Text as="span" color="primary.500" marginLeft={1} fontWeight={'700'}>
                growing
              </Text>
            </Text>
            <Text fontSize={'md'} fontWeight="medium" color="gray.700">
              Update your SERP today!
            </Text>
          </VStack>
          <Button
            variant="solid"
            backgroundColor="primary.500"
            color="white"
            size="lg"
            borderRadius="md"
            onClick={() => router.push(routes.CAMPAIGN)}
          >
            Go to SERP campaigns
          </Button>
        </HStack>
      )}
    </Box>
  )
}
