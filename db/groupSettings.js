// Copyright (c) 2026 Justine Louise & MioDev.
// Created by Justine Louise & MioDev.
//
// This software is provided for personal and educational use only.
// Commercial use, resale, or distribution for profit is strictly prohibited
// without prior written permission from the author.
//
// Please respect the developer's work.
// Do not remove or modify this copyright notice or claim this project as your own.
//
// © 2026 Justine Louise & MioDev. All Rights Reserved.
// ® Powered By Zapo-js
// db/groupSettings.js

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_DIR = path.join(__dirname, '..', 'store')
const dbPath = path.join(STORE_DIR, 'group_settings.db')

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true })

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('wal_autocheckpoint = 1000')
db.pragma('journal_size_limit = 67108864')
db.pragma('cache_size = -8000')
db.pragma('temp_store = MEMORY')
db.pragma('mmap_size = 268435456')

db.exec(`
    CREATE TABLE IF NOT EXISTS group_settings (
        group_jid TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        PRIMARY KEY (group_jid, key)
    )
`)

const stmtUpsert = db.prepare(`
    INSERT INTO group_settings (group_jid, key, value) VALUES (?, ?, ?)
    ON CONFLICT(group_jid, key) DO UPDATE SET value = excluded.value
`)
const stmtDelete = db.prepare(`DELETE FROM group_settings WHERE group_jid = ? AND key = ?`)
const stmtDeleteGroup = db.prepare(`DELETE FROM group_settings WHERE group_jid = ?`)
const stmtLoadAll = db.prepare(`SELECT group_jid, key, value FROM group_settings`)

const settingsCache = new Map()

function groupBucket(groupJid) {
  if (!settingsCache.has(groupJid)) settingsCache.set(groupJid, new Map())
  return settingsCache.get(groupJid)
}

for (const row of stmtLoadAll.all()) {
  let parsed
  try {
    parsed = JSON.parse(row.value)
  } catch {
    parsed = row.value
  }
  groupBucket(row.group_jid).set(row.key, parsed)
}

export function getGroupSettings(groupJid) {
  const bucket = settingsCache.get(groupJid)
  if (!bucket) return {}
  return Object.fromEntries(bucket)
}

export function getGroupSetting(groupJid, key, defaultValue = false) {
  const bucket = settingsCache.get(groupJid)
  if (!bucket || !bucket.has(key)) return defaultValue
  return bucket.get(key)
}

export function setGroupSetting(groupJid, key, value) {
  stmtUpsert.run(groupJid, key, JSON.stringify(value))
  groupBucket(groupJid).set(key, value)
  return getGroupSettings(groupJid)
}

export function listGroupsWithSetting(key) {
  const result = []
  for (const [groupJid, bucket] of settingsCache) {
    if (bucket.get(key)) result.push(groupJid)
  }
  return result
}

export function deleteGroupSettings(groupJid) {
  if (!settingsCache.has(groupJid)) return false
  stmtDeleteGroup.run(groupJid)
  settingsCache.delete(groupJid)
  return true
}

export function deleteGroupSetting(groupJid, key) {
  const bucket = settingsCache.get(groupJid)
  if (!bucket || !bucket.has(key)) return false
  stmtDelete.run(groupJid, key)
  bucket.delete(key)
  return true
}
