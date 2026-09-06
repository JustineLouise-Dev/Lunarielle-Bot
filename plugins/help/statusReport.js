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
// plugins/MainMenu/statusreport.js

import { listReportsByJid, REPORT_CATEGORY_LABEL } from '../../db/reportStore.js'
import { DIVIDER, header, footer, STATUS_BADGE, listItem, formatDateID } from '../../lib/messageStyle.js'
import { config } from '../../settings.js'

export default {
  command: 'statusreport',
  category: 'MainMenu',
  description: 'Lihat status laporan yang pernah kamu kirim.',
  typing: true,

  async execute(m) {
    const reports = listReportsByJid(m.sender)

    if (!reports.length) {
      return m.reply(
        `📭 Kamu belum pernah mengirim laporan.\n\nCoba \`${m.prefix}report <kategori> <isi>\` untuk mulai.`
      )
    }

    const lines = reports.map((r, i) =>
      listItem(i + 1, STATUS_BADGE[r.status] || r.status, [
        `📂 ${REPORT_CATEGORY_LABEL[r.category] || r.category}`,
        `📝 ${r.text}`,
        `🆔 ${r.id}  ·  🕒 ${formatDateID(r.createdAt)}`
      ])
    )

    await m.reply(
      `${header('Laporan Kamu')}\n` +
      `${DIVIDER}\n\n` +
      `Total: ${reports.length} laporan\n\n` +
      lines.join('\n\n') +
      `\n\n${DIVIDER}\n` +
      footer(config.botName || config.ownerName)
    )
  }
}
