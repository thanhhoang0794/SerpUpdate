import { Table, Model, Column, DataType, PrimaryKey, ForeignKey, Default, Sequelize } from 'sequelize-typescript';
import Campaign from './campaign';
@Table({
  timestamps: false,
  tableName: 'campaignSnapshots',
})
class CampaignSnapshot extends Model {
  @ForeignKey(() => Campaign)
  @Column({ type: DataType.INTEGER, allowNull: false })
  campaign_id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  snapshot_type!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  snapshot_data!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  snapshot_date!: Date;

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

export default CampaignSnapshot;
