import { Center, Container, Flex } from '@chakra-ui/react'
export default function EmptyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Flex backgroundColor="primary.100" minHeight="100vh" minWidth={'100%'}>
      {children}
    </Flex>
  ) // Không sử dụng layout nào
}
