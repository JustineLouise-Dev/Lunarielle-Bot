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
// lib/afkHandler.js

import { getAfk, clearAfk, formatDuration } from '../db/afk.js'

export async function handleAfk(m) {
  if (!m?.chat) return false
  if (m.isFromMe) return false
  if (!m.isGroup) return false

  const sender = m.sender
  let returned = false

  const afkData = getAfk(sender, m.chat)
  if (afkData) {
    clearAfk(sender, m.chat)
    const duration = formatDuration(Date.now() - afkData.since)

    try {

      await m.reply(
        `👋 @${sender.split('@')[0]} telah kembali setelah AFK selama *${duration}*\n` +
          `📝 Alasan sebelumnya: _${afkData.reason}_`
      )
      returned = true
    } catch (e) {
      console.error('[AFK ERROR] Gagal mengirim notifikasi kembali dari AFK:', e?.message || e)
    }
  }

  try {
    const mentionedJids = m.mentionedJid || []
    const quotedSender = m.quoted?.sender
    const allTargets = [...mentionedJids]
    if (quotedSender) allTargets.push(quotedSender)

    const uniqueTargets = [...new Set(allTargets)].filter((jid) => jid && jid !== sender)

    for (const target of uniqueTargets) {
      const targetAfk = getAfk(target, m.chat)
      if (!targetAfk) continue

      const duration = formatDuration(Date.now() - targetAfk.since)
      await m.reply(
        `💤 ${target.split('@')[0]} sedang AFK selama *${duration}*\n` + `📝 Alasan: _${targetAfk.reason}_`
      )
    }
  } catch (e) {
    console.error('[AFK ERROR] Gagal memproses pengecekan mention AFK:', e?.message || e)
  }

  return returned
}
