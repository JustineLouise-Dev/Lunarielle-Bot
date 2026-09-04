// Copyright (c) 2026 Justine Louise.
// Created by Justine Louise.
//
// This software is provided for personal and educational use only.
// Commercial use, resale, or distribution for profit is strictly prohibited
// without prior written permission from the author.
//
// Please respect the developer's work.
// Do not remove or modify this copyright notice or claim this project as your own.
//
// © 2026 Justine Louise. All Rights Reserved.
// ® Powered By Zapo-js
//
// settings.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CONFIG_PATH = path.join(__dirname, 'config.json')

function loadConfigFile() {
  if (!fs.existsSync(CONFIG_PATH)) {
    throw new Error(`[SETTINGS] config.json tidak ditemukan di ${CONFIG_PATH}`)
  }

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
    return JSON.parse(raw)
  } catch (err) {
    throw new Error(`[SETTINGS] Gagal membaca/parse config.json: ${err?.message || err}`)
  }
}

export const settings = loadConfigFile()
export const config = settings

export function updateSetting(key, value) {
  try {
    const current = loadConfigFile()

    if (!(key in current)) {
      console.error(`[SETTINGS] Properti "${key}" tidak ditemukan di config.json`)
      return false
    }

    current[key] = value

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(current, null, 2) + '\n', 'utf8')

    // sinkronkan object yang dipake di memori (module singleton)
    settings[key] = value

    return true
  } catch (err) {
    console.error('[SETTINGS] Gagal mengedit config.json:', err?.message || err)
    return false
  }
}

export const updateConfig = updateSetting
