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
// db/reportStore.js

import crypto from 'crypto'
import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('reports.json', 'id')

export const REPORT_CATEGORIES = ['bug', 'bot', 'user']

export const REPORT_CATEGORY_LABEL = {
  bug: '🐞 Bug Fitur',
  bot: '🤖 Laporan Bot',
  user: '👤 Laporan User'
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

  store.set(id, report)
  return report
}

export function getReport(id) {
  return store.get(id)
}

export function listReports({ status, category } = {}) {
  let out = store.all()
  if (status) out = out.filter((r) => r.status === status)
  if (category) out = out.filter((r) => r.category === category)
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

export function listReportsByJid(jid) {
  return store.all()
    .filter((r) => r.jid === jid)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function decideReport(id, status, decidedBy = 'owner') {
  if (!['accepted', 'rejected'].includes(status)) return null
  const report = store.get(id)
  if (!report) return null

  report.status = status
  report.decidedAt = Date.now()
  report.decidedBy = decidedBy

  store.set(id, report)
  return report
}

export function deleteReport(id) {
  return store.delete(id)
}

export function countByStatus() {
  const all = store.all()
  return {
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    accepted: all.filter((r) => r.status === 'accepted').length,
    rejected: all.filter((r) => r.status === 'rejected').length
  }
}
