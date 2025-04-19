'use client'
import { Button } from '@/components/ui/button'
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot
} from '@/components/ui/dialog'
import Fireworks from '@/public/Fireworks.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { routes } from '@/utils/constant'
import { VStack, Text, Icon } from '@chakra-ui/react'
import { FaArrowRight } from 'react-icons/fa'
import { useState } from 'react'

export const PopUpCongratulation = () => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(true)

  const handleClose = () => {
    setIsOpen(false)
    router.replace(routes.DASHBOARD)
  }

  return (
    <DialogRoot open={isOpen} placement="center" motionPreset="slide-in-bottom" role="alertdialog">
      <DialogContent>
        <DialogHeader></DialogHeader>
        <DialogBody>
          <VStack alignItems={'center'} gapY={3} width={'100%'}>
            <Image src={Fireworks} alt="Fireworks" width={110} />
            <Text fontSize={'xl'} color={'gray.700'} fontWeight={'600'}>
              Unlocked Free Plan!
            </Text>
            <VStack gap={0}>
              <Text color={'gray.700'} fontSize={'md'} textAlign={'center'}>
                Congrats, you've got{' '}
                <Text fontWeight={'700'} as={'span'}>
                  100 Credit
                </Text>{' '}
                to get started.
              </Text>
              <Text color={'gray.700'} fontSize={'md'} textAlign={'center'}>
                Dive in and explore{' '}
                <Text fontWeight={'700'} as={'span'}>
                  SERPUPDATE
                </Text>{' '}
                now!
              </Text>
            </VStack>
          </VStack>
        </DialogBody>
        <DialogFooter justifyContent={'center'}>
          <Button
            variant="solid"
            backgroundColor="primary.500"
            color="white"
            size="lg"
            borderRadius="md"
            onClick={() => router.push(routes.CAMPAIGN)}
          >
            Go to SERP campaigns{' '}
            <Icon>
              <FaArrowRight />
            </Icon>
          </Button>
        </DialogFooter>
        <DialogCloseTrigger onClick={handleClose} />
      </DialogContent>
    </DialogRoot>
  )
}
