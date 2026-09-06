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
// plugins/owner/ban.js

import { banUser, parseDurationToMs } from '../../db/moderationStore.js'
import { resolveTargetJid } from '../../lib/moderationUtils.js'

export default {
  command: 'ban',
  alias: [],
  category: 'owner',
  description: 'Ban user dari bot (khusus owner). Contoh: .ban @user 10w',
  help: '`(tag/reply)` `[durasi]`',
  onlyOwner: true,

  async execute(m, { args }) {
    const targetJid = resolveTargetJid(m, args)
    if (!targetJid) {
      return m.reply(
        '⚠️ Tag user, reply pesannya, atau sertakan nomornya.\n\n' +
        'Contoh:\n' +
        '`.ban @user 10w`\n' +
        '`.ban 62812xxxxxxx permanent`'
      )
    }

    const targetNumber = targetJid.split('@')[0]

    let durationMs = null
    const durationArg = args.find((a) => !a.startsWith('@') && !/^\d+$/.test(a))
    if (durationArg && !/^perm(anent)?$/i.test(durationArg)) {
      durationMs = parseDurationToMs(durationArg)
      if (durationMs === null) {
        return m.reply(`⚠️ Format durasi "${durationArg}" tidak valid. Gunakan contoh: 10d, 3w, 6m, 1y atau "permanent".`)
      }
    }

    const banEntry = banUser(targetJid, durationMs, 'owner')
    const expiryText = banEntry.expiresAt
      ? new Date(banEntry.expiresAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })
      : 'selamanya'

    return m.reply({
      text: `✅ @${targetNumber} telah diban dari bot hingga *${expiryText}*.`,
      mentions: [targetJid]
    })
  }
}
