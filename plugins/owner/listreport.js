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
// plugins/owner/listreport.js

import { listReports, REPORT_CATEGORY_LABEL } from '../../db/reportStore.js'
import { DIVIDER, header, footer, STATUS_BADGE, listItem, formatDateID } from '../../lib/messageStyle.js'

export default {
  command: 'listreport',
  alias: [],
  category: 'owner',
  description: 'Lihat daftar semua laporan yang masuk dari user (khusus owner).',
  onlyOwner: true,

  async execute(m, { config }) {
    const reports = listReports()

    if (!reports.length) {
      return m.reply('📭 Belum ada laporan yang masuk.')
    }

    const lines = reports.map((r, i) =>
      listItem(i + 1, STATUS_BADGE[r.status] || r.status, [
        `📂 ${REPORT_CATEGORY_LABEL[r.category] || r.category}`,
        `👤 @${r.phone || r.jid.split('@')[0]}`,
        `📝 ${r.text}`,
        `🆔 ${r.id}  ·  🕒 ${formatDateID(r.createdAt)}`
      ])
    )

    return m.reply({
      text:
        `${header('Semua Laporan')}\n` +
        `${DIVIDER}\n\n` +
        `Total: ${reports.length} laporan\n\n` +
        lines.join('\n\n') +
        `\n\n${DIVIDER}\n` +
        footer(config.botName || config.ownerName),
      mentions: reports.map((r) => r.jid)
    })
  }
}
