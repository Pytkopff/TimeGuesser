const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = process.argv[2];
const OUTPUT_DIR = process.argv[3];

if (!SOURCE_DIR || !OUTPUT_DIR) {
  console.error('❌ Użycie: node process_local_photos.js "<input_dir>" "<output_dir>"');
  process.exit(1);
}

const TARGET_WIDTH = 1200;
const TARGET_HEIGHT = 1600; // 3:4
const JPEG_QUALITY = 82;

const allowedExt = new Set(['.jpg', '.jpeg', '.png']);

async function processImage(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate()
    .resize(TARGET_WIDTH, TARGET_HEIGHT, {
      fit: 'contain',
      background: { r: 10, g: 10, b: 10 }
    })
    .jpeg({ quality: JPEG_QUALITY, chromaSubsampling: '4:4:4' })
    .toFile(outputPath);
}

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(SOURCE_DIR)
    .map((file) => path.join(SOURCE_DIR, file))
    .filter((file) => fs.statSync(file).isFile())
    .filter((file) => allowedExt.has(path.extname(file).toLowerCase()));

  if (files.length === 0) {
    console.log('⚠️  Brak plików JPG/PNG w folderze wejściowym.');
    return;
  }

  console.log(`🧰 Przetwarzam ${files.length} zdjęć...`);

  for (const inputPath of files) {
    const base = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(OUTPUT_DIR, `${base}.jpg`);
    try {
      await processImage(inputPath, outputPath);
      console.log(`✅ ${path.basename(outputPath)}`);
    } catch (err) {
      console.error(`❌ ${path.basename(inputPath)}: ${err.message || err}`);
    }
  }

  console.log('✅ Gotowe. Sprawdź folder wyjściowy.');
}

run();
