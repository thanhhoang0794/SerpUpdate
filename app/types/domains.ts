import { DomainType } from './domainType'
import { Keyword } from './keywords'

export interface Domain {
  id: string
  keywords: Keyword[]
  domain: string
  domain_type: DomainType
  created_at: string
  updated_at: string
}
