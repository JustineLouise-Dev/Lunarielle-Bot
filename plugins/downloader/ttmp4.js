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
// plugins/downloader/ttmp4.js

import {
  isTiktokUrl,
  getTiktokData,
  fetchBuffer,
  capVideoResolution,
  formatCount,
  formatDuration,
  truncate
} from '../../lib/tiktok.js'
import { sendVideoWithBadge } from '../../lib/mediaWithBadge.js'

function buildCaption(meta) {
  return (
    `🎬 *${truncate(meta.title, 150)}*\n\n` +
    `👤 Creator  : ${meta.author}${meta.authorUsername ? ` (${meta.authorUsername})` : ''}\n` +
    `❤️ Like     : ${formatCount(meta.likes)}\n` +
    `💬 Komentar : ${formatCount(meta.comments)}\n` +
    `🔁 Share    : ${formatCount(meta.shares)}\n` +
    `👁️ Views    : ${formatCount(meta.views)}\n` +
    `⏱️ Durasi   : ${formatDuration(meta.durationSeconds)}`
  )
}

export default {
  command: 'ttmp4',
  alias: ['tiktokvideo', 'tiktokdl'],
  category: 'downloader',
  description: 'Download video TikTok tanpa watermark via url.\n\n' +
    '*Format Penggunaan:*\n> `.ttmp4 <url>`',
  help: '<url>',
  typing: true,
  wait: true,

  async execute(m, { sock, args }) {

    const skipThumbnail = args.includes('--fromtt')
    const url = (args.find((a) => isTiktokUrl(a)) || args[0] || '').trim()

    if (!url || !isTiktokUrl(url)) {
      return m.reply(
        '⚠️ Masukkan url TikTok yang valid.\n' +
        'Contoh: `.ttmp4 https://vt.tiktok.com/xxxxxxx`'
      )
    }

    let meta
    try {
      meta = await getTiktokData(url)
    } catch (e) {
      console.error('[TTMP4 ERROR] Gagal mengambil data TikTok:', e)
      return m.reply('⚠️ Gagal mengambil data video. Pastikan url valid dan videonya tidak private/dihapus.')
    }

    if (!meta.videoUrl) {
      return m.reply('⚠️ Video tidak ditemukan atau tidak bisa diunduh (mungkin private/dihapus).')
    }

    if (!skipThumbnail && meta.cover) {

      const coverBuffer = await fetchBuffer(meta.cover).catch((e) => {
        console.error('[TTMP4] Gagal download cover:', e.message || e)
        return null
      })

      if (coverBuffer) {
        await sock.message.send(
          m.chat,
          { type: 'image', media: coverBuffer, mimetype: 'image/jpeg', caption: buildCaption(meta) },
          { quote: m.raw }
        ).catch((e) => console.error('[TTMP4] Gagal kirim thumbnail:', e))
      }
    }

    try {

      const rawBuffer = await fetchBuffer(meta.videoUrl)
      const buffer = await capVideoResolution(rawBuffer, 1080)
      await sendVideoWithBadge(sock, m, buffer, {
        caption: `✅ *${truncate(meta.title, 150)}*\n📺 Resolusi: HD (maks 1080p)`
      })
    } catch (e) {
      console.error('[TTMP4 ERROR] Gagal download/kirim video:', e)
      m.reply('⚠️ Gagal mengunduh atau mengirim video. Coba lagi nanti.')
    }
  }
}
