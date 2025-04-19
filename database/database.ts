import { Sequelize, SequelizeOptions } from 'sequelize-typescript'
import Domain from './models/domain'
import Keyword from './models/keyword'
import Campaign from './models/campaign'
import CampaignSnapshot from './models/campaignSnapshot'
import CampaignUser from './models/campaignUser'
import Credit from './models/credit'
import KeywordRanking from './models/keywordRanking'
import Transaction from './models/transaction'
import User from './models/user'
import CreditHistory from './models/creditHistory'
import UserLoginHistory from './models/userLoginHistory'
import RegisterLog from './models/registerLog'
import Price from './models/price'
import pg from 'pg'
import 'dotenv/config'
import TaskTracking from './models/taskTracking'
import CampaignUpdatings from './models/campaignUpdating'
import ConfigCountWaitingForPingback from './models/configCountWaitingForPingback'

export const sequelizeOptions: SequelizeOptions = {
  dialect: 'postgres',
  dialectModule: pg,
  host: process.env.POSTGRES_POOLER_HOST,
  username: process.env.POSTGRES_POOLER_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
  ssl: true,
  database: process.env.POSTGRES_DATABASE,
  pool: {
    max: 5,
    min: 0,
    idle: 10000
  },
  logging: false,
  models: [
    Domain,
    Keyword,
    Campaign,
    CampaignSnapshot,
    CampaignUser,
    Credit,
    CreditHistory,
    KeywordRanking,
    Transaction,
    User,
    UserLoginHistory,
    RegisterLog,
    Price,
    TaskTracking,
    CampaignUpdatings,
    ConfigCountWaitingForPingback
  ]
}
const sequelize = new Sequelize(sequelizeOptions)

export default sequelize
