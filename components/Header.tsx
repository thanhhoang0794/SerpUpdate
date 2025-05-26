'use client'
import { Text, Flex, HStack, Stack, Box, VStack, Button, Badge, Skeleton, Image } from '@chakra-ui/react'
import { Avatar } from '@/components/ui/avatar'
import { MdOutlineMessage } from 'react-icons/md'
import { MdNotificationsNone } from 'react-icons/md'
import { BreadcrumbLink, BreadcrumbRoot } from '@/components/ui/breadcrumb'
import { FaRegCircleUser } from 'react-icons/fa6'
import { MdLogout } from 'react-icons/md'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { breadcrumbsRoutes } from '@/utils/breadcumbs'
import { useAtomValue } from 'jotai'
import { campaignNameAtom } from '@/app/constant/atom'
import { signOutAction } from '@/app/actions'
import { routes } from '@/utils/constant'
import { useAtom } from 'jotai'
import { userInfoAtom } from '@/app/constant/atom'

const Header = () => {
  const pathname = usePathname() || ''
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [userInfo, setUserInfo] = useAtom(userInfoAtom)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const campaignName = useAtomValue(campaignNameAtom)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Determine breadcrumb content based on current route
  const getBreadcrumbs = () => {
    if (!pathname) {
      return null
    }

    // pathSegments is an array of the path segments
    const pathSegments = pathname?.split('/')?.filter((segment: string) => segment)
    const newPathSegments = pathSegments?.map(segment => `/${segment}`)
    const breadcrumbs = newPathSegments?.map((segment, index) => {
      // find the route object that matches the segment
      const route = breadcrumbsRoutes?.find(route => route.path === segment)
      // segmentPath is the path of the segment
      const segmentPath = `/${pathSegments?.slice(0, index + 1)?.join('/')}`
      let displayName = route ? route?.displayName : ''
      if (!isNaN(Number(segment.replace('/', ''))) && campaignName) {
        displayName = campaignName || displayName
      }

      return {
        displayName: displayName,
        segmentPath: segmentPath
      }
    })

    return (
      <BreadcrumbRoot size="md">
        {Array.isArray(breadcrumbs) &&
          breadcrumbs?.map(({ displayName, segmentPath }, index) => {
            const isLast = index === breadcrumbs.length - 1

            return (
              // <Link href={segmentPath} passHref key={index}>
              <BreadcrumbLink
                href={segmentPath}
                fontWeight="500"
                fontSize="16px"
                color={isLast ? 'gray.900' : 'gray.500'}
                key={index}
              >
                {displayName}
              </BreadcrumbLink>
              // </Link>
            )
          })}
      </BreadcrumbRoot>
    )
  }

  return (
    <HStack
      width="100%"
      height="72px"
      backgroundColor="white"
      justifyContent="space-between"
      paddingY={4}
      paddingX={6}
    >
      <HStack justifyContent={'flex-start'}>
        {pathname === routes.CHECKOUT ? <Image src="/image.svg" alt="Logo" width={'200px'} /> : getBreadcrumbs()}
      </HStack>

      <HStack justifyContent={'flex-end'} gap={1}>
        {/* <Flex
          width={10}
          height={10}
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          _hover={{ background: '#00000014', borderRadius: '8px', transition: '0.25s' }}
        >
          <MdOutlineMessage size={24} color="#4A5568" />
        </Flex>
        <Flex
          width={10}
          height={10}
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          position="relative"
          _hover={{ background: '#00000014', borderRadius: '8px', transition: '0.25s' }}
        >
          <MdNotificationsNone size={24} color="#4A5568" />
          <Badge
            position="absolute"
            top="0"
            left="50%"
            borderRadius="full"
            backgroundColor="red.500"
            color="white"
            fontSize={'10px'}
            width={'20px'}
            minHeight={'18px'}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            99+
          </Badge>
        </Flex> */}

        <Box position="relative" ref={dropdownRef}>
          <Button
            onClick={toggleDropdown}
            variant="ghost"
            display="flex"
            alignItems="center"
            borderRadius={'lg'}
            gap={1}
            bg={isDropdownOpen ? '#00000014' : 'transparent'}
          >
            <Avatar size="xs" name={userInfo?.username} src={userInfo?.avatar} />
            <Text fontWeight="500" fontSize="14px" color="gray.700">
              {userInfo?.username}
            </Text>
          </Button>

          {isDropdownOpen && (
            <VStack
              position="absolute"
              top="100%"
              right="0"
              mt={2}
              paddingY={2}
              gap={0}
              bg="white"
              boxShadow="xs"
              borderRadius="md"
              zIndex={10}
              width="150px"
              minHeight="88px"
              alignItems="stretch"
              fontWeight="500"
              borderWidth={'1px'}
              borderColor={'gray.200'}
            >
              <Link href="/account-management" passHref>
                <HStack color="gray.700" fontSize={'sm'} height={9} paddingLeft={4.5} _hover={{ bg: '#00000014' }}>
                  <FaRegCircleUser size="17px" /> My account
                </HStack>
              </Link>
              <HStack
                as="button"
                onClick={() => {
                  setTimeout(async () => {
                    await signOutAction()
                  }, 1000)
                }}
                color="red.500"
                fontSize={'sm'}
                height={9}
                paddingLeft={4.5}
                cursor={'pointer'}
                _hover={{ bg: '#00000014' }}
              >
                <MdLogout size="17px" /> Log Out
              </HStack>
            </VStack>
          )}
        </Box>
      </HStack>
    </HStack>
  )
}
export default Header
