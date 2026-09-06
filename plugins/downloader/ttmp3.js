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
// plugins/downloader/ttmp3.js

import { isTiktokUrl, getTiktokData, fetchBuffer, formatCount, formatDuration, truncate } from '../../lib/tiktok.js'
import { sendAudioWithBadge } from '../../lib/mediaWithBadge.js'

function buildCaption(meta) {
  return (
    `🎧 *${truncate(meta.title, 150)}*\n\n` +
    `👤 Creator  : ${meta.author}${meta.authorUsername ? ` (${meta.authorUsername})` : ''}\n` +
    `❤️ Like     : ${formatCount(meta.likes)}\n` +
    `💬 Komentar : ${formatCount(meta.comments)}\n` +
    `🔁 Share    : ${formatCount(meta.shares)}\n` +
    `👁️ Views    : ${formatCount(meta.views)}\n` +
    `⏱️ Durasi   : ${formatDuration(meta.durationSeconds)}`
  )
}

export default {
  command: 'ttmp3',
  alias: ['tiktokaudio', 'tiktokmp3'],
  category: 'downloader',
  description: 'Download audio/musik dari video TikTok via url.\n\n' +
    '*Format Penggunaan:*\n> `.ttmp3 <url>`',
  help: '<url>',
  typing: true,
  wait: true,

  async execute(m, { sock, args }) {

    const skipThumbnail = args.includes('--fromtt')
    const url = (args.find((a) => isTiktokUrl(a)) || args[0] || '').trim()

    if (!url || !isTiktokUrl(url)) {
      return m.reply(
        '⚠️ Masukkan url TikTok yang valid.\n' +
        'Contoh: `.ttmp3 https://vt.tiktok.com/xxxxxxx`'
      )
    }

    let meta
    try {
      meta = await getTiktokData(url)
    } catch (e) {
      console.error('[TTMP3 ERROR] Gagal mengambil data TikTok:', e)
      return m.reply('⚠️ Gagal mengambil data video. Pastikan url valid dan videonya tidak private/dihapus.')
    }

    if (!meta.audioUrl) {
      return m.reply('⚠️ Audio tidak ditemukan untuk video ini (mungkin private/dihapus).')
    }

    if (!skipThumbnail && meta.cover) {

      const coverBuffer = await fetchBuffer(meta.cover).catch((e) => {
        console.error('[TTMP3] Gagal download cover:', e.message || e)
        return null
      })

      if (coverBuffer) {
        await sock.message.send(
          m.chat,
          { type: 'image', media: coverBuffer, mimetype: 'image/jpeg', caption: buildCaption(meta) },
          { quote: m.raw }
        ).catch((e) => console.error('[TTMP3] Gagal kirim thumbnail:', e))
      }
    }

    try {
      const buffer = await fetchBuffer(meta.audioUrl)

      await sendAudioWithBadge(sock, m, buffer)
    } catch (e) {
      console.error('[TTMP3 ERROR] Gagal download/kirim audio:', e)
      m.reply('⚠️ Gagal mengunduh atau mengirim audio. Coba lagi nanti.')
    }
  }
}
