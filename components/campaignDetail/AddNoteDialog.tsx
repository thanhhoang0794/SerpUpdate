'use client'

import { HStack, Text, Textarea } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Control, Controller, UseFormSetValue, useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCampaign'
import { MdAdd } from 'react-icons/md'
import { FaEye } from 'react-icons/fa'
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
import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'next/navigation'
import { toast } from 'react-hot-toast'

export const AddNoteDialog = ({
  control,
  setValue
}: {
  control: Control<FormValues>
  setValue: UseFormSetValue<FormValues>
}) => {
  const [open, setOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const { id } = useParams() as { id: string }
  const campaignNote = useWatch<FormValues, 'campaignNote'>({
    control,
    name: 'campaignNote'
  })
  const [tempCampaignNote, setTempCampaignNote] = useState('')
  const queryClient = useQueryClient()
  const editCampaignNoteMutation = useMutation({
    mutationFn: async (note: string) => {
      const response = await fetch(`${origin}/api/edit-note/?id=${id}`, {
        method: 'PATCH',
        body: JSON.stringify(note),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to edit note')
      }
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignDetail', id])
    }
  })

  function onClose() {
    setOpen(prev => !prev)
    if (isEditing) {
      handleCancelEdit()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setValue('campaignNote', value)
    console.log('Textarea value:', value) // Debug log
  }
  function handleCancelEdit() {
    setValue('campaignNote', tempCampaignNote)
    setIsEditing(false)
  }
  const isSaveButtonDisabled = isEditing && !(String(tempCampaignNote).trim() === String(campaignNote).trim())
  function onEditNote() {
    if (isEditing) {
      toast.promise(
        editCampaignNoteMutation.mutateAsync(campaignNote),
        {
          loading: 'Updating campaign...',
          success: 'Successfully saved',
          error: err => `This just happened: ${err.toString()}`
        },
        {
          duration: 5000,
          position: 'top-right',
          success: {
            style: {
              borderLeft: '5px solid #38A169',
              padding: '12px 16px',
              color: '#2D3748',
              fontWeight: '700',
              fontSize: '16px',
              backgroundColor: '#C6F6D5',
              borderRadius: '0'
            }
          }
        }
      )
      onClose()
      setIsEditing(false)
    } else {
      setIsEditing(true)
      setTempCampaignNote(campaignNote)
    }
  }

  return (
    <HStack>
      <DialogRoot open={open} onOpenChange={onClose} key={'lg'} size={'lg'} placement={'top'}>
        <DialogTrigger asChild>
          <Button
            backgroundColor={'white'}
            borderRadius={'md'}
            size={'sm'}
            gap={2}
            paddingX={3}
            variant={'outline'}
            fontSize={'sm'}
            color={'primary.500'}
            fontWeight={'semibold'}
          >
            {campaignNote ? <FaEye /> : <MdAdd />}
            {campaignNote ? 'View note' : 'Add note'}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
            <DialogTitle>
              <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'lg'}>
                View Note
              </Text>
            </DialogTitle>
          </DialogHeader>
          <DialogBody margin={0} padding={2}>
            <Controller
              control={control}
              name={'campaignNote'}
              render={({ field }) => (
                <Textarea
                  {...field}
                  disabled={!isEditing}
                  value={field.value}
                  onChange={event => {
                    field.onChange(event)
                    handleTextareaChange(event)
                  }}
                  placeholder="Add note"
                  backgroundColor={'white'}
                  borderRadius={'md'}
                  size={'sm'}
                />
              )}
            />
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger>
              {isEditing && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </DialogActionTrigger>
            {isEditing ? (
              <Button onClick={onEditNote} backgroundColor={'primary.500'} color={'white'}>
                Save
              </Button>
            ) : (
              <Button
                disabled={isSaveButtonDisabled}
                backgroundColor={'primary.500'}
                variant="outline"
                color={'white'}
                onClick={onEditNote}
              >
                Edit
              </Button>
            )}
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </HStack>
  )
}
