import { HStack, VStack, Text } from '@chakra-ui/react'
import { Button } from '@/components/ui/button'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { FaArrowRight } from 'react-icons/fa'

export default function UpcomingFeaturePopup() {
  return (
    <HStack wrap="wrap" gap="4">
      <DialogRoot placement="center" motionPreset="slide-in-bottom">
        <DialogTrigger asChild>
          <Button
            variant={'outline'}
            size={'sm'}
            color={'primary.500'}
            marginTop={2}
            borderColor={'primary.500'}
            borderRadius={'lg'}
          >
            View more <FaArrowRight />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Keyword grouper</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack alignItems={'center'} gapY={3} width={'100%'}>
              <Text fontSize={'xl'} color={'gray.700'} fontWeight={'600'}>
                Coming Soon!
              </Text>
              <Text fontSize={'md'} color={'gray.700'} fontWeight={'400'}>
                We’re bringing something new just for you. Stay tuned!
              </Text>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Close</Button>
            </DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </HStack>
  )
}
