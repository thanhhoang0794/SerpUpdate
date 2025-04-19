const fs = require('fs')
const { parse } = require('json2csv')

const meaningfulNames = [
  'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot', 'Golf', 'Hotel', 
  'India', 'Juliet', 'Kilo', 'Lima', 'Mike', 'November', 'Oscar', 'Papa', 
  'Quebec', 'Romeo', 'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 
  'X-ray', 'Yankee', 'Zulu'
];

// Tạo dữ liệu seed
const campaigns = Array.from({ length: 25 }, (_, index) => ({
  name: meaningfulNames[Math.floor(Math.random() * meaningfulNames.length)] + Math.floor(Math.random() * 100),
  keyword_count: 50,
  devices: ['desktop', 'mobile', 'both'][Math.floor(Math.random() * 3)], // Chọn ngẫu nhiên thiết bị
  country_code: ['VN', 'US'][Math.floor(Math.random() * 2)], // Chọn ngẫu nhiên từ VN, US, UK
  language: ['Vietnamese', 'English'][Math.floor(Math.random() * 2)], // Chọn ngẫu nhiên từ vi, en
  tags: `tag${index + 1}`,
  notification: `Notification ${index + 1}`,
  notification_interval: `Interval ${index + 1}`,
  notification_email: `user${index + 1}@example.com`,
  search_console: `Console ${index + 1}`,
  updating: Math.random() < 0.5, // Ngẫu nhiên true hoặc false
  sc_data: new Date().toISOString(),
  uid: `uid_${index + 1}`,
  city: `City ${index + 1}`,
  day_of_week: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].slice(
    0,
    Math.floor(Math.random() * 7)
  ), // Ngẫu nhiên các ngày trong tuần
  time_of_day: new Date().toISOString().split('T')[1], // Lấy phần thời gian trong ngày
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}))

// Chuyển đổi dữ liệu sang CSV
const fields = [
  'name',
  'keyword_count',
  'devices',
  'country_code',
  'language',
  'tags',
  'notification',
  'notification_interval',
  'notification_email',
  'search_console',
  'updating',
  'sc_data',
  'uid',
  'city',
  'day_of_week',
  'time_of_day',
  'created_at',
  'updated_at'
]
const opts = { fields }
const campaignsCsv = parse(campaigns, opts)

// Ghi dữ liệu CSV vào file
fs.writeFileSync('./csv/campaigns_seed.csv', campaignsCsv)

console.log('CSV file campaigns_seed.csv has been created successfully.')
