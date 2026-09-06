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
// db/afk.js

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { resolvePersonIdentifiers } from './trustedFeatures.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_DIR = path.join(__dirname, '..', 'store')
const dbPath = path.join(STORE_DIR, 'afk.db')

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
    CREATE TABLE IF NOT EXISTS afk (
        jid TEXT NOT NULL,
        group_jid TEXT NOT NULL,
        reason TEXT NOT NULL,
        since INTEGER NOT NULL,
        PRIMARY KEY (jid, group_jid)
    )
`)

const stmtUpsert = db.prepare(`
    INSERT INTO afk (jid, group_jid, reason, since) VALUES (?, ?, ?, ?)
    ON CONFLICT(jid, group_jid) DO UPDATE SET reason = excluded.reason, since = excluded.since
`)
const stmtDelete = db.prepare(`DELETE FROM afk WHERE jid = ? AND group_jid = ?`)
const stmtLoadAll = db.prepare(`SELECT jid, group_jid, reason, since FROM afk`)

const afkCache = new Map()

function groupBucket(groupJid) {
  if (!afkCache.has(groupJid)) afkCache.set(groupJid, new Map())
  return afkCache.get(groupJid)
}

for (const row of stmtLoadAll.all()) {
  groupBucket(row.group_jid).set(row.jid, row)
}

function toPublic(row) {
  if (!row) return null
  return { jid: row.jid, groupJid: row.group_jid, reason: row.reason, since: row.since }
}

export function setAfk(jid, groupJid, reason) {
  const since = Date.now()
  const cleanReason = reason || 'Tidak ada alasan'
  const bucket = groupBucket(groupJid)

  let primaryRow = null
  for (const id of resolvePersonIdentifiers(jid)) {
    stmtUpsert.run(id, groupJid, cleanReason, since)
    const row = { jid: id, group_jid: groupJid, reason: cleanReason, since }
    bucket.set(id, row)
    if (id === jid) primaryRow = row
  }

  return toPublic(primaryRow || { jid, group_jid: groupJid, reason: cleanReason, since })
}

export function getAfk(jid, groupJid) {
  const bucket = afkCache.get(groupJid)
  if (!bucket) return null

  for (const id of resolvePersonIdentifiers(jid)) {
    const row = bucket.get(id)
    if (row) return toPublic(row)
  }
  return null
}

export function clearAfk(jid, groupJid) {
  const bucket = afkCache.get(groupJid)
  let data = null

  for (const id of resolvePersonIdentifiers(jid)) {
    const row = bucket?.get(id)
    if (row && !data) data = toPublic(row)
    stmtDelete.run(id, groupJid)
    bucket?.delete(id)
  }

  return data
}

export function formatDuration(ms) {
  let totalSeconds = Math.floor(ms / 1000)

  const days = Math.floor(totalSeconds / 86400)
  totalSeconds -= days * 86400
  const hours = Math.floor(totalSeconds / 3600)
  totalSeconds -= hours * 3600
  const minutes = Math.floor(totalSeconds / 60)
  totalSeconds -= minutes * 60
  const seconds = totalSeconds

  const parts = []
  if (days > 0) parts.push(`${days} hari`)
  if (hours > 0) parts.push(`${hours} jam`)
  if (minutes > 0) parts.push(`${minutes} menit`)
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`)

  return parts.join(' ')
}
