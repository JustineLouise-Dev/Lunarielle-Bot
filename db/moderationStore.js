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

import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('bans.json', 'jid')

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
  for (const entry of store.all()) {
    if (isBanExpired(entry)) {
      store.delete(entry.jid)
    }
  }
}

export function listActiveBans() {
  cleanupExpiredBans()
  return store.all()
}

export function getBanInfo(jid) {
  const normalized = normalizeNumberToJid(jid)
  if (!normalized) return null
  cleanupExpiredBans()
  return store.get(normalized)
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

  store.set(normalized, entry)
  return entry
}

export function unbanUser(jid) {
  const normalized = normalizeNumberToJid(jid)
  if (!normalized) return false
  if (!store.get(normalized)) return false

  store.delete(normalized)
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
