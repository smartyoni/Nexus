const sharp = require('sharp');
const fs = require('fs');

// scripts 폴더가 없으면 생성
if (!fs.existsSync('./scripts')) {
  fs.mkdirSync('./scripts');
}

const sizes = [16, 32, 64, 128, 192, 512];
const inputPng = './public/icons/노트앱.png'; // 새 아이콘 사용

async function generateIcons() {
  for (const size of sizes) {
    await sharp(inputPng)
      .resize(size, size)
      .png()
      .toFile(`./public/icons/icon-${size}.png`);

    console.log(`Generated icon-${size}.png`);
  }
  console.log('All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
});
