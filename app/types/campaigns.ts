import { deviceType } from './deviceType'
import { Domain } from './domains'
export interface Campaign {
  id: number
  keyword_count: number
  name: string
  shared_By: string
  domains: Domain[]
  devices: deviceType
  country_code: string
  language: string
  day_of_week: string[]
  status: string
  created_at: string
  updated_at: string
  keywordName: string
  domainName: string
  url: string
  position: number
  lastPosition: number
  keywordHistory: KeywordHistory[]
  updating: boolean
  search_engine: string
}

export interface SharedCampaign {
  id: number
  name: string
  keyword_count: number
  shared_By: string
  devices: deviceType
  country_code: string
  language: string
  top_one_count: number
  top_five_count: number
  top_ten_count: number
  top_hundred_count: number
  updating: boolean
  search_engine: string
}
export interface CampaignItemType extends Campaign {
  id: number
  name: string
  keyword_count: number
  shared_by: string
  devices: deviceType
  country_code: string
  language: string
  top_one_count: number
  top_five_count: number
  top_ten_count: number
  top_hundred_count: number
  status: string
  created_at: string
  updated_at: string
}
