import { createClient } from '@/utils/supabase/server'
import { VStack, Center } from '@chakra-ui/react'
export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user }
  } = await supabase.auth.getUser()

  return (
    <Center backgroundColor="primary.100" minHeight="100vh" minWidth={'100%'}>
      <VStack>{children}</VStack>
    </Center>
  )
}
