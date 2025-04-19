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
import { Box, Button, Flex, HStack, Separator, Text, VStack } from '@chakra-ui/react'
import { Avatar } from '@/components/ui/avatar'
import { Tag } from '@/components/ui/tag'
import { FaShareAlt } from 'react-icons/fa'
import TextField from '../TextField'
import { useForm } from 'react-hook-form'
import { emailRegularExpression } from '@/utils/utils'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQuery } from 'react-query'

const schema = yup.object({
  email: yup
    .string()
    .required('Email is not empty')
    .matches(emailRegularExpression, 'Please enter a valid email address in format: name@example.com')
})

interface Props {
  id: string
}

async function fetchSharedCampaigns(id: string) {
  const origin = window?.location?.origin
  const response = await fetch(`${origin}/api/campaignDetail?id=${id}&action=sharedUsers`)
  return response.json()
}

export const ShareCampaignDialog = ({ id }: Props) => {
  const [emails, setEmails] = useState<string[]>([])
  const [sharedUsers, setSharedUsers] = useState<any[]>([])

  const {
    data: sharedData,
    isLoading: isSharedLoading,
    refetch
  } = useQuery(['sharedCampaigns', id], () => fetchSharedCampaigns(id), {})

  useEffect(() => {
    if (sharedData) {
      if (Array.isArray(sharedData)) {
        setSharedUsers(
          sharedData.map(item => {
            return {
              user_access: item.user_access,
              can_edit: item.can_edit,
              is_creator: item.is_creator
            }
          })
        )
      } else {
        console.error('Unexpected data format:', sharedData)
      }
    }
  }, [sharedData])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
    trigger,
    setError
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit'
  })

  async function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault()
      const inputElement = event.currentTarget as HTMLInputElement
      const emailValue = inputElement.value.trim()

      if (await trigger('email')) {
        const response = await fetch(`/api/campaignDetail`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action: 'checkEmail', email: emailValue })
        })

        if (response.ok) {
          const result = await response.json()
          if (emailValue && !emails.includes(emailValue)) {
            setEmails(prevEmails => [...prevEmails, emailValue])
            setValue('email', '')
          }
        } else {
          const result = await response.json().catch(err => {
            console.error('Failed to parse JSON:', err)
            return { error: 'Unknown error' }
          })
          console.error('Error response:', result)
          setError('email', { type: 'manual', message: result.error || 'Unknown error' })
        }
      }
    }
  }

  function onSubmit(data: { email: string }) {
    const emailValue = data.email
    if (emailValue && !emails.includes(emailValue)) {
      setEmails([...emails, emailValue])
      console.log('Added email:', emailValue)
      setValue('email', '')
    }
  }

  async function handleShare() {
    try {
      const response = await fetch(`/api/campaignDetail?id=${id}&action=sharedUsers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails, campaign_id: id })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Campaign shared successfully!', {
          duration: 3000,
          position: 'top-right',
          style: {
            borderLeft: '5px solid #38A169',
            padding: '12px 16px',
            color: '#2D3748',
            fontWeight: '700',
            fontSize: '16px',
            marginTop: '40px',
            backgroundColor: '#C6F6D5',
            borderRadius: '0'
          },
          iconTheme: {
            primary: '#38A169',
            secondary: 'white'
          }
        })
        setEmails([])
        refetch()
      } else {
        toast.error(`Error: ${result.error || 'Failed to share campaign'}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to share campaign'}`)
    }
  }

  async function handleRemoveUser(index: number) {
    const userToRemove = sharedUsers[index]
    try {
      const response = await fetch(`/api/campaignDetail?id=${id}&action=sharedUsers`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: userToRemove.user_access.email, campaign_id: id })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(`User ${userToRemove.user_access.email} removed successfully!`)
        setSharedUsers(prevUsers => prevUsers.filter((_, i) => i !== index))
      } else {
        toast.error(`Error: ${result.error || 'Failed to remove user'}`)
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message || 'Failed to remove user'}`)
    }
  }

  return (
    <DialogRoot key="center" placement="center" motionPreset="slide-in-bottom" size="lg">
      <DialogTrigger asChild>
        <Button
          alignSelf={'flex-end'}
          borderRadius={'md'}
          size={'sm'}
          gap={2}
          paddingX={3}
          backgroundColor="primary.500"
          _hover={{ backgroundColor: 'primary.600' }}
          color="white"
          marginRight={3}
        >
          Share <FaShareAlt />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this campaign</DialogTitle>
          <Separator marginTop={2} />
        </DialogHeader>
        <DialogBody paddingTop={0}>
          <HStack justifyContent="space-between" marginBottom={2}>
            <Text fontWeight="500" fontSize="md">
              Shared via email
            </Text>
            <Text fontSize="md" fontWeight="400" color="primary.500">
              Press Enter to add email to the list
            </Text>
          </HStack>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box>
              <TextField
                placeholder="Enter email address"
                {...register('email')}
                marginTop={2}
                control={control}
                errors={errors.email}
                handleKeyDown={handleKeyDown}
              />
            </Box>
          </form>

          <HStack marginTop={2} gap={2} flexWrap="wrap" maxHeight="100px" overflowY="auto">
            {emails.map((email, index) => (
              <Tag
                key={index}
                closable
                padding="0 8px"
                borderRadius="6px"
                border="1px solid"
                fontWeight="500"
                borderColor="gray.500"
                color="gray.600"
                lineHeight="20px"
              >
                {email}
              </Tag>
            ))}
          </HStack>

          <Flex flexDirection="column" gap={2} marginTop={5}>
            <Text fontWeight="500" fontSize="sm" color="gray.500">
              Who has access
            </Text>
            <Box maxHeight="250px" overflowY="auto">
              <VStack>
                {sharedUsers
                  .sort((a, b) => (b?.can_edit || b?.is_creator ? 1 : 0) - (a?.can_edit || a?.is_creator ? 1 : 0))
                  .map((user: any, index: number) => (
                    <Box display="flex" alignItems="center" justifyContent="space-between" width="full" key={index}>
                      <HStack>
                        <Avatar
                          boxSize={6}
                          src={
                            user.user_access.image_url ||
                            'https://i.pinimg.com/736x/11/78/2a/11782ac8904252d7b06059a8babe3544.jpg'
                          }
                        />
                        <Text fontSize="md" fontWeight="500">
                          {user.user_access.email}
                          {user.can_edit || user.is_creator ? ' (owner)' : ''}
                        </Text>
                      </HStack>
                      {!(user.can_edit || user.is_creator) && (
                        <Button
                          border="none"
                          backgroundColor="transparent"
                          outline="none"
                          size="sm"
                          color="gray.600"
                          _hover={{ color: 'primary.500' }}
                          onClick={() => handleRemoveUser(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </Box>
                  ))}
              </VStack>
            </Box>
          </Flex>
          <Separator marginTop={6} />
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button onClick={handleShare} backgroundColor="primary.500" color="white" disabled={emails.length === 0}>
            Share
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  )
}
