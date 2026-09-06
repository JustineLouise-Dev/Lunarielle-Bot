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
// plugins/group/left.js

import { getGroupSetting, setGroupSetting } from '../../db/groupSettings.js'
import { DEFAULT_LEFT_TEXT } from '../../lib/welcome.js'

export default {
  command: 'left',
  category: 'group',
  description: 'Aktif/nonaktifkan pesan otomatis saat member keluar/dikeluarkan dari grup (khusus admin grup).',
  groupOnly: true,
  adminOnly: true,
  typing: true,

  async execute(m, { args }) {
    const sub = (args[0] || '').toLowerCase()

    if (!sub) {
      const current = getGroupSetting(m.chat, 'left', false)
      const template = getGroupSetting(m.chat, 'leftText', DEFAULT_LEFT_TEXT)

      return m.reply(
        `👋 Fitur Left saat ini: ${current ? '*AKTIF* ✅' : '*NONAKTIF* ❌'}\n\n` +
        `Ketik \`${m.prefix}left on\` untuk mengaktifkan, atau \`${m.prefix}left off\` untuk menonaktifkan.\n` +
        `Ketik \`${m.prefix}setleft <teks>\` untuk mengubah teks perpisahan.\n\n` +
        `📄 Teks saat ini:\n${template}\n\n` +
        `Placeholder yang bisa dipakai:\n` +
        `• $subject / $group — nama grup\n` +
        `• $user / $mention — sebutan (mention) member yang keluar\n` +
        `• $desc / $description — deskripsi singkat grup\n` +
        `• $members / $count — jumlah member saat ini`
      )
    }

    if (sub !== 'on' && sub !== 'off') {
      return m.reply(`⚠️ Gunakan \`${m.prefix}left on\` atau \`${m.prefix}left off\`.`)
    }

    const enable = sub === 'on'
    setGroupSetting(m.chat, 'left', enable)

    await m.reply(
      enable
        ? '✅ Fitur Left *diaktifkan*. Pesan perpisahan akan otomatis dikirim saat member keluar/dikeluarkan.'
        : '✅ Fitur Left *dinonaktifkan*.'
    )
  }
}
