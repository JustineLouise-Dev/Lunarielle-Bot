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
// plugins/tools/brat.js

import { generateBratImage } from '../../lib/brat.js'
import { createSticker } from '../../lib/sticker.js'

const STICKER_PACKNAME = 'Lunarielle'
const STICKER_AUTHOR = 'JustineLouise'

export default {
  command: 'brat',
  alias: [],
  category: 'tools',
  description: 'Membuat stiker bergaya "brat" (album Charli XCX) dari teks.',
  help: '`<teks>`',
  typing: true,
  wait: true,

  async execute(m, { sock, args }) {
    const text = args.join(' ').trim()
    if (!text) {
      return m.reply('⚠️ Sertakan teksnya ya.\n\nContoh: `.brat aku lagi brat summer`')
    }

    try {
      const imageBuffer = await generateBratImage(text)

      const stickerBuffer = await createSticker({
        buffer: imageBuffer,
        isAnimated: false,
        sourceExt: 'png',
        packname: STICKER_PACKNAME,
        author: STICKER_AUTHOR
      })

      return sock.message.send(
        m.chat,
        { type: 'sticker', media: stickerBuffer, mimetype: 'image/webp' },
        { quote: m.raw }
      )
    } catch (e) {
      console.error('[BRAT ERROR] Gagal membuat stiker brat:', e)
      const errText = e?.message === 'Teks terlalu panjang. Maksimal 300 karakter.'
        ? '⚠️ Teksnya kepanjangan. Maksimal 300 karakter ya.'
        : '⚠️ Gagal membuat stiker brat. Coba lagi.'
      return m.reply(errText)
    }
  }
}
