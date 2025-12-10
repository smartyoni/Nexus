import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const iconPath = path.resolve('./public/icons/icon.svg');
const sizes = [16, 32, 64, 128];

async function generateIcons() {
  try {
    for (const size of sizes) {
      const outputPath = path.resolve(`./public/icons/icon-${size}.png`);

      await sharp(iconPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✓ Generated icon-${size}.png`);
    }
    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

generateIcons();
