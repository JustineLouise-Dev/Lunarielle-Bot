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
// plugins/tools/sticker.js

import { createSticker } from '../../lib/sticker.js'

const STICKER_PACKNAME = 'Lunarielle'
const STICKER_AUTHOR = 'JustineLouise'

const ANIMATED_EXT_BY_MIME = {
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'image/gif': 'gif'
}

function resolveMediaTarget(m, sock) {
  if (m.quoted?.isMedia) {
    const rawContent = m.quoted.full?.[m.quoted.type]
    return {
      mime: m.quoted.mime,
      seconds: rawContent?.seconds,
      download: () => m.quoted.download()
    }
  }

  if (m.isMedia) {
    const rawContent = m.raw?.message?.[m.type]
    return {
      mime: rawContent?.mimetype || '',
      seconds: rawContent?.seconds,
      download: () => sock.message.downloadBytes(m.raw.message)
    }
  }

  return null
}

export default {
  command: 'sticker',
  alias: ['s', 'stiker'],
  category: 'tools',
  description: 'Membuat stiker dari gambar atau video/GIF pendek. Bisa kirim media langsung dengan caption `.s`, atau reply media dengan `.sticker`.',
  help: '`(reply/kirim media)`',
  typing: true,

  async execute(m, { sock }) {
    const target = resolveMediaTarget(m, sock)

    if (!target || !/^(image|video)\//.test(target.mime || '')) {
      return m.reply('⚠️ Kirim atau reply gambar/video/GIF pendek dengan caption/perintah `.sticker`.')
    }

    const isVideo = /^video\//.test(target.mime) || target.mime === 'image/gif'

    if (isVideo && target.seconds && target.seconds > 10) {
      return m.reply('⚠️ Video/GIF terlalu panjang. Maksimal 10 detik untuk dijadikan stiker.')
    }

    let mediaBuffer
    try {
      mediaBuffer = await target.download()
    } catch (e) {
      console.error('[STICKER ERROR] Gagal mengunduh media:', e)
      return m.reply('⚠️ Gagal mengunduh media. Coba kirim ulang.')
    }

    const sourceExt = isVideo ? ANIMATED_EXT_BY_MIME[target.mime] || 'mp4' : 'jpg'

    try {
      const stickerBuffer = await createSticker({
        buffer: mediaBuffer,
        isAnimated: isVideo,
        sourceExt,
        packname: STICKER_PACKNAME,
        author: STICKER_AUTHOR
      })

      return sock.message.send(
        m.chat,
        { type: 'sticker', media: stickerBuffer, mimetype: 'image/webp' },
        { quote: m.raw }
      )
    } catch (e) {
      console.error('[STICKER ERROR] Gagal membuat stiker:', e)
      return m.reply('⚠️ Gagal membuat stiker. Pastikan format media didukung.')
    }
  }
}