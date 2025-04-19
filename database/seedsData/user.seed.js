const fs = require('fs')
const { parse } = require('json2csv')

// Tạo dữ liệu seed
const users = Array.from({ length: 20 }, (_, index) => ({
  google_id: `google_id_${index + 1}`,
  email: `user${index + 1}@example.com`,
  username: `user${index + 1}`,
  is_admin: index % 2 === 0, // Cứ mỗi người dùng thứ hai là admin
  affiliate_id: `affiliate_${index + 1}`,
  payment_method: `method_${index + 1}`,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// Chuyển đổi dữ liệu sang CSV
const fields = [
  'id',
  'google_id',
  'email',
  'username',
  'is_admin',
  'affiliate_id',
  'payment_method',
  'created_at',
  'updated_at'
]
const opts = { fields }
const csv = parse(users, opts)

// Ghi dữ liệu CSV vào file
fs.writeFileSync('./csv/users_seed.csv', csv)

console.log('CSV file has been created successfully.')
