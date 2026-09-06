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
// db/moderationStore.js

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_DIR = path.join(__dirname, '..', 'store')
const dbPath = path.join(STORE_DIR, 'moderation.db')

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
    CREATE TABLE IF NOT EXISTS bans (
        jid TEXT PRIMARY KEY,
        created_at INTEGER NOT NULL,
        expires_at INTEGER,
        actor TEXT
    )
`)

const stmtUpsert = db.prepare(`
    INSERT INTO bans (jid, created_at, expires_at, actor)
    VALUES (@jid, @createdAt, @expiresAt, @actor)
    ON CONFLICT(jid) DO UPDATE SET
        created_at = excluded.created_at,
        expires_at = excluded.expires_at,
        actor = excluded.actor
`)
const stmtDelete = db.prepare(`DELETE FROM bans WHERE jid = ?`)
const stmtDeleteExpired = db.prepare(`DELETE FROM bans WHERE expires_at IS NOT NULL AND expires_at <= ?`)
const stmtLoadAll = db.prepare(`SELECT * FROM bans`)

const bansCache = new Map()

function toPublic(row) {
  if (!row) return null
  return {
    jid: row.jid,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    actor: row.actor
  }
}

for (const row of stmtLoadAll.all()) {
  bansCache.set(row.jid, toPublic(row))
}

function normalizeNumberToJid(raw) {
  if (!raw) return null
  const value = String(raw).trim()
  if (!value) return null
  if (value.includes('@')) return value
  const digits = value.replace(/[^0-9]/g, '')
  return digits ? `${digits}@s.whatsapp.net` : null
}

function isBanExpired(entry) {
  return !!entry && entry.expiresAt != null && Date.now() >= entry.expiresAt
}

function cleanupExpiredBans() {
  const now = Date.now()
  let changed = false
  for (const [jid, entry] of bansCache) {
    if (isBanExpired(entry)) {
      bansCache.delete(jid)
      changed = true
    }
  }
  if (changed) stmtDeleteExpired.run(now)
}

export function listActiveBans() {
  cleanupExpiredBans()
  return [...bansCache.values()]
}

export function getBanInfo(jid) {
  const normalized = normalizeNumberToJid(jid)
  if (!normalized) return null
  cleanupExpiredBans()
  return bansCache.get(normalized) || null
}

export function isUserBanned(jid) {
  return Boolean(getBanInfo(jid))
}

export function banUser(jid, durationMs = null, actor = 'owner') {
  const normalized = normalizeNumberToJid(jid)
  if (!normalized) return null
  cleanupExpiredBans()

  const entry = {
    jid: normalized,
    createdAt: Date.now(),
    expiresAt: durationMs == null ? null : Date.now() + durationMs,
    actor: actor || 'owner'
  }

  stmtUpsert.run({
    jid: entry.jid,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    actor: entry.actor
  })
  bansCache.set(normalized, entry)
  return entry
}

export function unbanUser(jid) {
  const normalized = normalizeNumberToJid(jid)
  if (!normalized) return false
  if (!bansCache.has(normalized)) return false

  stmtDelete.run(normalized)
  bansCache.delete(normalized)
  return true
}

const DURATION_UNITS = {
  d: 86400,
  w: 86400 * 7,
  m: 86400 * 30,
  y: 86400 * 365
}

export function parseDurationToMs(input) {
  const match = String(input || '').trim().match(/^(\d+)\s*(d|w|m|y)$/i)
  if (!match) return null
  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  if (!amount || !DURATION_UNITS[unit]) return null
  return amount * DURATION_UNITS[unit] * 1000
}
