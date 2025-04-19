import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript';
import User from './user';

@Table({
  timestamps: false,
  tableName: 'transactions',
})
class Transaction extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  user_id!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  transaction_date!: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  onepay_transaction_id!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  payment_method!: string;

  @Default('Pending')
  @Column({ type: DataType.ENUM('Pending', 'Success', 'Failed'), allowNull: false })
  status!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  amount!: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  credit_amount!: number;

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

export default Transaction;
