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
 * ® Powered By Zapo-js
 * lib/sticker.js
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

let cachedFfmpegPath;
let cachedSharp;
let sharpUnavailable = false;

async function loadSharp() {
  if (cachedSharp) return cachedSharp;
  if (sharpUnavailable) return null;
  try {
    const mod = await import('sharp');
    cachedSharp = mod.default || mod;
    return cachedSharp;
  } catch (e) {
    sharpUnavailable = true;
    return null;
  }
}

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

async function convertImageToWebpViaFfmpeg(inputBuffer) {
  const inputPath = tempFilePath('img');
  const outputPath = tempFilePath('webp');

  try {
    await fs.promises.writeFile(inputPath, inputBuffer);

    const ffmpegPath = await resolveFfmpegPath();

    await execFileAsync(ffmpegPath, [
      '-y',
      '-i', inputPath,
      '-vf',
      `scale=${MAX_STATIC_SIZE}:${MAX_STATIC_SIZE}:force_original_aspect_ratio=decrease,` +
        `pad=${MAX_STATIC_SIZE}:${MAX_STATIC_SIZE}:(ow-iw)/2:(oh-ih)/2:color=0x00000000`,
      '-c:v', 'libwebp',
      '-lossless', '0',
      '-q:v', '80',
      '-pix_fmt', 'yuva420p',
      '-frames:v', '1',
      outputPath,
    ]);

    return await fs.promises.readFile(outputPath);
  } finally {
    fs.promises.unlink(inputPath).catch(() => {});
    fs.promises.unlink(outputPath).catch(() => {});
  }
}

async function convertImageToWebp(inputBuffer) {
  const sharp = await loadSharp();

  if (sharp) {
    try {
      return await sharp(inputBuffer)
        .resize(MAX_STATIC_SIZE, MAX_STATIC_SIZE, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (e) {
      console.error('[STICKER] sharp gagal memproses gambar, fallback ke ffmpeg:', e.message);

    }
  }

  return convertImageToWebpViaFfmpeg(inputBuffer);
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

function readDimensionsFromSimpleChunk(chunk) {
  const fourCc = chunk.toString('ascii', 0, 4);
  const payload = chunk.slice(8);

  if (fourCc === 'VP8 ') {

    const width = payload.readUInt16LE(6) & 0x3fff;
    const height = payload.readUInt16LE(8) & 0x3fff;
    return { width, height };
  }

  if (fourCc === 'VP8L') {

    const b0 = payload[1];
    const b1 = payload[2];
    const b2 = payload[3];
    const b3 = payload[4];
    const bits = b0 | (b1 << 8) | (b2 << 16) | (b3 << 24);
    const width = (bits & 0x3fff) + 1;
    const height = ((bits >> 14) & 0x3fff) + 1;
    return { width, height };
  }

  return null;
}

function buildVp8xChunk({ width, height, hasAlpha }) {
  const payload = Buffer.alloc(10);
  let flags = 0;
  if (hasAlpha) flags |= 0x10;
  payload.writeUIntLE(width - 1, 4, 3);
  payload.writeUIntLE(height - 1, 7, 3);
  payload[0] = flags;

  const chunk = Buffer.alloc(8 + payload.length);
  chunk.write('VP8X', 0, 'ascii');
  chunk.writeUInt32LE(payload.length, 4);
  payload.copy(chunk, 8);
  return chunk;
}

function ensureVp8xContainer(chunks) {
  if (!chunks.length) return chunks;
  const first = chunks[0];
  const fourCc = first.toString('ascii', 0, 4);
  if (fourCc === 'VP8X') return chunks;

  const dims = readDimensionsFromSimpleChunk(first);
  if (!dims) return chunks;

  const vp8xChunk = buildVp8xChunk({
    width: dims.width,
    height: dims.height,
    hasAlpha: fourCc === 'VP8L',
  });

  return [vp8xChunk, ...chunks];
}

function injectExif(webpBuffer, { packname, author }) {
  const riffSize = webpBuffer.readUInt32LE(4);
  const body = webpBuffer.slice(12, 12 + riffSize - 4);

  const rawChunks = parseRiffChunks(body).filter((c) => c.toString('ascii', 0, 4) !== 'EXIF');
  const existingChunks = ensureVp8xContainer(rawChunks);

  if (existingChunks[0]?.toString('ascii', 0, 4) === 'VP8X') {
    existingChunks[0][8] |= 0x08;
  }

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
