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
// db/requestStore.js

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_DIR = path.join(__dirname, '..', 'store')
const dbPath = path.join(STORE_DIR, 'requests.db')

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
    CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        jid TEXT NOT NULL,
        phone TEXT,
        chat_jid TEXT NOT NULL,
        push_name TEXT,
        text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        decided_at INTEGER,
        decided_by TEXT
    )
`)

const stmtInsert = db.prepare(`
    INSERT INTO requests (id, jid, phone, chat_jid, push_name, text, status, created_at, decided_at, decided_by)
    VALUES (@id, @jid, @phone, @chatJid, @pushName, @text, @status, @createdAt, @decidedAt, @decidedBy)
`)
const stmtUpdateDecision = db.prepare(`
    UPDATE requests SET status = ?, decided_at = ?, decided_by = ? WHERE id = ?
`)
const stmtDelete = db.prepare(`DELETE FROM requests WHERE id = ?`)
const stmtLoadAll = db.prepare(`SELECT * FROM requests`)

const requestsCache = new Map()

function toPublic(row) {
  if (!row) return null
  return {
    id: row.id,
    jid: row.jid,
    phone: row.phone,
    chatJid: row.chat_jid,
    pushName: row.push_name,
    text: row.text,
    status: row.status,
    createdAt: row.created_at,
    decidedAt: row.decided_at,
    decidedBy: row.decided_by
  }
}

function toRow(request) {
  return {
    id: request.id,
    jid: request.jid,
    phone: request.phone,
    chatJid: request.chatJid,
    pushName: request.pushName,
    text: request.text,
    status: request.status,
    createdAt: request.createdAt,
    decidedAt: request.decidedAt,
    decidedBy: request.decidedBy
  }
}

for (const row of stmtLoadAll.all()) {
  requestsCache.set(row.id, toPublic(row))
}

function genId() {
  return `req_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`
}

export function createRequest({ jid, chatJid, pushName, phone, text }) {
  const id = genId()
  const request = {
    id,
    jid,
    phone: phone || String(jid || '').split('@')[0],
    chatJid: chatJid || jid,
    pushName: pushName || String(jid || '').split('@')[0],
    text: String(text || '').trim(),
    status: 'pending',
    createdAt: Date.now(),
    decidedAt: null,
    decidedBy: null
  }

  stmtInsert.run(toRow(request))
  requestsCache.set(id, request)
  return request
}

export function getRequest(id) {
  return requestsCache.get(id) || null
}

export function listRequests({ status } = {}) {
  let out = [...requestsCache.values()]
  if (status) out = out.filter((r) => r.status === status)
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

export function listRequestsByJid(jid) {
  return [...requestsCache.values()]
    .filter((r) => r.jid === jid)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function decideRequest(id, status, decidedBy = 'owner') {
  if (!['accepted', 'rejected'].includes(status)) return null
  const request = requestsCache.get(id)
  if (!request) return null

  const decidedAt = Date.now()
  stmtUpdateDecision.run(status, decidedAt, decidedBy, id)

  request.status = status
  request.decidedAt = decidedAt
  request.decidedBy = decidedBy

  return request
}

export function deleteRequest(id) {
  if (!requestsCache.has(id)) return false
  stmtDelete.run(id)
  requestsCache.delete(id)
  return true
}

export function countByStatus() {
  const all = [...requestsCache.values()]
  return {
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    accepted: all.filter((r) => r.status === 'accepted').length,
    rejected: all.filter((r) => r.status === 'rejected').length
  }
}
