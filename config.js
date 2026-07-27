/*
 * config.js
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
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8')
);

// Lokasi folder session auth WhatsApp
export const session = process.env.SESSION_DIR || path.join(__dirname, config.sessionName || 'session');

// Owner (dipakai fallback kalau ada bagian lama yang masih merujuk `owner`)
export const owner = process.env.OWNER_ID || `${config.ownerNumber}@s.whatsapp.net`;

export const cfg = {
  reactsw: { on: false, emojis: ['😍', '😂', '😬', '🤢', '🤮', '🥰', '😭'] },
  autoreadsw: false,
  call: { block: false, reject: false },
};

// Spinner loading di terminal
export const spinner = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

// Helper sleep
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Wadah data runtime sederhana (preferences per-chat, dsb)
export const Data = {
  preferences: {},
  sewa: {},
};
