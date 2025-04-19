import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, HasMany, Sequelize } from 'sequelize-typescript';
import User from './user';
import CreditHistory from './creditHistory';

@Table({
  timestamps: false,
  tableName: 'credits',
})
class Credit extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  user_id!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  total_credits!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  bonus_credits!: number;

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

  @HasMany(() => CreditHistory)
  credit_histories!: CreditHistory[]
}

export default Credit;
