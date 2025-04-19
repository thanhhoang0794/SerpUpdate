'use client'

import React from 'react'
import { Image, VStack, Button, Box, Text, Container, Separator } from '@chakra-ui/react'
import { Link as ChakraLink } from '@chakra-ui/react'
import NextLink from 'next/link'
import { MdOutlineDashboard, MdOutlineFolderShared, MdOutlineCampaign, MdMoney } from 'react-icons/md'
import { usePathname } from 'next/navigation'
import { routes } from '@/utils/constant'

interface LinkItemProps {
  name: string
  icon: JSX.Element
  link: string
}

const LinkItems: Array<LinkItemProps> = [
  { name: 'Dashboard', icon: <MdOutlineDashboard />, link: routes.DASHBOARD },
  { name: 'Campaigns', icon: <MdOutlineCampaign />, link: routes.CAMPAIGN },
  { name: 'Shared Campaigns', icon: <MdOutlineFolderShared />, link: routes.SHARE_CAMPAIGN },
  { name: 'Credit', icon: <MdMoney />, link: routes.CREDIT }
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <Container
      width={'260px'}
      height="100%"
      backgroundColor="gray.700"
      display="flex"
      paddingX={4}
      paddingY={10}
    >
      <VStack width={'100%'} height={'100%'} gap={10}>
        <Image src="/image.svg" alt="Logo" width={'200px'} />
        <VStack gap={1} minWidth={'100%'} justify={'flex-start'}>
          {LinkItems.map((item) => (
            <React.Fragment key={item.link}>
              {item.name === 'Credit' && <Separator marginY={3} />}
              <ChakraLink minWidth="100%" textDecoration="none" asChild>
                <NextLink href={item.link}>
                  <Button
                    color={pathname === item.link ? 'white' : 'whiteAlpha.700'}
                    size="lg"
                    width="100%"
                    paddingX={4}
                    paddingY={3}
                    justifyContent="flex-start"
                    variant="ghost"
                    background={pathname === item.link ? '#FFFFFF3D' : 'transparent'}
                    _hover={{ bg: '#FFFFFF3D', color: 'white' }}
                  >
                    <Box as={item.icon.type} width="24px" height="24px" />
                    <Text textStyle="md">{item.name}</Text>
                  </Button>
                </NextLink>
              </ChakraLink>
            </React.Fragment>
          ))}
        </VStack>
      </VStack>
    </Container>
  )
}
