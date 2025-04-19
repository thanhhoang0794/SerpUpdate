import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript'
@Table({
  timestamps: false,
  tableName: 'registerLogs'
})
class RegisterLog extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  email!: string
  @Column({ type: DataType.STRING, allowNull: false })
  ip!: string
  @Column({ type: DataType.STRING, allowNull: true })
  hostname!: string
  @Column({ type: DataType.STRING, allowNull: false })
  city!: string
  @Column({ type: DataType.STRING, allowNull: false })
  region!: string
  @Column({ type: DataType.STRING, allowNull: false })
  country!: string
  @Column({ type: DataType.STRING, allowNull: false })
  timezone!: string
  @Column({ type: DataType.STRING, allowNull: false })
  loc!: string
  @Column({ type: DataType.STRING, allowNull: false })
  org!: string
  @Column({ type: DataType.STRING, allowNull: false })
  postal!: string
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

export default RegisterLog
