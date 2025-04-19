import { VStack, Text, Spinner, Button } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'

export default function PaymentProcessing() {
  const router = useRouter()

  return (
    <VStack gap={6} alignItems="center" justifyContent="center" height="100%">
      <Spinner size="xl" color="primary.500" />
      <Text fontSize="lg" fontWeight="600" color="gray.700">
        Payment processing...
      </Text>
      <Text fontSize="sm" color="gray.500">
        Please complete your payment in the new window
      </Text>
      <Button
        fontSize={'sm'}
        fontWeight={'600'}
        borderRadius={'md'}
        borderColor={'primary.500'}
        variant={'outline'}
        color={'primary.500'}
        onClick={() => router.push('/credit')}
      >
        Return to Credit Page
      </Button>
    </VStack>
  )
}
