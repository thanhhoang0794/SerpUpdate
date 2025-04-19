const fs = require('fs')
const { parse } = require('json2csv')

// Tạo dữ liệu seed
const campaigns = 25
const usersPerCampaign = 1 // 20 users / 5 campaigns = 4 users per campaign
const campaignUsers = []

for (let campaignId = 1; campaignId < 1 + campaigns; campaignId++) {
  for (let i = 0; i < usersPerCampaign; i++) {
    const userId = (campaignId - 1) * usersPerCampaign + i + 1
    campaignUsers.push({
      campaign_id: campaignId,
      user_id: "4b56d4c8-9589-4a75-8fea-c9d76986f112",
      is_creator: 1, // Chỉ user đầu tiên của mỗi campaign là creator
      can_edit: 1, // Chỉ user đầu tiên của mỗi campaign có thể edit
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  }
}

// Chuyển đổi dữ liệu sang CSV
const fields = ['campaign_id', 'user_id', 'is_creator', 'can_edit', 'created_at', 'updated_at']
const opts = { fields }
const csv = parse(campaignUsers, opts)

// Ghi dữ liệu CSV vào file
fs.writeFileSync('./csv/campaign_users_seed.csv', csv)

console.log('CSV file has been created successfully.')
