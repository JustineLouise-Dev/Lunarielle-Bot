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
// lib/antiMention.js

import { getGroupSetting } from '../db/groupSettings.js'
import { isBotAdminInGroup, refreshBotAdminStatus } from '../db/groupCache.js'

const MENTION_THRESHOLD = 5

const NOTICE_MASS_MENTION =
  '🚫 Grup ini melarang tag/mention banyak member sekaligus. Pesan tersebut otomatis dihapus.'

export async function handleAntiMention(m, sock) {
  if (!m?.chat || !m.isGroup) return false
  if (m.isFromMe) return false
  if (m.isOwner) return false

  if (!getGroupSetting(m.chat, 'antiMention', false)) return false

  const mentionedJid = m.mentionedJid || []
  const isMassMention = mentionedJid.length >= MENTION_THRESHOLD

  if (!isMassMention) return false

  console.log(
    `[ANTI-MENTION] Terdeteksi di ${m.chat}: massMention=${isMassMention} (jumlah mention=${mentionedJid.length}), pengirim=${m.sender}`
  )

  let botIsAdmin = isBotAdminInGroup(m.chat, sock)

  if (!botIsAdmin) {
    botIsAdmin = await refreshBotAdminStatus(m.chat, sock)
  }

  if (!botIsAdmin) {
    console.error(`[ANTI-MENTION ERROR] Bot bukan admin di ${m.chat}, tidak bisa menghapus pesan mention.`)
    return false
  }

  try {
    await sock.message.send(m.chat, {
      type: 'revoke',
      target: {
        remoteJid: m.chat,
        id: m.id,
        fromMe: false,
        participant: m.sender
      }
    })

    await sock.message.send(m.chat, NOTICE_MASS_MENTION).catch((e) => {
      console.error('[ANTI-MENTION ERROR] Gagal mengirim pesan penjelasan:', e?.message || e)
    })

    return true
  } catch (e) {
    console.error('[ANTI-MENTION ERROR] Gagal menghapus pesan mention:', e?.message || e)
    return false
  }
}
