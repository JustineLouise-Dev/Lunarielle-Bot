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
// plugins/owner/unban.js

import { unbanUser } from '../../db/moderationStore.js'
import { resolveTargetJid } from '../../lib/moderationUtils.js'

export default {
  command: 'unban',
  alias: [],
  category: 'owner',
  description: 'Unban user dari bot (khusus owner). Contoh: .unban @user',
  help: '`(tag/reply)`',
  onlyOwner: true,

  async execute(m, { args }) {
    const targetJid = resolveTargetJid(m, args)
    if (!targetJid) {
      return m.reply('⚠️ Tag user, reply pesannya, atau sertakan nomornya.\n\nContoh:\n`.unban @user`')
    }

    const targetNumber = targetJid.split('@')[0]

    const unbanned = unbanUser(targetJid)
    if (!unbanned) {
      return m.reply({ text: `⚠️ @${targetNumber} tidak sedang diban.`, mentions: [targetJid] })
    }
    return m.reply({ text: `✅ @${targetNumber} berhasil diunban.`, mentions: [targetJid] })
  }
}
