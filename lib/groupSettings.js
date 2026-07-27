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
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE_PATH = path.join(DATA_DIR, 'groupSettings.json');

function ensureFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILE_PATH)) fs.writeFileSync(FILE_PATH, '{}', 'utf-8');
}

function readAll() {
  ensureFile();
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  ensureFile();
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export function getGroupSettings(groupJid) {
  const all = readAll();
  return all[groupJid] || {};
}

export function getGroupSetting(groupJid, key, defaultValue = false) {
  const settings = getGroupSettings(groupJid);
  return key in settings ? settings[key] : defaultValue;
}

export function setGroupSetting(groupJid, key, value) {
  const all = readAll();
  all[groupJid] ??= {};
  all[groupJid][key] = value;
  writeAll(all);
  return all[groupJid];
}

export function listGroupsWithSetting(key) {
  const all = readAll();
  return Object.entries(all)
    .filter(([, settings]) => !!settings?.[key])
    .map(([groupJid]) => groupJid);
}
