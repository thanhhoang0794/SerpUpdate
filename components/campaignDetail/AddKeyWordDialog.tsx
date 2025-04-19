'use client'

import { HStack, Text } from '@chakra-ui/react'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { read, utils } from 'xlsx'
import SelectKeywords from '../createNewCampaign/SelectKeywords'
import toast from 'react-hot-toast'
import { useForm, useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import { MdAdd } from 'react-icons/md'
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

export const AddKeyWordDialog = () => {
  const [open, setOpen] = useState(false)
  const { id } = useParams() as { id: string }
  const { control, handleSubmit, setValue } = useForm<FormValues>({
    defaultValues: {
      keywordText: '',
      keywords: []
    }
  })

  const keywordText = useWatch<FormValues, 'keywordText'>({
    control,
    name: 'keywordText'
  })

  const queryClient = useQueryClient()
  const addKeywordsMutation = useMutation({
    mutationFn: async (keywords: string[]) => {
      const response = await fetch(`${origin}/api/addKeyword/?id=${id}`, {
        method: 'POST',
        body: JSON.stringify(keywords),
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add keywords')
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['campaignDetail', id])
    }
  })

  function onSubmit(data: FormValues) {
    const keywords = [...new Set(data.keywordText.split('\n').map(keyword => keyword.trim()))]
    setValue('keywords', keywords)
    toast.promise(
      addKeywordsMutation.mutateAsync(keywords),
      {
        loading: 'Adding keywords...',
        success: 'Keywords added successfully',
        error: err => err.message || "Can't add keywords"
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
    setValue('keywordText', '')
    onClose()
  }

  function onClose() {
    setOpen(prev => !prev)
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const fileType = file.name.split('.').pop()?.toLowerCase()
      if (fileType === 'txt') {
        const text = await file.text()
        const cleanedText = text
          .split('\n')
          .map(line => line.trim())
          .filter(line => line !== '')
          .join('\n')
        const uniqueKeywords = [...new Set(cleanedText.split('\n'))]
        setValue('keywordText', uniqueKeywords.join('\n'))
        toast.success(
          <div>
            <strong>Import keywords successfully</strong>
            <br />
            Keyword list has been updated
          </div>,
          {
            duration: 3000,
            position: 'top-right',
            style: {
              backgroundColor: '#C6F6D5',
              color: '#256053'
            }
          }
        )
      } else if (fileType === 'xlsx' || fileType === 'xls') {
        const data = await file.arrayBuffer()
        const workbook = read(data)
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows = utils.sheet_to_json<string[]>(firstSheet, { header: 1 })
        const uniqueKeywords = [...new Set(rows.map(row => row[0]))]
        const text = uniqueKeywords
          .map(keyword => keyword)
          .filter(keyword => keyword)
          .join('\n')

        setValue('keywordText', text)
        toast.success(
          <div>
            <strong>Import keywords successfully</strong>
            <br />
            Keyword list has been updated
          </div>,
          {
            duration: 3000,
            position: 'top-right',
            style: {
              backgroundColor: '#C6F6D5',
              color: '#256053'
            }
          }
        )
      }
      e.target.value = ''
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const isAddButtonDisabled = !(String(keywordText).trim().length > 0)

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
            <MdAdd /> Add keywords
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader backgroundColor={'primary.50'} paddingX={4} paddingY={2}>
            <DialogTitle>
              <Text color={'gray.900'} fontWeight={'semibold'} fontSize={'lg'}>
                Add Keywords
              </Text>
            </DialogTitle>
          </DialogHeader>
          <DialogBody margin={0} padding={0}>
            <SelectKeywords control={control} handleFileUpload={handleFileUpload} />
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              disabled={isAddButtonDisabled}
              onClick={handleSubmit(onSubmit)}
              backgroundColor={'primary.500'}
              color={'white'}
            >
              Add
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRoot>
    </HStack>
  )
}
