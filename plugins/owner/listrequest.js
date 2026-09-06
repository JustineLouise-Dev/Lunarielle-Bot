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
// plugins/owner/listrequest.js

import { listRequests } from '../../db/requestStore.js'
import { DIVIDER, header, footer, STATUS_BADGE, listItem, formatDateID } from '../../lib/messageStyle.js'

export default {
  command: 'listrequest',
  alias: [],
  category: 'owner',
  description: 'Lihat daftar semua request fitur yang masuk dari user (khusus owner).',
  onlyOwner: true,

  async execute(m, { config }) {
    const requests = listRequests()

    if (!requests.length) {
      return m.reply('📭 Belum ada request fitur yang masuk.')
    }

    const lines = requests.map((r, i) =>
      listItem(i + 1, STATUS_BADGE[r.status] || r.status, [
        `👤 @${r.phone || r.jid.split('@')[0]}`,
        `📝 ${r.text}`,
        `🆔 ${r.id}  ·  🕒 ${formatDateID(r.createdAt)}`
      ])
    )

    return m.reply({
      text:
        `${header('Semua Request Fitur')}\n` +
        `${DIVIDER}\n\n` +
        `Total: ${requests.length} request\n\n` +
        lines.join('\n\n') +
        `\n\n${DIVIDER}\n` +
        footer(config.botName || config.ownerName),
      mentions: requests.map((r) => r.jid)
    })
  }
}
