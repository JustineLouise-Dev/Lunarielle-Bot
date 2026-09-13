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
// db/rawMessage.js

import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('raw_messages.json', 'msgId')

function toResult(row) {
  if (!row) return null
  return {
    meta: row,
    raw: row.raw ?? null,
    nodes: row.nodes ?? null,
    attributes: row.attributes ?? null,
    chatJid: row.chat,
    orderNumber: row.msgId
  }
}

export function saveRawMessage(m) {
  if (!m?.id) return null

  const row = {
    msgId: m.id,
    chat: m.chat || 'unknown',
    sender: m.sender || 'unknown',
    pushName: m.pushName || null,
    type: m.type || 'unknown',
    timestamp: Math.floor(Date.now() / 1000),
    isGroup: !!m.isGroup,
    isFromMe: !!m.isFromMe,
    prefix: m.prefix ?? null,
    command: m.command ?? null,
    text: m.text ?? null,
    isMedia: !!m.isMedia,
    mediaType: m.mediaType ?? null,
    deviceId: m.deviceId ?? 0,
    raw: m.raw ?? null
  }

  store.set(row.msgId, row)
  return row
}

export function getMessageByOrder(orderNumber) {
  return toResult(store.get(orderNumber))
}

export function getRawMessageById(msgId) {
  return toResult(store.get(msgId))
}

export function getDeviceIdByMsgId(msgId) {
  if (!msgId) return 0
  return store.get(msgId)?.deviceId ?? 0
}

export function getMessagesByJid(jid, limit = 1000) {
  return store.all()
    .filter(r => r.chat === jid)
    .slice(-limit)
}

export function getMessagesByChatWithRaw(jid, limit = 100) {
  return getMessagesByJid(jid, limit).map(row => ({ meta: row, raw: row.raw, nodes: null }))
}

export function getMessagesBySenderWithRaw(jid, senderJid, limit = 100) {
  return store.all()
    .filter(r => r.chat === jid && r.sender === senderJid)
    .slice(-limit)
    .map(row => ({ meta: row, raw: row.raw, nodes: null, attributes: null }))
}

export function getTopActive(jid, limit = 10) {
  const counts = new Map()
  for (const r of store.all()) {
    if (r.chat !== jid) continue
    counts.set(r.sender, (counts.get(r.sender) || 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([sender_jid, total]) => ({ sender_jid, total }))
}

export function getTotalMessagesPerSender(jid) {
  return getTopActive(jid, Infinity)
}

export function getLastActivePerSender(jid) {
  const lastSeen = new Map()
  for (const r of store.all()) {
    if (r.chat !== jid) continue
    const prev = lastSeen.get(r.sender)
    if (!prev || r.timestamp > prev) lastSeen.set(r.sender, r.timestamp)
  }
  return [...lastSeen.entries()].map(([sender_jid, last_active]) => ({ sender_jid, last_active }))
}

export function pruneMessages(days = 30) {
  const cutoff = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60
  let removed = 0
  for (const row of store.all()) {
    if (row.timestamp <= cutoff) {
      store.delete(row.msgId)
      removed++
    }
  }
  return removed
}

export function getRichMessages(scope = 'all') {
  return store.all()
    .filter(r => r.type === 'botForwardedMessage')
    .filter(r => {
      if (scope === 'group') return r.isGroup
      if (scope === 'private') return !r.isGroup
      return true
    })
    .map(r => ({ jid: r.chat, msg_id: r.msgId, is_group: r.isGroup ? 1 : 0 }))
}

export function recordSentRichMessage(sock, chatJid, sendResult) {
  const msgId = sendResult?.id ?? sendResult?.key?.id
  if (!chatJid || !msgId) return null

  const meJid = sock?.user?.id || 'unknown'

  return saveRawMessage({
    raw: sendResult,
    id: msgId,
    chat: chatJid,
    sender: meJid,
    pushName: sock?.user?.name || 'Bot',
    isGroup: chatJid.endsWith('@g.us'),
    isFromMe: true,
    type: 'botForwardedMessage',
    prefix: null,
    command: null,
    text: null,
    isMedia: false,
    mediaType: null,
    deviceId: 0
  })
}

export function deleteRawMessageRecord(msgId) {
  if (!msgId) return
  try {
    store.delete(msgId)
  } catch (err) {
    console.error('[DB] gagal menghapus record raw message:', err?.message || err)
  }
}

export function getAllKnownChatJids() {
  return [...new Set(store.all().map(r => r.chat))]
}

export function optimizeDatabase() {

  console.log('[DB] optimizeDatabase() no-op — store ini berbasis JSON file, bukan SQLite.')
}
