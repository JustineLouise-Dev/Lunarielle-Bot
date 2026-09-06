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
// lib/addresponHandler.js

import { findMatchingAddrespon, getAddresponMediaBuffer } from '../db/addresponStore.js'
import { sendAudioWithBadge } from './mediaWithBadge.js'
import { sleep, jidDigits } from './utils.js'

function normalizeIncomingMentionText(m, text) {
  const mentioned = m.mentionedJid || []
  if (!mentioned.length || !text.includes('@')) return text

  let mentionIdx = 0
  return text.replace(/@\S+/g, (token) => {
    const jid = mentioned[mentionIdx]
    mentionIdx += 1
    if (!jid) return token
    const digits = jidDigits(jid)
    return digits ? `@${digits}` : token
  })
}

const DELAY_BETWEEN_ITEMS_MS = 700

async function sendOneItem({ sock, m, item }) {
  if (item.type === 'text') {
    return m.reply(item.text || '')
  }

  const mediaBuffer = getAddresponMediaBuffer(item)
  if (!mediaBuffer) {
    return m.reply('⚠️ Salah satu auto-respon untuk trigger ini rusak (file media hilang). Hubungi owner untuk mengatur ulang.')
  }

  switch (item.type) {
    case 'image':
      return sock.message.send(
        m.chat,
        { type: 'image', media: mediaBuffer, mimetype: item.mimetype || 'image/jpeg', caption: item.text || undefined },
        { quote: m.raw }
      )

    case 'sticker':
      return sock.message.send(
        m.chat,
        { type: 'sticker', media: mediaBuffer, mimetype: item.mimetype || 'image/webp' },
        { quote: m.raw }
      )

    case 'video':
      return sock.message.send(
        m.chat,
        { type: 'video', media: mediaBuffer, mimetype: item.mimetype || 'video/mp4', caption: item.text || undefined },
        { quote: m.raw }
      )

    case 'document':
      return sock.message.send(
        m.chat,
        { type: 'document', media: mediaBuffer, mimetype: item.mimetype || 'application/octet-stream', fileName: item.text || 'file' },
        { quote: m.raw }
      )

    case 'audio':
      return sendAudioWithBadge(sock, m, mediaBuffer, { ptt: true })

    default:
      return null
  }
}

export async function handleAddrespon(m, { sock }) {
  if (!m?.chat) return false
  if (m.isFromMe) return false
  if (!m.text) return false

  const normalizedText = normalizeIncomingMentionText(m, m.text)
  const entry = findMatchingAddrespon(normalizedText)
  if (!entry || !entry.items?.length) return false

  try {
    for (let i = 0; i < entry.items.length; i++) {
      await sendOneItem({ sock, m, item: entry.items[i] })
      if (i < entry.items.length - 1) {
        await sleep(DELAY_BETWEEN_ITEMS_MS)
      }
    }
    return true
  } catch (e) {
    console.error('[ADDRESPON ERROR] Gagal mengirim auto-respon:', e)
    return true
  }
}
