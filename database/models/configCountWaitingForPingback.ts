import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript';

@Table({
  timestamps: false,
  tableName: 'configCountWaitingForPingback'
})
class ConfigCountWaitingForPingback extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  count!: number

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

export default ConfigCountWaitingForPingback