'use client'
import { HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import toast from 'react-hot-toast'
import { Control, useWatch } from 'react-hook-form'
import { MdRemove } from 'react-icons/md'
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
import { FormValues } from '@/app/types/formValuesCampaign'
import { CheckboxGroup, Fieldset } from '@chakra-ui/react'
import { Checkbox } from '@/components/ui/checkbox'
import { Keyword } from '@/app/types/keywords'
interface RemoveKeyWordDialogProps {
  control: Control<FormValues>
}

export const RemoveKeyWordDialog = ({ control }: RemoveKeyWordDialogProps) => {
  const [open, setOpen] = useState(false)
  const { id } = useParams() as { id: string }
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])
  const ownDomain = useWatch<FormValues, 'ownDomain'>({
    control,
    name: 'ownDomain'
  })
  const queryClient = useQueryClient()
  const removeKeywordsMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      const response = await fetch(`${origin}/api/removeKeyword/?id=${id}`, {
        method: 'DELETE',
        body: JSON.stringify(keywords),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to remove keywords')
      }
      return
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignDetail', id])
    }
  })

  function onClose() {
    setOpen(previous => !previous)
  }

  function handleCheckboxChange(keyword: string) {
    setSelectedKeywords(previous => {
      if (previous.includes(keyword)) {
        return previous.filter(k => k !== keyword)
      }
      return [...previous, keyword]
    })
  }

  function getUniqueKeywords(keywords: Keyword[]) {
    const uniqueKeywords = new Map()
    keywords?.forEach((item: Keyword) => {
      if (!uniqueKeywords.has(item.keyword)) {
        uniqueKeywords.set(item.keyword, item)
      }
    })
    return Array.from(uniqueKeywords.values())
  }

  function handleRemove() {
    toast.promise(
      removeKeywordsMutation.mutateAsync(selectedKeywords),
      {
        loading: 'Removing keywords...',
        success: 'Keywords removed successfully',
        error: err => err.message || "Can't remove keywords"
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
        },
        error: {
          style: {
            borderLeft: '5px solid #E53E3E',
            padding: '12px 16px',
            color: '#2D3748',
            fontWeight: '700',
            fontSize: '16px',
            backgroundColor: '#FED7D7',
            borderRadius: '0'
          }
        }
      }
    )
    onClose()
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
            variant={'solid'}
            fontSize={'sm'}
            color="gray.800"
            fontWeight={'semibold'}
          >
            <MdRemove /> Remove keywords
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
            <DialogTitle>
              <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'lg'}>
                Remove Keywords
              </Text>
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Fieldset.Root>
              <Fieldset.Legend>Select keywords to remove:</Fieldset.Legend>
              <CheckboxGroup>
                {getUniqueKeywords(ownDomain?.keywords).map((item: Keyword) => (
                  <HStack key={item.id} mb={2}>
                    <Checkbox
                      checked={selectedKeywords.includes(item.keyword)}
                      onCheckedChange={() => handleCheckboxChange(item.keyword)}
                    >
                      {item.keyword}
                    </Checkbox>
                  </HStack>
                ))}
              </CheckboxGroup>
            </Fieldset.Root>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              disabled={selectedKeywords.length === 0}
              onClick={handleRemove}
              backgroundColor={'primary.500'}
              color={'white'}
            >
              Remove
            </Button>
          </DialogFooter>

          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </HStack>
  )
}
