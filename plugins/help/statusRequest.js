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
// plugins/MainMenu/statusrequest.js

import { listRequestsByJid } from '../../db/requestStore.js'
import { DIVIDER, header, footer, STATUS_BADGE, listItem, formatDateID } from '../../lib/messageStyle.js'
import { config } from '../../settings.js'

export default {
  command: 'statusrequest',
  category: 'MainMenu',
  description: 'Lihat status request fitur yang pernah kamu kirim.',
  typing: true,

  async execute(m) {
    const requests = listRequestsByJid(m.sender)

    if (!requests.length) {
      return m.reply(
        `📭 Kamu belum pernah mengirim request fitur.\n\nCoba \`${m.prefix}request <isi>\` untuk mulai.`
      )
    }

    const lines = requests.map((r, i) =>
      listItem(i + 1, STATUS_BADGE[r.status] || r.status, [
        `📝 ${r.text}`,
        `🆔 ${r.id}  ·  🕒 ${formatDateID(r.createdAt)}`
      ])
    )

    await m.reply(
      `${header('Request Fitur Kamu')}\n` +
      `${DIVIDER}\n\n` +
      `Total: ${requests.length} request\n\n` +
      lines.join('\n\n') +
      `\n\n${DIVIDER}\n` +
      footer(config.botName || config.ownerName)
    )
  }
}
