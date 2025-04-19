import { Schedule } from './schedule'
import { Domain } from './domains'
import { SearchEngine } from './enumSearchEngine'
export interface FormValues {
  id: number
  campaignName: string
  isScheduleActive: boolean
  isMobile: boolean
  isDesktop: boolean
  selectedLanguage: string
  selectedLocation: string
  ownDomain: Domain,
  competitorDomains: Domain[]
  keywordText: string
  schedule: Schedule
  domains: Domain[]
  keywords: string[]
  isEditing: boolean
  device: 'mobile' | 'desktop' | 'both'
  selectedDomain: Domain
  isOwnerCampaign: boolean
  ownDomainName: string
  competitorDomainsName: {
    id: number
    domain: string
  }[]
  updating: boolean
  selectedSearchEngine: SearchEngine
  campaignNote: string
}
