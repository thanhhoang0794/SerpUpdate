import { NativeSelectField, NativeSelectRoot } from '@/components/ui/native-select'
import { Control, Controller, useWatch } from 'react-hook-form'
import { FormValues as CampaignDetailFormValues } from '@/app/types/formValuesCampaign'
import {
  locationBaiduList,
  locationBingList,
  locationGoogleList,
  locationSeznamList,
  locationYahooList,
  Location
} from '@/app/constant/countryList'
import { SearchEngine } from '@/app/types/enumSearchEngine'
interface SelectLocationProps {
  control: Control<CampaignDetailFormValues>
}

const SelectLocation: React.FC<SelectLocationProps> = ({ control }) => {
  const searchEngine = useWatch<CampaignDetailFormValues>({ control, name: 'selectedSearchEngine' })
  function getLocationList() {
    switch (searchEngine) {
      case SearchEngine.GOOGLE:
        return locationGoogleList
      case SearchEngine.BAIDU:
        return locationBaiduList
      case SearchEngine.SEZNAM:
        return locationSeznamList
      case SearchEngine.BING:
        return locationBingList
      case SearchEngine.YAHOO:
        return locationYahooList
      case SearchEngine.NAVER:
        return locationGoogleList
      default:
        return []
    }
  }
  const locationList = getLocationList()

  return (
    <Controller
      control={control}
      name="selectedLocation"
      render={({ field }) => (
        <NativeSelectRoot>
          <NativeSelectField
            {...field}
            onChange={event => {
              field.onChange(event)
            }}
          >
            <option value="" disabled>
              Select location
            </option>
            {locationList.map((item: Location, index) => (
              <option key={index} value={item.country_iso_code}>
                {item.location_name}
              </option>
            ))}
          </NativeSelectField>
        </NativeSelectRoot>
      )}
    />
  )
}

export default SelectLocation
