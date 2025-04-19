import { Table, Model, Column, DataType, Default, ForeignKey, Sequelize } from 'sequelize-typescript'
import User from './user'

@Table({
  timestamps: false,
  tableName: 'userLoginHistories'
})
class UserLoginHistory extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  user_id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  user!: string;

  @Default(DataType.NOW)
  @Column({ type: DataType.DATE, allowNull: false })
  logged_in_at!: Date;

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

export default UserLoginHistory
