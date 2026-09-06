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
 * lib/brat.js
 */

import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CANVAS_SIZE = 1080;
const FONTS_DIR = path.join(__dirname, '../assets/fonts');
const FONT_PATH = path.join(FONTS_DIR, 'arial_narrow.ttf');
const FONT_FAMILY = 'Arial Narrow Brat';

const MARGIN_X = 90;
const MARGIN_TOP = 260;
const LINE_SPACING_FACTOR = 0.98;
const MAX_FONT_SIZE = 220;
const MIN_FONT_SIZE = 26;
const FONT_STEP = 6;
const BLUR_PX = 1.3;

let fontRegistered = false;

function ensureFontRegistered() {
  if (fontRegistered) return;

  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Font tidak ditemukan di ${FONT_PATH}`);
  }

  const ok = GlobalFonts.registerFromPath(FONT_PATH, FONT_FAMILY);
  if (!ok) {
    throw new Error('Gagal mendaftarkan font Arial Narrow ke @napi-rs/canvas.');
  }
  fontRegistered = true;
}

function measureWidth(ctx, text, fontSize) {
  ctx.font = `${fontSize}px "${FONT_FAMILY}"`;
  return ctx.measureText(text).width;
}

function wrapByPixels(ctx, words, fontSize, maxWidth) {
  const lines = [];
  let current = [];

  for (const word of words) {
    const trial = [...current, word];
    const width = measureWidth(ctx, trial.join(' '), fontSize);
    if (width <= maxWidth || current.length === 0) {
      current = trial;
    } else {
      lines.push(current);
      current = [word];
    }
  }
  if (current.length) lines.push(current);
  return lines;
}

function fitTextToCanvas(ctx, words) {
  const maxTextWidth = CANVAS_SIZE - MARGIN_X * 2;
  const maxTotalHeight = CANVAS_SIZE - MARGIN_TOP - 80;

  let fontSize = MAX_FONT_SIZE;
  let lines = wrapByPixels(ctx, words, fontSize, maxTextWidth);
  let lineAdvance = fontSize * LINE_SPACING_FACTOR + fontSize * 0.18;

  while (fontSize > MIN_FONT_SIZE) {
    lines = wrapByPixels(ctx, words, fontSize, maxTextWidth);
    lineAdvance = fontSize * LINE_SPACING_FACTOR + fontSize * 0.18;
    const totalHeight = lineAdvance * lines.length;
    if (totalHeight <= maxTotalHeight) break;
    fontSize -= FONT_STEP;
  }

  return { fontSize, lines, lineAdvance, maxTextWidth };
}

function drawJustifiedLine(ctx, { words, fontSize, y, xLeft, xRight, isLastLine }) {
  ctx.font = `${fontSize}px "${FONT_FAMILY}"`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  if (words.length === 1 || isLastLine) {
    ctx.fillText(words.join(' '), xLeft, y);
    return;
  }

  const wordWidths = words.map((w) => measureWidth(ctx, w, fontSize));
  const totalWordWidth = wordWidths.reduce((a, b) => a + b, 0);
  const available = xRight - xLeft;
  const gapCount = words.length - 1;
  const gap = gapCount > 0 ? (available - totalWordWidth) / gapCount : 0;

  let cursor = xLeft;
  words.forEach((word, i) => {
    ctx.fillText(word, cursor, y);
    cursor += wordWidths[i] + gap;
  });
}

function drawBratCanvas(text, { bgColor = '#ffffff', textColor = '#000000' } = {}) {
  ensureFontRegistered();

  const words = text.trim().split(/\s+/);
  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  const { fontSize, lines, lineAdvance } = fitTextToCanvas(ctx, words);
  const xLeft = MARGIN_X;
  const xRight = CANVAS_SIZE - MARGIN_X;

  ctx.fillStyle = textColor;
  ctx.filter = `blur(${BLUR_PX}px)`;

  let y = MARGIN_TOP + fontSize;
  lines.forEach((lineWords, i) => {
    const isLastLine = i === lines.length - 1;
    drawJustifiedLine(ctx, {
      words: lineWords,
      fontSize,
      y,
      xLeft,
      xRight,
      isLastLine,
    });
    y += lineAdvance;
  });

  return canvas;
}

export async function generateBratImage(text, opts = {}) {
  const clean = String(text || '').trim();
  if (!clean) {
    throw new Error('Teks tidak boleh kosong.');
  }
  if (clean.length > 300) {
    throw new Error('Teks terlalu panjang. Maksimal 300 karakter.');
  }

  const canvas = drawBratCanvas(clean, opts);

  return canvas.encode('png');
}
