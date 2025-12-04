const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets', 'images');

// Ensure directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Generate black background for Android adaptive icon (1024x1024)
async function generateBlackBackground() {
  const outputPath = path.join(assetsDir, 'android-icon-background-black.png');
  
  await sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 } // Black
    }
  })
  .png()
  .toFile(outputPath);
  
  console.log('✓ Generated black background image:', outputPath);
}

// Generate optimized icon with padding (smaller logo on black background)
async function generateOptimizedIcon() {
  const logoPath = path.join(assetsDir, 'app-logo.png');
  
  if (!fs.existsSync(logoPath)) {
    console.log('⚠ app-logo.png not found, skipping optimized icon generation');
    return;
  }

  const outputPath = path.join(assetsDir, 'app-icon-optimized.png');
  
  // Create 1024x1024 canvas with black background
  const canvas = sharp({
    create: {
      width: 1024,
      height: 1024,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  });

  // Resize logo to 60% of canvas (smaller size) and center it
  const logo = await sharp(logoPath)
    .resize(614, 614, { fit: 'contain' }) // 60% of 1024
    .toBuffer();

  await canvas
    .composite([{
      input: logo,
      top: 205, // Center vertically: (1024 - 614) / 2
      left: 205 // Center horizontally: (1024 - 614) / 2
    }])
    .png()
    .toFile(outputPath);

  console.log('✓ Generated optimized icon with smaller logo:', outputPath);
}

async function main() {
  try {
    await generateBlackBackground();
    await generateOptimizedIcon();
    console.log('\n✅ Icon assets generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update app.json to use android-icon-background-black.png for Android background');
    console.log('2. Optionally use app-icon-optimized.png if you want a pre-composed icon');
  } catch (error) {
    console.error('Error generating icon assets:', error);
    process.exit(1);
  }
}

main();

