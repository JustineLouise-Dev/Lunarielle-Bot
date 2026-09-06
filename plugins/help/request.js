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
// plugins/MainMenu/request.js

import { createRequest } from '../../db/requestStore.js'
import { DIVIDER, header, footer } from '../../lib/messageStyle.js'
import { config } from '../../settings.js'

export default {
  command: 'request',
  category: 'MainMenu',
  description: 'Kirim request penambahan fitur ke owner bot.',
  typing: true,

  async execute(m, { args }) {
    const text = args.join(' ').trim()

    if (!text) {
      return m.reply(
        `${header('Request Fitur')}\n\n` +
        `Usulkan fitur baru yang kamu inginkan ada di bot ini.\n\n` +
        `*Cara pakai:*\n` +
        `\`${m.prefix}request <isi permintaan fitur>\`\n\n` +
        `*Contoh:*\n` +
        `\`${m.prefix}request tambahin fitur download video tiktok\`\n\n` +
        `${DIVIDER}\n` +
        footer(config.botName || config.ownerName)
      )
    }

    const request = createRequest({
      jid: m.sender,
      phone: m.contact?.phoneNumber || m.sender.split('@')[0],
      chatJid: m.chat,
      pushName: m.pushName,
      text
    })

    await m.reply(
      `📨 *Request Terkirim*\n` +
      `${DIVIDER}\n\n` +
      `📝  ${request.text}\n` +
      `🆔  ${request.id}\n` +
      `📌  ⏳ Pending\n\n` +
      `Request kamu sudah diteruskan ke owner. Kamu akan diberi tahu\n` +
      `begitu owner menentukan keputusannya.\n\n` +
      `Cek status kapan saja lewat \`${m.prefix}statusrequest\`.\n` +
      `${DIVIDER}\n` +
      footer(config.botName || config.ownerName)
    )
  }
}
