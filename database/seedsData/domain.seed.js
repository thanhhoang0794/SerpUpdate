const fs = require('fs')
const { parse } = require('json2csv')

// Tạo dữ liệu seed
const domainTypes = ['own', 'competitor'];
const campaigns = 25
const domains = [];

for (let campaignId = 1; campaignId < 1 + campaigns; campaignId++) {
  domainTypes.forEach((type, index) => {
    domains.push({
      campaign_id: campaignId,
      domain: `domain${(campaignId - 1) * 2 + index + 1}.com`,
      slug: `slug${(campaignId - 1) * 2 + index + 1}`,
      domain_type: type,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
  })
}

// Chuyển đổi dữ liệu sang CSV
const fields = ['campaign_id', 'domain', 'slug', 'domain_type', 'created_at', 'updated_at']
const opts = { fields }
const csv = parse(domains, opts)

// Ghi dữ liệu CSV vào file
fs.writeFileSync('./csv/domains_seed.csv', csv)

console.log('CSV file has been created successfully.')
