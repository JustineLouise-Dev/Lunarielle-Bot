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
 * lib/meme.js
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'meme-font-impact.ttf');

const GLYPH_WIDTH_EM = {
  A: 0.4854, B: 0.4785, C: 0.4741, D: 0.4932, E: 0.4116, F: 0.3989,
  G: 0.4849, H: 0.499, I: 0.2266, J: 0.4663, K: 0.4722, L: 0.3975,
  M: 0.7461, N: 0.498, O: 0.4863, P: 0.4722, Q: 0.4937, R: 0.4766,
  S: 0.4614, T: 0.3955, U: 0.4736, V: 0.4692, W: 0.7119, X: 0.4839,
  Y: 0.4463, Z: 0.4102,
  '0': 0.4941, '1': 0.3306, '2': 0.4941, '3': 0.4941, '4': 0.4941,
  '5': 0.4941, '6': 0.4941, '7': 0.4941, '8': 0.4941, '9': 0.4941,
  ' ': 0.2344, '.': 0.2285, ',': 0.2363, '!': 0.229, '?': 0.4922,
  '|': 0.2163, '-': 0.311, "'": 0.2139, '"': 0.4287,
};
const DEFAULT_GLYPH_WIDTH_EM = 0.5;

function estimateTextWidthEm(text) {
  let total = 0;
  for (const ch of String(text)) {
    total += GLYPH_WIDTH_EM[ch] ?? DEFAULT_GLYPH_WIDTH_EM;
  }
  return total;
}

let cachedFfmpegPath;

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
    throw new Error('ffmpeg tidak ditemukan. Install ffmpeg di sistem atau set FFMPEG_PATH.');
  }
}

function tempFilePath(ext) {
  return path.join(os.tmpdir(), `meme-${crypto.randomBytes(8).toString('hex')}.${ext}`);
}

async function probeMediaWidth(filePath, ffmpegPath) {
  try {
    const ffprobePath = ffmpegPath.replace(/ffmpeg(\.exe)?$/i, (m) =>
      m.toLowerCase().includes('.exe') ? 'ffprobe.exe' : 'ffprobe'
    );
    const candidates = ffprobePath !== ffmpegPath ? [ffprobePath, 'ffprobe'] : ['ffprobe'];

    for (const bin of candidates) {
      try {
        const { stdout } = await execFileAsync(bin, [
          '-v', 'error',
          '-select_streams', 'v:0',
          '-show_entries', 'stream=width',
          '-of', 'csv=p=0',
          filePath,
        ]);
        const width = parseInt(String(stdout).trim(), 10);
        if (Number.isFinite(width) && width > 0) return width;
      } catch {

      }
    }
  } catch {

  }
  return null;
}

function escapeDrawtext(text) {
  return String(text)
    .replace(/\\/g, '\\\\\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, '\u2019')
    .replace(/%/g, '\\%');
}

const MAX_FONT_RATIO = 0.11;
const MIN_FONT_RATIO = 0.045;
const TEXT_WIDTH_MARGIN = 0.82;
const MAX_LINES = 3;

function wrapTextToLines(words, targetWidthEm, maxLines) {
  const lines = [];
  let current = [];
  let currentWidth = 0;
  const spaceWidth = GLYPH_WIDTH_EM[' '];

  for (const word of words) {
    const wordWidth = estimateTextWidthEm(word);
    const addedWidth = current.length ? currentWidth + spaceWidth + wordWidth : wordWidth;

    if (current.length && addedWidth > targetWidthEm && lines.length < maxLines - 1) {
      lines.push(current.join(' '));
      current = [word];
      currentWidth = wordWidth;
    } else {
      current.push(word);
      currentWidth = addedWidth;
    }
  }
  if (current.length) lines.push(current.join(' '));
  return lines;
}

function fitTextToCanvas(text, canvasWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const maxFontSize = Math.floor(canvasWidth * MAX_FONT_RATIO);
  const minFontSize = Math.max(12, Math.floor(canvasWidth * MIN_FONT_RATIO));
  const targetWidthEm = (canvasWidth * TEXT_WIDTH_MARGIN) / maxFontSize;

  for (let maxLines = 1; maxLines <= MAX_LINES; maxLines++) {
    const lines = wrapTextToLines(words, targetWidthEm, maxLines);
    const widestLineEm = Math.max(...lines.map((l) => estimateTextWidthEm(l)));
    const fontSize = Math.min(
      maxFontSize,
      Math.floor((canvasWidth * TEXT_WIDTH_MARGIN) / Math.max(0.0001, widestLineEm))
    );
    if (fontSize >= maxFontSize || maxLines === MAX_LINES) {
      return { lines, fontSize: Math.max(minFontSize, fontSize) };
    }
  }

  return { lines: [words.join(' ')], fontSize: minFontSize };
}

function buildDrawtextFilter({ text, canvasWidth, canvasHeight, position }) {
  const upper = String(text).toUpperCase();
  const { lines, fontSize } = fitTextToCanvas(upper, canvasWidth);
  const escaped = escapeDrawtext(lines.join('\n'));
  const fontPathEscaped = FONT_PATH.replace(/\\/g, '/').replace(/:/g, '\\:');

  const yExpr = position === 'top' ? 'h*0.04' : 'h-text_h-h*0.04';

  return (
    `drawtext=fontfile='${fontPathEscaped}':text='${escaped}':` +
    `fontsize=${fontSize}:fontcolor=white:` +
    `borderw=${Math.max(2, Math.round(fontSize / 13))}:bordercolor=black:` +
    `x=(w-text_w)/2:y=${yExpr}:` +
    `line_spacing=${Math.round(fontSize * 0.08)}:` +
    `text_align=center`
  );
}

export async function addMemeText({ buffer, isAnimated, sourceExt, topText, bottomText }) {
  if (!topText && !bottomText) {
    throw new Error('Minimal satu teks (atas atau bawah) harus diisi.');
  }
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Font meme tidak ditemukan di ${FONT_PATH}.`);
  }

  const inputExt = sourceExt || (isAnimated ? 'mp4' : 'jpg');
  const outputExt = isAnimated ? inputExt : inputExt;
  const inputPath = tempFilePath(inputExt);
  const outputPath = tempFilePath(outputExt === 'jpg' || outputExt === 'jpeg' ? 'png' : outputExt);

  try {
    await fs.promises.writeFile(inputPath, buffer);
    const ffmpegPath = await resolveFfmpegPath();

    const probedWidth = await probeMediaWidth(inputPath, ffmpegPath);
    const canvasWidth = probedWidth || 512;

    const filters = [];
    if (topText) {
      filters.push(buildDrawtextFilter({ text: topText, canvasWidth, position: 'top' }));
    }
    if (bottomText) {
      filters.push(buildDrawtextFilter({ text: bottomText, canvasWidth, position: 'bottom' }));
    }
    const vf = filters.join(',');

    const args = ['-y', '-i', inputPath];

    if (isAnimated) {
      args.push(
        '-vf', vf,
        '-loop', '0',
        '-an',
        '-vsync', '0',
        outputPath
      );
    } else {
      args.push('-vf', vf, outputPath);
    }

    await execFileAsync(ffmpegPath, args);
    return await fs.promises.readFile(outputPath);
  } finally {
    fs.promises.unlink(inputPath).catch(() => {});
    fs.promises.unlink(outputPath).catch(() => {});
  }
}
