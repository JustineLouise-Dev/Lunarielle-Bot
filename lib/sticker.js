/*
 * Copyright (c) 2026 Justine Louise.
 * Created by Justine Louise.
 *
 * This software is provided for personal and educational use only.
 * Commercial use, resale, or distribution for profit is strictly prohibited
 * without prior written permission from the author.
 *
 * Please respect the developer's work.
 * Do not remove or modify this copyright notice or claim this project as your own.
 *
 * © 2026 Justine Louise. All Rights Reserved.
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);

let cachedFfmpegPath;

/**
 * Resolve a usable ffmpeg binary path.
 * Priority:
 *  1. FFMPEG_PATH env var (manual override)
 *  2. ffmpeg-static (prebuilt binary), if it actually installed for this arch
 *  3. "ffmpeg" from system PATH (e.g. installed via `pkg install ffmpeg` on Termux,
 *     or `apt install ffmpeg` / `brew install ffmpeg` elsewhere)
 */
async function resolveFfmpegPath() {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpegPath = process.env.FFMPEG_PATH;
    return cachedFfmpegPath;
  }

  try {
    const mod = await import('ffmpeg-static');
    const staticPath = mod.default;
    if (staticPath && fs.existsSync(staticPath)) {
      cachedFfmpegPath = staticPath;
      return cachedFfmpegPath;
    }
  } catch {
    // ffmpeg-static not installed or failed to load — fall through to system ffmpeg
  }

  try {
    await execFileAsync('ffmpeg', ['-version']);
    cachedFfmpegPath = 'ffmpeg';
    return cachedFfmpegPath;
  } catch {
    throw new Error(
      'ffmpeg tidak ditemukan. Install ffmpeg di sistem, misalnya:\n' +
        '  Termux : pkg install ffmpeg\n' +
        '  Debian/Ubuntu : sudo apt install ffmpeg\n' +
        '  macOS : brew install ffmpeg\n' +
        'atau set FFMPEG_PATH ke lokasi binary ffmpeg.'
    );
  }
}

const MAX_STATIC_SIZE = 512;
const ANIMATED_FPS = 15;
const ANIMATED_MAX_DURATION = 10;

function tempFilePath(ext) {
  return path.join(os.tmpdir(), `sticker-${crypto.randomBytes(8).toString('hex')}.${ext}`);
}

async function convertImageToWebp(inputBuffer) {
  return sharp(inputBuffer)
    .resize(MAX_STATIC_SIZE, MAX_STATIC_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp({ quality: 80 })
    .toBuffer();
}

async function convertVideoToWebp(inputBuffer, inputExt) {
  const inputPath = tempFilePath(inputExt);
  const outputPath = tempFilePath('webp');

  try {
    await fs.promises.writeFile(inputPath, inputBuffer);

    const ffmpegPath = await resolveFfmpegPath();

    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', inputPath,
      '-t', String(ANIMATED_MAX_DURATION),
      '-vf',
      `fps=${ANIMATED_FPS},scale=${MAX_STATIC_SIZE}:${MAX_STATIC_SIZE}:force_original_aspect_ratio=decrease,` +
        `pad=${MAX_STATIC_SIZE}:${MAX_STATIC_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
      '-loop', '0',
      '-preset', 'default',
      '-an',
      '-vsync', '0',
      '-s', `${MAX_STATIC_SIZE}x${MAX_STATIC_SIZE}`,
      outputPath,
    ]);

    return await fs.promises.readFile(outputPath);
  } finally {
    fs.promises.unlink(inputPath).catch(() => {});
    fs.promises.unlink(outputPath).catch(() => {});
  }
}

function buildExifPayload({ packname, author }) {
  const json = {
    'sticker-pack-id': crypto.randomBytes(16).toString('hex'),
    'sticker-pack-name': packname || '',
    'sticker-pack-publisher': author || '',
    'emojis': ['😀'],
  };

  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8');
  
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2a, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57,
    0x07, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x16, 0x00, 0x00, 0x00,
  ]);
  exifAttr.writeUIntLE(jsonBuffer.length, 14, 4);

  return Buffer.concat([exifAttr, jsonBuffer]);
}

function riffChunk(fourCc, payload) {
  const chunk = Buffer.alloc(8 + payload.length + (payload.length % 2));
  chunk.write(fourCc, 0, 'ascii');
  chunk.writeUInt32LE(payload.length, 4);
  payload.copy(chunk, 8);
  return chunk;
}

function parseRiffChunks(body) {
  const chunks = [];
  let offset = 0;
  while (offset + 8 <= body.length) {
    const fourCc = body.toString('ascii', offset, offset + 4);
    const size = body.readUInt32LE(offset + 4);
    const total = 8 + size + (size % 2);
    if (offset + total > body.length) break; 
    chunks.push(body.slice(offset, offset + total));
    offset += total;
  }
  return chunks;
}

function injectExif(webpBuffer, { packname, author }) {
  const riffSize = webpBuffer.readUInt32LE(4);
  const body = webpBuffer.slice(12, 12 + riffSize - 4);

  const existingChunks = parseRiffChunks(body).filter((c) => c.toString('ascii', 0, 4) !== 'EXIF');

  const exifPayload = buildExifPayload({ packname, author });
  const exifChunk = riffChunk('EXIF', exifPayload);

  const newBody = Buffer.concat([...existingChunks, exifChunk]);
  const newRiffSize = 4 + newBody.length; 

  const header = Buffer.alloc(12);
  header.write('RIFF', 0, 'ascii');
  header.writeUInt32LE(newRiffSize, 4);
  header.write('WEBP', 8, 'ascii');

  return Buffer.concat([header, newBody]);
}

export async function createSticker({ buffer, isAnimated, sourceExt, packname, author }) {
  const webpBuffer = isAnimated
    ? await convertVideoToWebp(buffer, sourceExt || 'mp4')
    : await convertImageToWebp(buffer);

  return injectExif(webpBuffer, { packname, author });
}

export function replaceStickerMetadata(webpBuffer, packname, author) {
  return injectExif(webpBuffer, { packname, author });
}
