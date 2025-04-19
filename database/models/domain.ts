import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, HasMany, Unique, Default, Sequelize } from 'sequelize-typescript'
import Campaign from './campaign'
import Keyword from './keyword'
import KeywordRanking from './keywordRanking'
@Table({
  timestamps: false,
  tableName: 'domains'
})
class Domain extends Model {
  @ForeignKey(() => Campaign)
  @Column({ type: DataType.INTEGER, allowNull: false })
  campaign_id!: number

  @Column({ type: DataType.STRING, allowNull: false })
  domain!: string

  @Column({ type: DataType.STRING, allowNull: false })
  slug!: string

  @Column({ type: DataType.ENUM('competitor', 'own'), allowNull: false })
  domain_type!: string

  @Default(true)
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_active!: boolean;

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

  // Relationships
  @HasMany(() => Keyword)
  keywords!: Keyword[]
  @HasMany(() => KeywordRanking)
  keyword_rankings!: KeywordRanking[]
}

export default Domain
