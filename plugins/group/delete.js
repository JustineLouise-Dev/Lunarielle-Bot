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

import { isOwnerSender, isSenderAdmin, isBotAdmin } from '../../lib/permissions.js'

export default {
  command: 'delete',
  alias: ['del', 'd'],
  category: 'group',
  description: 'Menghapus pesan yang di-reply (admin grup di grup, siapa saja di private chat untuk pesan bot sendiri).',
  typing: true,

  async execute(m, { conn }) {
    const quoted = m.quoted

    if (!quoted) {
      return m.reply(`⚠️ Reply pesan yang mau dihapus, lalu ketik \`${m.prefix}${m.command}\`.`)
    }

    if (m.isGroup && !isOwnerSender(m)) {
      const senderIsAdmin = await isSenderAdmin(m, conn)

      if (!senderIsAdmin) {
        return m.reply('❌ Perintah ini khusus admin grup.')
      }

      const botIsAdmin = await isBotAdmin(m, conn)

      if (!botIsAdmin) {
        return m.reply('❌ Bot harus menjadi admin dulu supaya bisa menghapus pesan orang lain di grup ini.')
      }
    }

    if (!m.isGroup && !quoted.key.fromMe) {
      return m.reply('⚠️ Di private chat, bot hanya bisa menghapus pesannya sendiri untuk semua orang.')
    }

    try {
      await conn.sendMessage(m.chat, { delete: quoted.key })
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
