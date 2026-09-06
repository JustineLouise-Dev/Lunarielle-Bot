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
// plugins/group/welcome.js

import { getGroupSetting, setGroupSetting } from '../../db/groupSettings.js'
import { DEFAULT_WELCOME_TEXT } from '../../lib/welcome.js'

export default {
  command: 'welcome',
  category: 'group',
  description: 'Aktif/nonaktifkan pesan sambutan otomatis untuk member baru yang join grup (khusus admin grup).',
  groupOnly: true,
  adminOnly: true,
  typing: true,

  async execute(m, { args }) {
    const sub = (args[0] || '').toLowerCase()

    if (!sub) {
      const current = getGroupSetting(m.chat, 'welcome', false)
      const template = getGroupSetting(m.chat, 'welcomeText', DEFAULT_WELCOME_TEXT)

      return m.reply(
        `👋 Fitur Welcome saat ini: ${current ? '*AKTIF* ✅' : '*NONAKTIF* ❌'}\n\n` +
        `Ketik \`${m.prefix}welcome on\` untuk mengaktifkan, atau \`${m.prefix}welcome off\` untuk menonaktifkan.\n` +
        `Ketik \`${m.prefix}setwelcome <teks>\` untuk mengubah teks sambutan.\n\n` +
        `📄 Teks saat ini:\n${template}\n\n` +
        `Placeholder yang bisa dipakai:\n` +
        `• $subject / $group — nama grup\n` +
        `• $user / $mention — sebutan (mention) member baru\n` +
        `• $desc / $description — deskripsi singkat grup\n` +
        `• $members / $count — jumlah member saat ini`
      )
    }

    if (sub !== 'on' && sub !== 'off') {
      return m.reply(`⚠️ Gunakan \`${m.prefix}welcome on\` atau \`${m.prefix}welcome off\`.`)
    }

    const enable = sub === 'on'
    setGroupSetting(m.chat, 'welcome', enable)

    await m.reply(
      enable
        ? '✅ Fitur Welcome *diaktifkan*. Member baru yang join akan otomatis disambut.'
        : '✅ Fitur Welcome *dinonaktifkan*.'
    )
  }
}
