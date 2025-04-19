import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript';
import Credit from './credit';

@Table({
  timestamps: false,
  tableName: 'creditHistories',
})
class CreditHistory extends Model {
  @ForeignKey(() => Credit)
  @Column({ type: DataType.INTEGER, allowNull: false })
  credit_id!: number;

  @Column({ type: DataType.ENUM('Use', 'Buy', 'Bonus', 'Expired'), allowNull: false })
  type!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  amount!: number;

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

export default CreditHistory;
