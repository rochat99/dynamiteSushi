const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = './assets/images/items';
const files = fs.readdirSync(inputDir);

files
  .filter(f => f.endsWith('.jpeg') || f.endsWith('.jpg'))
  .forEach(file => {
    const outputFilename = file.replace(/\.jpe?g$/, '.webp');
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(inputDir, outputFilename);

    if (files.includes(outputFilename)) {
      console.log(`Skipped (webp already exists): ${file}`);
      return;
    }

    sharp(inputPath)
      .webp({ quality: 80 })
      .toFile(outputPath, (err) => {
        if (err) console.error(`Failed: ${file}`, err);
        else console.log(`Converted: ${file}`);
      });
  });