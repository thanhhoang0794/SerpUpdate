const fs = require('fs')
const { parse } = require('json2csv')

// Tạo dữ liệu seed
const transactions = Array.from({ length: 20 }, (_, index) => ({
  user_id: (index % 20) + 1, // Đảm bảo user_id nằm trong khoảng từ 1 đến 20
  transaction_date: new Date().toISOString(),
  stripe_id: `stripe_${index + 1}`,
  amount: (Math.random() * 100).toFixed(2), // Số tiền ngẫu nhiên từ 0 đến 100
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// Chuyển đổi dữ liệu sang CSV
const fields = ['id', 'user_id', 'transaction_date', 'stripe_id', 'amount', 'created_at', 'updated_at']
const opts = { fields }
const csv = parse(transactions, opts)

// Ghi dữ liệu CSV vào file
fs.writeFileSync('./csv/transactions_seed.csv', csv)

console.log('CSV file has been created successfully.')
