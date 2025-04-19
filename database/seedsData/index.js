const fs = require('fs');
const path = require('path');

// Đường dẫn tới thư mục seedsData
const seedsDataPath = path.join(__dirname);

// Đọc tất cả các file trong thư mục seedsData
fs.readdir(seedsDataPath, (err, files) => {
  if (err) {
    console.error('Không thể đọc thư mục:', err);
    return;
  }

  // Lọc các file có đuôi .js
  const jsFiles = files.filter(file => file.endsWith('.js'));

  // Thực thi từng file .js
  jsFiles.forEach(file => {
    const filePath = path.join(seedsDataPath, file);
    console.log(`Đang chạy file: ${filePath}`);
    require(filePath);
  });
});