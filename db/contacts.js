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
// db/contacts.js

import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('contacts.json', 'pn_jid')

function findContactRaw(jid) {
  if (!jid) return null
  if (jid.endsWith('@lid')) {
    return store.all().find(c => c.lid_jid === jid) || null
  }
  return store.get(jid)
}

export function saveOrUpdateContact({ lidJid, pnJid, pushName }) {
  if (!lidJid || !pnJid) return null

  const cleanName = pushName?.trim() || null
  const now = Math.floor(Date.now() / 1000)
  const existing = findContactRaw(lidJid) ?? findContactRaw(pnJid)

  if (!existing) {
    const record = {
      lid_jid: lidJid,
      pn_jid: pnJid,
      push_name: cleanName,
      created_at: now,
      updated_at: now
    }
    store.set(pnJid, record)
    return { created: true, updated: false }
  }

  if (cleanName && cleanName !== existing.push_name) {
    existing.push_name = cleanName
    existing.updated_at = now
    store.set(existing.pn_jid, existing)
    return { created: false, updated: true }
  }

  return { created: false, updated: false }
}

export function getPushNameByJid(jid) {
  return findContactRaw(jid)?.push_name ?? null
}

export function getContactByJid(jid) {
  return findContactRaw(jid)
}
