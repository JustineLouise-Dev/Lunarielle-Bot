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
// db/addresponStore.js
//
// Menyimpan data auto-respon custom milik owner (fitur .addrespon).
// Metadata (trigger + daftar respon) disimpan di SQLite; isi media
// (gambar/stiker/video/dokumen/audio) tetap ditulis sebagai file terpisah
// di store/addrespon/<id>.<ext> supaya database tetap ringan.

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_DIR = path.join(__dirname, '..', 'store')
const MEDIA_DIR = path.join(STORE_DIR, 'addrespon')
const dbPath = path.join(STORE_DIR, 'addrespon.db')

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true })
if (!fs.existsSync(MEDIA_DIR)) fs.mkdirSync(MEDIA_DIR, { recursive: true })

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('wal_autocheckpoint = 1000')
db.pragma('journal_size_limit = 67108864')
db.pragma('cache_size = -8000')
db.pragma('temp_store = MEMORY')
db.pragma('mmap_size = 268435456')

db.exec(`
    CREATE TABLE IF NOT EXISTS addrespon_items (
        id TEXT PRIMARY KEY,
        trigger_key TEXT NOT NULL,
        trigger_display TEXT NOT NULL,
        type TEXT NOT NULL,
        text TEXT,
        media_file TEXT,
        mimetype TEXT,
        created_at INTEGER NOT NULL,
        created_by TEXT
    )
`)
db.exec(`CREATE INDEX IF NOT EXISTS idx_addrespon_trigger_key ON addrespon_items (trigger_key)`)

const stmtInsert = db.prepare(`
    INSERT INTO addrespon_items (id, trigger_key, trigger_display, type, text, media_file, mimetype, created_at, created_by)
    VALUES (@id, @triggerKey, @triggerDisplay, @type, @text, @mediaFile, @mimetype, @createdAt, @createdBy)
`)
const stmtDeleteByTrigger = db.prepare(`DELETE FROM addrespon_items WHERE trigger_key = ?`)
const stmtDeleteById = db.prepare(`DELETE FROM addrespon_items WHERE id = ?`)
const stmtLoadAll = db.prepare(`SELECT * FROM addrespon_items ORDER BY created_at ASC`)

const cache = new Map()

function toItem(row) {
  return {
    id: row.id,
    type: row.type,
    text: row.text || '',
    mediaFile: row.media_file || null,
    mimetype: row.mimetype || null,
    createdAt: row.created_at,
    createdBy: row.created_by || null
  }
}

function rebuildCache() {
  cache.clear()
  for (const row of stmtLoadAll.all()) {
    if (!cache.has(row.trigger_key)) {
      cache.set(row.trigger_key, { trigger: row.trigger_display, items: [] })
    }
    cache.get(row.trigger_key).items.push(toItem(row))
  }
}

rebuildCache()

export function normalizeTrigger(trigger) {
  const trimmed = String(trigger || '').trim().toLowerCase().replace(/\s+/g, ' ')
  return trimmed.replace(/@\+?([0-9][0-9\s-]*[0-9]|[0-9])/g, (m, digits) => `@${digits.replace(/[^0-9]/g, '')}`)
}

export function addAddresponItem({ trigger, type, text, mediaBuffer, ext, mimetype, createdBy }) {
  const key = normalizeTrigger(trigger)
  if (!key) throw new Error('Trigger tidak boleh kosong.')

  const id = crypto.randomBytes(6).toString('hex')
  let mediaFile = null

  if (mediaBuffer && mediaBuffer.length) {
    const safeExt = String(ext || 'bin').replace(/[^a-z0-9]/gi, '') || 'bin'
    mediaFile = `${id}.${safeExt}`
    fs.writeFileSync(path.join(MEDIA_DIR, mediaFile), mediaBuffer)
  }

  const row = {
    id,
    triggerKey: key,
    triggerDisplay: key,
    type,
    text: text || '',
    mediaFile,
    mimetype: mimetype || null,
    createdAt: Date.now(),
    createdBy: createdBy || null
  }

  stmtInsert.run(row)
  rebuildCache()

  return { trigger: cache.get(key), item: toItem({ ...row, trigger_key: key, media_file: mediaFile, created_at: row.createdAt, created_by: row.createdBy }) }
}

export function getAddrespon(trigger) {
  return cache.get(normalizeTrigger(trigger)) || null
}

export function findMatchingAddrespon(incomingText) {
  const key = normalizeTrigger(incomingText)
  if (!key) return null
  return cache.get(key) || null
}

export function listAddrespon() {
  return [...cache.values()].sort((a, b) => {
    const aLatest = Math.max(...a.items.map((i) => i.createdAt))
    const bLatest = Math.max(...b.items.map((i) => i.createdAt))
    return bLatest - aLatest
  })
}

function unlinkMediaIfExists(mediaFile) {
  if (!mediaFile) return
  const mediaPath = path.join(MEDIA_DIR, mediaFile)
  if (fs.existsSync(mediaPath)) {
    try { fs.unlinkSync(mediaPath) } catch {  }
  }
}

export function deleteAddrespon(trigger) {
  const key = normalizeTrigger(trigger)
  const existing = cache.get(key)
  if (!existing) return false

  for (const item of existing.items) unlinkMediaIfExists(item.mediaFile)

  stmtDeleteByTrigger.run(key)
  rebuildCache()
  return true
}

export function deleteAddresponItem(trigger, index) {
  const key = normalizeTrigger(trigger)
  const existing = cache.get(key)
  if (!existing) return false

  const idx = index - 1
  if (idx < 0 || idx >= existing.items.length) return false

  const removed = existing.items[idx]
  unlinkMediaIfExists(removed.mediaFile)
  stmtDeleteById.run(removed.id)
  rebuildCache()

  return cache.has(key) ? 'deleted-item' : 'deleted-trigger'
}

export function getAddresponMediaPath(item) {
  if (!item?.mediaFile) return null
  return path.join(MEDIA_DIR, item.mediaFile)
}

export function getAddresponMediaBuffer(item) {
  const mediaPath = getAddresponMediaPath(item)
  if (!mediaPath || !fs.existsSync(mediaPath)) return null
  return fs.readFileSync(mediaPath)
}
