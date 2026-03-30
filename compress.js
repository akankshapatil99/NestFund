import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import ffmpegPath from 'ffmpeg-static';

const videosDir = path.join(process.cwd(), 'frontend', 'public', 'assets', 'videos');
const files = fs.readdirSync(videosDir).filter(f => f.endsWith('.mp4'));

console.log(`Found ${files.length} videos to compress.`);

for (const file of files) {
  const inputPath = path.join(videosDir, file);
  const sizeMb = fs.statSync(inputPath).size / (1024 * 1024);
  
  if (sizeMb > 20) {
    const backupPath = path.join(videosDir, file + '.bak');
    const outputPath = path.join(videosDir, 'compressed_' + file);
    fs.renameSync(inputPath, backupPath);

    console.log(`Compressing ${file} (${sizeMb.toFixed(2)} MB) to 720p/CRF28...`);

    try {
      execFileSync(ffmpegPath, [
        '-i', backupPath,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-vf', 'scale=-2:720',
        '-acodec', 'aac',
        '-b:a', '128k',
        outputPath
      ]);
      
      const newSizeMb = fs.statSync(outputPath).size / (1024 * 1024);
      console.log(`Success! New size: ${newSizeMb.toFixed(2)} MB`);
      
      // Replace original file with compressed one
      fs.renameSync(outputPath, inputPath);
      // Delete backup to save space
      fs.unlinkSync(backupPath);
    } catch (e) {
      console.error(`Failed to compress ${file}:`, e.message);
      // Restore backup if failed
      if (fs.existsSync(backupPath)) {
         fs.renameSync(backupPath, inputPath);
      }
    }
  } else {
    console.log(`Skipping ${file} (${sizeMb.toFixed(2)} MB) - already small.`);
  }
}

console.log('All done!');
