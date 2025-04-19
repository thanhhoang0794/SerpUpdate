import React, { useEffect, useState } from 'react'
import { NativeSelectField, NativeSelectRoot } from '@/components/ui/native-select'
import { Control, Controller, useWatch } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import {
  Language,
  languageGoogleList,
  languageBaiduList,
  languageSeznamList,
  languageBingList,
  languageYahooList
} from '@/app/constant/languageList'
import { SearchEngine } from '@/app/types/enumSearchEngine'

interface SelectLanguageProps {
  control: Control<FormValues>
}
const SelectLanguage: React.FC<SelectLanguageProps> = ({ control }) => {
  const searchEngine = useWatch<FormValues>({ control, name: 'selectedSearchEngine' })
  function getLanguageList() {
    switch (searchEngine) {
      case SearchEngine.GOOGLE:
        return languageGoogleList
      case SearchEngine.BAIDU:
        return languageBaiduList
      case SearchEngine.SEZNAM:
        return languageSeznamList
      case SearchEngine.BING:
        return languageBingList
      case SearchEngine.YAHOO:
        return languageYahooList
      case SearchEngine.NAVER:
        return languageGoogleList
      default:
        return []
    }
  }
  const languageList = getLanguageList()
  return (
    <Controller
      name="selectedLanguage"
      control={control}
      render={({ field }) => (
        <NativeSelectRoot>
          <NativeSelectField
            {...field}
            onChange={event => {
              field.onChange(event.target.value)
            }}
          >
            <option value="" disabled>
              Select Language
            </option>
            {languageList.map((item: Language, index) => (
              <option key={index} value={item.language_name}>
                {item.language_name}
              </option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>
      )}
    />
  )
}

export default SelectLanguage
