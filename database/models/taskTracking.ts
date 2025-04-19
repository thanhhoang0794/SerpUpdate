import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript'
@Table({
  timestamps: false,
  tableName: 'taskTrackings'
})
class TaskTracking extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  task_id!: string

  @Column({ type: DataType.STRING, allowNull: false })
  campaign_id!: string

  @Column({ type: DataType.ENUM('waiting', 'received','processing','done'), allowNull: false })
  status!: string

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

export default TaskTracking