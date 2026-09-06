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
// plugins/group/delete.js

import { refreshBotAdminStatus } from '../../db/groupCache.js'

export default {
  command: 'delete',
  alias: ['del', 'd'],
  category: 'group',
  description: 'Menghapus pesan yang di-reply (admin grup di grup, siapa saja di private chat untuk pesan bot sendiri).',
  typing: true,

  async execute(m, { sock }) {
    const quoted = m.quoted

    if (!quoted) {
      return m.reply(`⚠️ Reply pesan yang mau dihapus, lalu ketik \`${m.prefix}${m.command}\`.`)
    }

    if (m.isGroup && !m.isOwner) {
      if (!m.isAdmin) {
        return m.reply('❌ Perintah ini khusus admin grup.')
      }

      let botIsAdmin = m.isBotAdmin
      if (!botIsAdmin) {
        botIsAdmin = await refreshBotAdminStatus(m.chat, sock)
      }

      if (!botIsAdmin) {
        return m.reply('❌ Bot harus menjadi admin dulu supaya bisa menghapus pesan orang lain di grup ini.')
      }
    }

    if (!m.isGroup && !quoted.key.fromMe) {
      return m.reply('⚠️ Di private chat, bot hanya bisa menghapus pesannya sendiri untuk semua orang.')
    }

    try {
      await sock.message.send(m.chat, {
        type: 'revoke',
        target: {
          remoteJid: m.chat,
          id: quoted.key.id,
          fromMe: quoted.key.fromMe,
          participant: quoted.key.fromMe ? undefined : quoted.key.participant
        }
      })
    } catch (e) {
      console.error('[DELETE ERROR]', e?.message || e)
      await m.reply(
        '⚠️ Gagal menghapus pesan tersebut.\n' +
        (m.isGroup
          ? 'Pastikan bot masih admin di grup ini.'
          : 'Di private chat, bot hanya bisa menghapus pesannya sendiri untuk semua orang.')
      )
    }
  }
}
