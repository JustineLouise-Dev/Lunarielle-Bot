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
// plugins/MainMenu/report.js
//
// Perintah: .report <kategori> <isi laporan>
// Melaporkan bug fitur, masalah bot, atau user ke owner lewat db/reportStore.js

import { createReport, REPORT_CATEGORY_LABEL } from '../../db/reportStore.js'
import { DIVIDER, header, footer } from '../../lib/messageStyle.js'
import { config } from '../../settings.js'

const CATEGORY_ALIASES = {
  bug: 'bug',
  fitur: 'bug',
  error: 'bug',
  bot: 'bot',
  user: 'user',
  orang: 'user'
}

export default {
  command: 'report',
  category: 'MainMenu',
  description: 'Laporkan bug fitur, bot, atau user ke owner bot.',
  typing: true,

  async execute(m, { args }) {
    const rawFirst = (args[0] || '').toLowerCase()
    const category = CATEGORY_ALIASES[rawFirst]
    const text = (category ? args.slice(1) : args).join(' ').trim()

    if (!category || !text) {
      return m.reply(
        `${header('Laporkan')}\n\n` +
        `Sampaikan bug fitur, masalah pada bot, atau laporan user\n` +
        `ke owner langsung dari sini.\n\n` +
        `*Cara pakai:*\n` +
        `\`${m.prefix}report <kategori> <isi laporan>\`\n\n` +
        `*Kategori:*\n` +
        `🐞  bug   — bug/error pada fitur\n` +
        `🤖  bot   — masalah pada bot\n` +
        `👤  user  — laporan tentang user lain\n\n` +
        `*Contoh:*\n` +
        `\`${m.prefix}report bug fitur sticker error pas kirim gif\`\n` +
        `\`${m.prefix}report user @62812xxxx spam link judi\`\n\n` +
        `${DIVIDER}\n` +
        footer(config.botName || config.ownerName)
      )
    }

    const report = createReport({
      jid: m.sender,
      phone: m.contact?.phoneNumber || m.sender.split('@')[0],
      chatJid: m.chat,
      pushName: m.pushName,
      category,
      text
    })

    await m.reply(
      `🚨 *Laporan Terkirim*\n` +
      `${DIVIDER}\n\n` +
      `📂  ${REPORT_CATEGORY_LABEL[report.category]}\n` +
      `📝  ${report.text}\n` +
      `🆔  ${report.id}\n` +
      `📌  ⏳ Pending\n\n` +
      `Laporan kamu sudah diteruskan ke owner. Kamu akan diberi tahu\n` +
      `begitu owner meninjau laporan ini.\n\n` +
      `Cek status kapan saja lewat \`${m.prefix}statusreport\`.\n` +
      `${DIVIDER}\n` +
      footer(config.botName || config.ownerName)
    )
  }
}
