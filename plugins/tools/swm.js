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
// plugins/tools/swm.js

import { replaceStickerMetadata } from '../../lib/sticker.js'

export default {
  command: 'swm',
  alias: [],
  category: 'tools',
  description: 'Mengganti packname stiker yang di-reply.',
  help: '`(reply stiker)` `<teks>`',
  typing: true,

  async execute(m, { sock, args, config }) {
    if (!m.quoted || m.quoted.type !== 'stickerMessage') {
      return m.reply('⚠️ Reply sebuah stiker dengan perintah `.swm <text>` untuk mengganti packname-nya.')
    }

    const text = args.join(' ').trim()
    if (!text) {
      return m.reply('⚠️ Sertakan teks packname baru.\nContoh: `.swm Cinta Damai`')
    }

    let stickerBuffer
    try {
      stickerBuffer = await m.quoted.download()
    } catch (e) {
      console.error('[SWM ERROR] Gagal mengunduh stiker:', e)
      return m.reply('⚠️ Gagal mengunduh stiker. Coba reply ulang.')
    }

    const botName = config.botName || 'Bot'
    const packname = `${text}`
    const author = `©${botName}`

    try {
      const newStickerBuffer = replaceStickerMetadata(stickerBuffer, packname, author)
      return sock.message.send(
        m.chat,
        { type: 'sticker', media: newStickerBuffer, mimetype: 'image/webp' },
        { quote: m.raw }
      )
    } catch (e) {
      console.error('[SWM ERROR] Gagal mengganti metadata stiker:', e)
      return m.reply('⚠️ Gagal mengganti packname stiker. Pastikan pesan yang di-reply benar-benar stiker.')
    }
  }
}
