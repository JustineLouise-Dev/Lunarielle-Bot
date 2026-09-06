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
// plugins/group/antimention.js

import { getGroupSetting, setGroupSetting } from '../../db/groupSettings.js'
import { refreshBotAdminStatus } from '../../db/groupCache.js'

export default {
  command: 'antimention',
  category: 'group',
  description: 'Aktif/nonaktifkan penghapusan otomatis pesan tag-all/mention banyak member sekaligus (khusus admin grup).',
  groupOnly: true,
  adminOnly: true,
  typing: true,

  async execute(m, { sock, args }) {
    const sub = (args[0] || '').toLowerCase()

    if (!sub) {
      const current = getGroupSetting(m.chat, 'antiMention', false)
      return m.reply(
        `🛡️ Anti-Mention saat ini: ${current ? '*AKTIF* ✅' : '*NONAKTIF* ❌'}\n\n` +
        `Ketik \`${m.prefix}antimention on\` untuk mengaktifkan, atau \`${m.prefix}antimention off\` untuk menonaktifkan.`
      )
    }

    if (sub !== 'on' && sub !== 'off') {
      return m.reply(`⚠️ Gunakan \`${m.prefix}antimention on\` atau \`${m.prefix}antimention off\`.`)
    }

    const enable = sub === 'on'

    if (enable) {
      const isBotAdminLive = await refreshBotAdminStatus(m.chat, sock)

      if (!isBotAdminLive) {
        return m.reply('❌ Bot harus dijadikan admin dulu supaya bisa menghapus pesan mention/tag-all secara otomatis.')
      }
    }

    setGroupSetting(m.chat, 'antiMention', enable)

    await m.reply(
      enable
        ? '✅ Anti-Mention *diaktifkan*. Pesan yang mention banyak member sekaligus akan otomatis dihapus.'
        : '✅ Anti-Mention *dinonaktifkan*.'
    )
  }
}
