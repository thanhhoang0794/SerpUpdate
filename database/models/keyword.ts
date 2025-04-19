import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, HasMany, Sequelize } from 'sequelize-typescript'
import Domain from './domain'
import KeywordRanking from './keywordRanking'
@Table({
  timestamps: false,
  tableName: 'keywords'
})
class Keyword extends Model {
  @ForeignKey(() => Domain)
  @Column({ type: DataType.INTEGER, allowNull: false })
  domain_id!: number

  @Column({ type: DataType.STRING, allowNull: false })
  keyword!: string

  @Column({ type: DataType.ENUM('desktop', 'mobile'), allowNull: true })
  device!: string

  @Column({ type: DataType.STRING, allowNull: true })
  country_code!: string

  @Column({ type: DataType.STRING, allowNull: true })
  language!: string

  @Default('google')
  @Column({ type: DataType.ENUM('google', 'yahoo', 'bing', 'baidu', 'seznam', 'naver'), allowNull: false })
  search_engine!: string

  @Column({ type: DataType.STRING, allowNull: true })
  added!: string

  @Column({ type: DataType.INTEGER, allowNull: true })
  position!: number

  @Column({ type: DataType.INTEGER, allowNull: true })
  volume!: number

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  sticky!: boolean

  @Column({ type: DataType.JSONB, allowNull: true })
  history!: object

  @Column({ type: DataType.JSONB, allowNull: true })
  last_result!: object

  @Column({ type: DataType.STRING, allowNull: true })
  url!: string

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: true })
  tags!: object

  @Default(false)
  @Column({ type: DataType.BOOLEAN, allowNull: true })
  updating!: boolean

  @Default({})
  @Column({ type: DataType.JSONB, allowNull: true })
  last_update_error!: object

  @Column({ type: DataType.DATE, allowNull: true })
  sc_data!: Date

  @Column({ type: DataType.STRING, allowNull: true })
  uid!: string

  @Column({ type: DataType.STRING, allowNull: true })
  city!: string

  @HasMany(() => KeywordRanking)
  keyword_rankings!: KeywordRanking[]

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
}

export default Keyword
