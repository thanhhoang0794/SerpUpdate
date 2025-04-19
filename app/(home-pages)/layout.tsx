import { HStack, VStack } from '@chakra-ui/react'
import React from 'react'
import Sidebar from '@/components/sidebar'
import Header from '@/components/Header'
import { createClient } from '@/utils/supabase/server'
import { signOutAction } from '../actions'
import { fetchIsUserActive } from './UserAction'
import UserBlockedDialog from '@/components/UserBlockedDialog'
export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    await signOutAction()
    return
  }
  const result = await fetchIsUserActive(user.id)

  if (!result) {
    return <UserBlockedDialog />
  }

  return (
    <HStack width={'100%'} height={'100vh'} gap={0} overflowY={'hidden'} overflowX={'hidden'}>
      <Sidebar />
      <VStack backgroundColor="gray.100" width={'100%'} height={'100%'}>
        <Header />
        {children}
      </VStack>
    </HStack>
  )
}
