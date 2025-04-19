import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript';
import Campaign from './campaign';
import User from './user';
@Table({
  timestamps: false,
  tableName: 'campaignUsers',
})
class CampaignUser extends Model {
  @ForeignKey(() => Campaign)
  @Column({ type: DataType.INTEGER, allowNull: false })
  campaign_id!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.STRING, allowNull: false })
  user_id!: string;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_creator!: boolean;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  can_edit!: boolean;

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
}

export default CampaignUser;
