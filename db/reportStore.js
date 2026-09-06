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
// db/reportStore.js

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const STORE_DIR = path.join(__dirname, '..', 'store')
const dbPath = path.join(STORE_DIR, 'reports.db')

if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true })

const db = new Database(dbPath)

db.pragma('journal_mode = WAL')
db.pragma('synchronous = NORMAL')
db.pragma('wal_autocheckpoint = 1000')
db.pragma('journal_size_limit = 67108864')
db.pragma('cache_size = -8000')
db.pragma('temp_store = MEMORY')
db.pragma('mmap_size = 268435456')

export const REPORT_CATEGORIES = ['bug', 'bot', 'user']

export const REPORT_CATEGORY_LABEL = {
  bug: '🐞 Bug Fitur',
  bot: '🤖 Laporan Bot',
  user: '👤 Laporan User'
}

db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
        id TEXT PRIMARY KEY,
        jid TEXT NOT NULL,
        phone TEXT,
        chat_jid TEXT NOT NULL,
        push_name TEXT,
        category TEXT NOT NULL,
        text TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at INTEGER NOT NULL,
        decided_at INTEGER,
        decided_by TEXT
    )
`)

const stmtInsert = db.prepare(`
    INSERT INTO reports (id, jid, phone, chat_jid, push_name, category, text, status, created_at, decided_at, decided_by)
    VALUES (@id, @jid, @phone, @chatJid, @pushName, @category, @text, @status, @createdAt, @decidedAt, @decidedBy)
`)
const stmtUpdateDecision = db.prepare(`
    UPDATE reports SET status = ?, decided_at = ?, decided_by = ? WHERE id = ?
`)
const stmtDelete = db.prepare(`DELETE FROM reports WHERE id = ?`)
const stmtLoadAll = db.prepare(`SELECT * FROM reports`)

const reportsCache = new Map()

function toPublic(row) {
  if (!row) return null
  return {
    id: row.id,
    jid: row.jid,
    phone: row.phone,
    chatJid: row.chat_jid,
    pushName: row.push_name,
    category: row.category,
    text: row.text,
    status: row.status,
    createdAt: row.created_at,
    decidedAt: row.decided_at,
    decidedBy: row.decided_by
  }
}

function toRow(report) {
  return {
    id: report.id,
    jid: report.jid,
    phone: report.phone,
    chatJid: report.chatJid,
    pushName: report.pushName,
    category: report.category,
    text: report.text,
    status: report.status,
    createdAt: report.createdAt,
    decidedAt: report.decidedAt,
    decidedBy: report.decidedBy
  }
}

for (const row of stmtLoadAll.all()) {
  reportsCache.set(row.id, toPublic(row))
}

function genId() {
  return `rep_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`
}

function normalizeCategory(category) {
  const c = String(category || '').toLowerCase().trim()
  return REPORT_CATEGORIES.includes(c) ? c : 'bug'
}

export function createReport({ jid, chatJid, pushName, phone, text, category }) {
  const id = genId()
  const report = {
    id,
    jid,
    phone: phone || String(jid || '').split('@')[0],
    chatJid: chatJid || jid,
    pushName: pushName || String(jid || '').split('@')[0],
    category: normalizeCategory(category),
    text: String(text || '').trim(),
    status: 'pending',
    createdAt: Date.now(),
    decidedAt: null,
    decidedBy: null
  }

  stmtInsert.run(toRow(report))
  reportsCache.set(id, report)
  return report
}

export function getReport(id) {
  return reportsCache.get(id) || null
}

export function listReports({ status, category } = {}) {
  let out = [...reportsCache.values()]
  if (status) out = out.filter((r) => r.status === status)
  if (category) out = out.filter((r) => r.category === category)
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

export function listReportsByJid(jid) {
  return [...reportsCache.values()]
    .filter((r) => r.jid === jid)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function decideReport(id, status, decidedBy = 'owner') {
  if (!['accepted', 'rejected'].includes(status)) return null
  const report = reportsCache.get(id)
  if (!report) return null

  const decidedAt = Date.now()
  stmtUpdateDecision.run(status, decidedAt, decidedBy, id)

  report.status = status
  report.decidedAt = decidedAt
  report.decidedBy = decidedBy

  return report
}

export function deleteReport(id) {
  if (!reportsCache.has(id)) return false
  stmtDelete.run(id)
  reportsCache.delete(id)
  return true
}

export function countByStatus() {
  const all = [...reportsCache.values()]
  return {
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    accepted: all.filter((r) => r.status === 'accepted').length,
    rejected: all.filter((r) => r.status === 'rejected').length
  }
}
