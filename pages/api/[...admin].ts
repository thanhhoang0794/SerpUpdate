import AdminJS, { AdminJSOptions } from 'adminjs'
import AdminJSExpress from '@adminjs/express'
// import importExportFeature from '@adminjs/import-export';
import SequelizeStore from 'connect-session-sequelize'
import express, { Request, Response } from 'express'
import * as AdminJSSequelize from '@adminjs/sequelize'
import session from 'express-session'
import sequelize from '@/database/database'
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
import UserLoginHistory from '@/database/models/userLoginHistory'
import { getBaseUrl } from '@/utils/url'
import RegisterLog from '@/database/models/registerLog'
import CampaignUpdatings from '@/database/models/campaignUpdating'
import AdminConfigCountWaitingForPingback from '@/database/models/configCountWaitingForPingback'

// Register Sequelize adapter
AdminJS.registerAdapter(AdminJSSequelize)

// Default admin credentials
const DEFAULT_ADMIN = {
  email: 'serp@udt.group',
  password: 'password'
}

// Authentication function
const authenticate = async (email: string, password: string) => {
  if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
    return Promise.resolve(DEFAULT_ADMIN)
  }
  return null
}

let cachedApp: any = null

async function createAdminApp() {
  if (cachedApp) {
    return cachedApp
  }

  const app = express()
  // const componentLoader = new ComponentLoader()

  // AdminJS options
  const adminOptions: AdminJSOptions = {
    // assetsCDN: process.env.NODE_ENV === "production" ? getBaseUrl() : undefined,
    rootPath: '/admin',
    branding: {
      companyName: 'Serp Update'
    },
    // componentLoader,
    resources: [
      { resource: Domain },
      { resource: Keyword },
      {
        resource: User,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'User'
          },
          actions: {
            deactivate: {
              actionType: 'record',
              icon: 'X',
              isVisible: (context: any) => context.record?.param('is_active'),
              handler: async (request: any, response: any, context: any) => {
                const { record } = context
                await record.update({ is_active: false })
                return {
                  record: record.toJSON(),
                  notice: {
                    message: 'Successfully deactivated user',
                    type: 'success'
                  }
                }
              },
              component: false,
              label: 'Deactivate'
            },
            activate: {
              actionType: 'record',
              icon: 'Check',
              isVisible: (context: any) => !context.record?.param('is_active'),
              handler: async (request: any, response: any, context: any) => {
                const { record } = context
                await record.update({ is_active: true })
                return {
                  record: record.toJSON(),
                  notice: {
                    message: 'Successfully activated user',
                    type: 'success'
                  }
                }
              },
              component: false,
              label: 'Activate'
            }
          },
          listProperties: [
            'email',
            'id',
            'updated_at',
            'created_at',
            'is_active',
            'plan_changed_at',
            'plan_type',
            'bank_name'
          ],
          filterProperties: [
            'email',
            'id',
            'updated_at',
            'created_at',
            'is_active',
            'plan_changed_at',
            'plan_type',
            'bank_name'
          ]
        }
      },
      { resource: Campaign },
      { resource: CampaignSnapshot },
      { resource: CampaignUser },
      { resource: Credit },
      { resource: CreditHistory },
      { resource: KeywordRanking },
      { resource: Transaction },
      {
        resource: RegisterLog,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'User'
          },
          listProperties: ['ip', 'loc', 'email', 'postal', 'org', 'timezone', 'created_at', 'updated_at'],
          filterProperties: ['ip', 'loc', 'email', 'postal', 'org', 'timezone', 'created_at', 'updated_at'],
          sort: {
            sortBy: 'created_at',
            direction: 'desc'
          }
        }
      },
      {
        resource: UserLoginHistory,
        options: {
          navigation: {
            name: 'User Management',
            icon: 'User'
          },
          actions: {
            edit: {
              isVisible: false
            },
            show: {
              isVisible: false
            },
            delete: {
              isVisible: false
            },
            new: {
              isVisible: false
            },
            bulkDelete: {
              isVisible: false
            }
          },
          listProperties: ['user', 'logged_in_at'],
          filterProperties: ['user', 'logged_in_at'],
          sort: {
            sortBy: 'logged_in_at',
            direction: 'desc'
          }
        }
      },
      {
        resource: CampaignUpdatings,
        options: {
          navigation: {
            name: 'Task Traces'
          },
          listProperties: ['campaign_id', 'search_engine', 'status', 'created_at', 'updated_at'],
          filterProperties: ['campaign_id', 'search_engine', 'status', 'created_at', 'updated_at'],
          sort: {
            sortBy: 'created_at',
            direction: 'desc'
          }
        }
      },
      {
        resource: AdminConfigCountWaitingForPingback,
        options: {
          navigation: {
            name: 'Admin Config',
            icon: 'Settings'
          },
          listProperties: ['count', 'created_at', 'updated_at'],
          filterProperties: ['count', 'created_at', 'updated_at'],
          sort: {
            sortBy: 'created_at',
            direction: 'desc'
          }
        }
      }
    ]
  }

  const adminJs = new AdminJS(adminOptions)

  const SequelizeSessionStore = SequelizeStore(session.Store)
  const sessionStore = new SequelizeSessionStore({
    db: sequelize,
    tableName: 'Sessions',
    checkExpirationInterval: 15 * 60 * 1000,
    expiration: 24 * 60 * 60 * 1000
  })

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    adminJs,
    {
      authenticate,
      cookieName: 'adminjs',
      cookiePassword: 'sessionsecret'
    },
    null,
    {
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      secret: 'sessionsecret',
      cookie: {
        httpOnly: false,
        secure: false
      },
      name: 'adminjs'
    }
  )

  app.use(adminJs.options.rootPath, adminRouter)

  await sequelize.authenticate()
  await sequelize.sync({ alter: true })

  cachedApp = app
  return app
}

export default async function handler(req: Request, res: Response) {
  const app = await createAdminApp()
  app(req, res)
}

export const config = {
  api: {
    responseLimit: false,
    bodyParser: false,
    externalResolver: true
  }
}
