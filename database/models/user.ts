import { Table, Model, Column, DataType, PrimaryKey, Unique, Default, HasOne, HasMany, Sequelize } from 'sequelize-typescript'
import Credit from './credit'
import CampaignUser from './campaignUser'
import Transaction from './transaction'
import UserLoginHistory from './userLoginHistory'

@Table({
  timestamps: false,
  tableName: 'users'
})
class User extends Model {
  @PrimaryKey
  @Column({ type: DataType.STRING, allowNull: false, primaryKey: true })
  declare id: string

  @Unique('google_id_unique')
  @Column({ type: DataType.STRING, allowNull: true })
  google_id!: string

  @Unique('email_unique')
  @Column({ type: DataType.STRING, allowNull: false })
  email!: string

  @Column({ type: DataType.STRING, allowNull: true })
  image_url!: string

  @Column({ type: DataType.STRING, allowNull: true })
  username!: string

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_admin!: boolean

  @Column({ type: DataType.STRING, allowNull: true })
  affiliate_id!: string

  @Column({ type: DataType.STRING, allowNull: true })
  payment_method!: string

  @Column({ type: DataType.STRING, allowNull: true })
  bank_account_number!: string

  @Column({ type: DataType.STRING, allowNull: true })
  bank_code!: string

  @Column({ type: DataType.STRING, allowNull: true })
  bank_branch!: string

  @Column({ type: DataType.STRING, allowNull: true })
  bank_city_or_province!: string

  @Column({ type: DataType.STRING, allowNull: true })
  bank_name!: string

  @Default("no-plan")
  @Column({ type: DataType.ENUM('no-plan', 'free-plan', 'paid-plan'), allowNull: false })
  plan_type!: string

  @Column({ type: DataType.DATE, allowNull: true })
  plan_changed_at!: Date

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_active!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('now()')
  })
  created_at!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('now()')
  })
  updated_at!: Date;

  @HasOne(() => Credit)
  credit!: Credit

  @HasMany(() => CampaignUser)
  campaign_users!: CampaignUser[]

  @HasMany(() => Transaction)
  transactions!: Transaction[]

  @HasMany(() => UserLoginHistory)
  user_login_histories!: UserLoginHistory[]
}

export default User
