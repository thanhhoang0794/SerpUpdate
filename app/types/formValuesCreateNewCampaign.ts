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
  ownDomain: string
  competitorDomains: {
    id: number
    value: string
  }[]
  keywordText: string
  schedule: Schedule
  keywords: string[]
  isEditing: boolean
  device: 'mobile' | 'desktop' | 'both'
  selectedSearchEngine: SearchEngine
}
