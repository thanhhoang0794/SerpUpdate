import { Control, Controller } from 'react-hook-form'
import { FormValues } from '@/app/types/formValuesCreateNewCampaign'
import { NativeSelectField, NativeSelectRoot } from '@/components/ui/native-select'
import { SearchEngine } from '@/app/types/enumSearchEngine'

interface SelectSearchEngineProps {
  control: Control<FormValues>
}
const SelectSearchEngine: React.FC<SelectSearchEngineProps> = ({ control }) => {
  return (
    <Controller
      control={control}
      name="selectedSearchEngine"
      render={({ field }) => (
        <NativeSelectRoot>
          <NativeSelectField
            {...field}
            onChange={event => {
              field.onChange(event)
            }}
          >
            <option value="" disabled>
              Select search engine
            </option>
            <option value={SearchEngine.GOOGLE}>Google</option>
            <option value={SearchEngine.YAHOO}>Yahoo</option>
            <option value={SearchEngine.BING}>Bing</option>
            <option value={SearchEngine.BAIDU}>Baidu</option>
            <option value={SearchEngine.NAVER}>Naver</option>
            <option value={SearchEngine.SEZNAM}>Seznam</option>
          </NativeSelectField>
        </NativeSelectRoot>
      )}
    />
  )
}

export default SelectSearchEngine
