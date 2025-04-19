
import Domain from '@/database/models/domain'
import Keyword from '@/database/models/keyword'
import User from '@/database/models/user'
import Campaign from '@/database/models/campaign'
import CampaignSnapshot from '@/database/models/campaignSnapshot'
import CampaignUser from '@/database/models/campaignUser'
import Credit from '@/database/models/credit'
import KeywordRanking from '@/database/models/keywordRanking'
import Transaction from '@/database/models/transaction'
import CreditHistory from '@/database/models/creditHistory'
import AdminJS, { AdminJSOptions } from 'adminjs'
import { getBaseUrl } from '@/utils/url'

// AdminJS options
const adminOptions: AdminJSOptions = {
  // assetsCDN: process.env.NODE_ENV === "production" ? getBaseUrl() : undefined,
  rootPath: '/admin',
  branding: {
    companyName: 'Serp Update'
  },
  resources: [
    { resource: Domain },
    { resource: Keyword },
    { resource: User },
    { resource: Campaign },
    { resource: CampaignSnapshot },
    { resource: CampaignUser },
    { resource: Credit },
    { resource: CreditHistory },
    { resource: KeywordRanking },
    { resource: Transaction }
  ]
}

export const adminJs = new AdminJS(adminOptions)