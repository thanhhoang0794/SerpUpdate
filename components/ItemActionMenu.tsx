import React, { useState } from 'react'
import { Button, IconButton } from '@chakra-ui/react'
import { IoTrash } from 'react-icons/io5'
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle
} from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from 'react-query'
interface ItemActionMenuProps {
  campaignId: number
}

const ItemActionMenu = ({ campaignId }: ItemActionMenuProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const origin = window.location.origin
  const deleteCampaignMutation = useMutation({
    mutationFn: (id: number) => {
      return fetch(`${origin}/api/campaigns/?id=${id}`, {
        method: 'DELETE'
      })
    },
    onSettled: async () => {
      return await queryClient.invalidateQueries(['campaigns'])
    }
  })

  async function handleDeleteCampaign(id: number) {
    setIsLoading(true)
    deleteCampaignMutation.mutate(id)
    setIsLoading(false)
    setIsOpen(false)
    toast.success('Campaign deleted successfully', {
      duration: 3000,
      position: 'top-right'
    })
  }
  return (
    <>
      <IconButton
        size={'md'}
        color="red"
        variant="ghost"
        _hover={{ backgroundColor: 'blackAlpha.200', borderRadius: '8px' }}
        onClick={() => setIsOpen(true)}
      >
        <IoTrash />
      </IconButton>
      <DialogRoot
        role="alertdialog"
        open={isOpen}
        onOpenChange={(e: { open: boolean | ((prevState: boolean) => boolean) }) => setIsOpen(e.open)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Campaign</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p>
              This action cannot be undone. This will permanently delete your campaign and remove your data from our
              systems.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button disabled={isLoading} variant="outline">
                Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              backgroundColor="red.500"
              disabled={isLoading}
              color="white"
              onClick={() => handleDeleteCampaign(campaignId)}
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
          <DialogCloseTrigger disabled={isLoading} />
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default ItemActionMenu
