import { SearchEngine } from "./enumSearchEngine"
import { CampaignUpdatingStatus } from "./enumCampaignUpdatingStatus"

export interface CampaignUpdating {
  id?: number
  campaign_id: number
  status: CampaignUpdatingStatus
  search_engine: SearchEngine
  total_task?: number
  created_at?: Date
  updated_at?: Date
}
