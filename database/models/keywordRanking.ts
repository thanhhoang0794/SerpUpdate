import { Table, Model, Column, DataType, ForeignKey, Sequelize } from 'sequelize-typescript'
import Keyword from './keyword'
import Domain from './domain'
@Table({
  timestamps: false,
  tableName: 'keywordRankings'
})
class KeywordRanking extends Model {
  @ForeignKey(() => Keyword)
  @Column({ type: DataType.INTEGER, allowNull: false })
  keyword_id!: number

  @ForeignKey(() => Domain)
  @Column({ type: DataType.INTEGER, allowNull: false })
  domain_id!: number

  @Column({ type: DataType.TEXT, allowNull: false })
  keyword_data!: string

  @Column({ type: DataType.DATE, allowNull: false })
  crawl_date!: Date

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
}

export default KeywordRanking
