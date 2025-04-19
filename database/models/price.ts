import { Table, Model, Column, DataType, ForeignKey, Sequelize } from 'sequelize-typescript'

@Table({
  timestamps: false,
  tableName: 'prices'
})
class Price extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  price_usd!: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  total_credits!: number

  @Column({ type: DataType.INTEGER, allowNull: false })
  percent_bonus!: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  total_credits_bonus!: number

  @Column({ type: DataType.BIGINT, allowNull: false })
  total_credits_with_bonus!: number

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

export default Price
