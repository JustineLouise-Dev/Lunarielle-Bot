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
// plugins/tools/smeme.js

import { addMemeText } from '../../lib/meme.js'
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
      isAnimatedSticker: m.quoted.type === 'stickerMessage' && !!rawContent?.isAnimated,
      download: () => m.quoted.download()
    }
  }

  if (m.isMedia) {
    const rawContent = m.raw?.message?.[m.type]
    return {
      mime: rawContent?.mimetype || '',
      seconds: rawContent?.seconds,
      isAnimatedSticker: m.type === 'stickerMessage' && !!rawContent?.isAnimated,
      download: () => sock.message.downloadBytes(m.raw.message)
    }
  }

  return null
}

function parseMemeText(rawInput) {
  const parts = rawInput.split('|').map((s) => s.trim()).filter((s) => s.length > 0)

  if (parts.length >= 2) {
    return { topText: parts[0], bottomText: parts[1] }
  }
  if (parts.length === 1) {
    return { topText: null, bottomText: parts[0] }
  }
  return { topText: null, bottomText: null }
}

export default {
  command: 'smeme',
  alias: ['stickermeme', 'stikermeme'],
  category: 'tools',
  description: 'Membuat stiker meme dari gambar/video/GIF dengan teks kustom.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Kirim/reply gambar, stiker, atau video/GIF pendek lalu ketik:`\n' +
    '> .smeme teks di bawah\n' +
    '> .smeme teks atas|teks bawah',
  help: '`(reply/kirim media)` `<teks>` `[|teks bawah]`',
  typing: true,
  wait: true,

  async execute(m, { sock, args }) {
    const rawInput = args.join(' ').trim()
    if (!rawInput) {
      return m.reply(
        '⚠️ Sertakan teksnya juga ya.\n\n' +
        'Contoh:\n' +
        '`.smeme teks di bawah`\n' +
        '`.smeme teks atas|teks bawah`\n\n' +
        'Kirim/reply gambar, stiker, atau video/GIF pendek bareng command ini.'
      )
    }

    const { topText, bottomText } = parseMemeText(rawInput)
    if (!topText && !bottomText) {
      return m.reply('⚠️ Teksnya tidak boleh kosong.')
    }

    const target = resolveMediaTarget(m, sock)
    if (!target || !/^(image|video)\//.test(target.mime || '')) {
      return m.reply('⚠️ Kirim atau reply gambar, stiker, atau video/GIF pendek dengan perintah `.smeme`.')
    }

    const isVideo = /^video\//.test(target.mime) || target.mime === 'image/gif'
    const isSticker = target.mime === 'image/webp'
    const isAnimatedSticker = isSticker && target.isAnimatedSticker

    if (isVideo && target.seconds && target.seconds > 10) {
      return m.reply('⚠️ Video/GIF terlalu panjang. Maksimal 10 detik untuk dijadikan stiker meme.')
    }

    let mediaBuffer
    try {
      mediaBuffer = await target.download()
    } catch (e) {
      console.error('[SMEME ERROR] Gagal mengunduh media:', e)
      return m.reply('⚠️ Gagal mengunduh media. Coba kirim ulang.')
    }

    const isAnimated = isVideo || isAnimatedSticker
    const sourceExt = isAnimated
      ? (isSticker ? 'webp' : ANIMATED_EXT_BY_MIME[target.mime] || 'mp4')
      : (isSticker ? 'webp' : 'jpg')

    try {
      const memeBuffer = await addMemeText({
        buffer: mediaBuffer,
        isAnimated,
        sourceExt,
        topText,
        bottomText
      })

      const stickerBuffer = await createSticker({
        buffer: memeBuffer,
        isAnimated,
        sourceExt: isAnimated ? (sourceExt === 'webp' ? 'webp' : sourceExt) : 'png',
        packname: STICKER_PACKNAME,
        author: STICKER_AUTHOR
      })

      return sock.message.send(
        m.chat,
        { type: 'sticker', media: stickerBuffer, mimetype: 'image/webp' },
        { quote: m.raw }
      )
    } catch (e) {
      console.error('[SMEME ERROR] Gagal membuat stiker meme:', e)
      return m.reply('⚠️ Gagal membuat stiker meme. Pastikan format media didukung dan coba lagi.')
    }
  }
}
