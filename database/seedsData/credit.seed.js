const fs = require('fs')
const { parse } = require('json2csv')

// Tạo dữ liệu seed
const credits = Array.from({ length: 20 }, (_, index) => ({
  user_id: (index % 20) + 1, // Đảm bảo user_id nằm trong khoảng từ 1 đến 20
  total_credits: Math.floor(Math.random() * 1000), // Tổng số credit ngẫu nhiên từ 0 đến 1000
  bonus_credits: Math.floor(Math.random() * 200), // Bonus credit ngẫu nhiên từ 0 đến 200
  expired_credits: Math.floor(Math.random() * 100), // Expired credit ngẫu nhiên từ 0 đến 100
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// Chuyển đổi dữ liệu sang CSV
const fields = ['id', 'user_id', 'total_credits', 'bonus_credits', 'expired_credits', 'created_at', 'updated_at']
const opts = { fields }
const csv = parse(credits, opts)

// Ghi dữ liệu CSV vào file
fs.writeFileSync('./csv/credits_seed.csv', csv)

console.log('CSV file has been created successfully.')
