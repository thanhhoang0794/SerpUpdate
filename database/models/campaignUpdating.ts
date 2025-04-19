import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript'
@Table({
  timestamps: false,
  tableName: 'campaignUpdatings'
})
class CampaignUpdatings extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  campaign_id!: number

  @Column({ type: DataType.ENUM('google', 'yahoo', 'bing', 'baidu', 'seznam', 'naver'), allowNull: false })
  search_engine!: string

  @Column({ type: DataType.ENUM('waiting', 'completed', 'error', 'updating'), allowNull: false })
  status!: string

  @Column({ type: DataType.INTEGER, allowNull: true })
  total_task!: number

  @Default(0)
  @Column({ type: DataType.INTEGER, allowNull: false })
  count_waiting!: number

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
}

export default CampaignUpdatings
