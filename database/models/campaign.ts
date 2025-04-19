import { Table, Model, Column, DataType, PrimaryKey, HasMany, Default, Sequelize } from 'sequelize-typescript'
import Domain from './domain'
import CampaignSnapshot from './campaignSnapshot'
import CampaignUser from './campaignUser'

@Table({
  timestamps: false,
  tableName: 'campaigns'
})
class Campaign extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string

  @Column({ type: DataType.INTEGER, allowNull: true })
  keyword_count!: number

  @Column({ type: DataType.ENUM('desktop', 'mobile', 'both'), allowNull: false })
  devices!: string

  @Column({ type: DataType.STRING, allowNull: false })
  country_code!: string

  @Column({ type: DataType.STRING, allowNull: false })
  language!: string

  @Default('google')
  @Column({ type: DataType.ENUM('google', 'yahoo', 'bing', 'baidu', 'seznam', 'naver'), allowNull: false })
  search_engine!: string

  @Column({ type: DataType.STRING, allowNull: true })
  tags!: string

  @Column({ type: DataType.STRING, allowNull: true })
  notification!: string

  @Column({ type: DataType.STRING, allowNull: true })
  notification_interval!: string

  @Column({ type: DataType.STRING, allowNull: true })
  notification_email!: string

  @Column({ type: DataType.STRING, allowNull: true })
  search_console!: string

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  updating!: boolean

  @Column({ type: DataType.DATE, allowNull: true })
  sc_data!: Date

  @Column({ type: DataType.STRING, allowNull: true })
  uid!: string

  @Column({ type: DataType.STRING, allowNull: true })
  city!: string

  @Column({ type: DataType.TEXT, allowNull: true })
  note!: string

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: true })
  day_of_week!: string[]

  @Column({ type: DataType.TIME, allowNull: true })
  time_of_day!: Date

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_active!: boolean

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('now()')
  })
  created_at!: Date

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('now()')
  })
  updated_at!: Date

  // Relationships
  @HasMany(() => Domain)
  domains!: Domain[]

  @HasMany(() => CampaignSnapshot)
  snapshots!: CampaignSnapshot[]

  @HasMany(() => CampaignUser)
  campaign_users!: CampaignUser[]
}

export default Campaign
