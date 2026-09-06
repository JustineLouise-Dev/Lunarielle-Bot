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
// plugins/downloader/ytmp3.js

import {
  isYoutubeUrl,
  getYoutubeMeta,
  downloadAudioBuffer,
  fetchThumbnailBuffer,
  formatCount,
  formatDuration,
  truncate
} from '../../lib/youtube.js'
import { sendAudioWithBadge } from '../../lib/mediaWithBadge.js'

function buildCaption(meta) {
  return (
    `🎧 *${meta.title}*\n\n` +
    `📺 Channel   : ${meta.channel}\n` +
    `👍 Like      : ${formatCount(meta.likes)}\n` +
    `👥 Subscriber: ${formatCount(meta.subscriberCount)}\n` +
    `⏱️ Durasi    : ${formatDuration(meta.durationSeconds)}\n\n` +
    `📝 ${truncate(meta.description, 250)}`
  )
}

export default {
  command: 'ytmp3',
  alias: ['ytaudio', 'ytdlaudio'],
  category: 'downloader',
  description: 'Download audio dari YouTube via url dengan kualitas audio tertinggi.\n\n' +
    '*Format Penggunaan:*\n> `.ytmp3 <url>`',
  help: '<url>',
  typing: true,
  wait: true,

  async execute(m, { sock, args }) {

    const skipThumbnail = args.includes('--fromplay')
    const url = (args.find((a) => isYoutubeUrl(a)) || args[0] || '').trim()

    if (!url || !isYoutubeUrl(url)) {
      return m.reply(
        '⚠️ Masukkan url video YouTube yang valid.\n' +
        'Contoh: `.ytmp3 https://youtube.com/watch?v=xxxxxxx`'
      )
    }

    const meta = await getYoutubeMeta(url).catch((e) => {
      console.error('[YTMP3] Gagal ambil metadata:', e)
      return null
    })

    if (!skipThumbnail && meta) {

      const thumbBuffer = await fetchThumbnailBuffer(meta.thumbnail).catch((e) => {
        console.error('[YTMP3] Gagal download thumbnail:', e.message || e)
        return null
      })

      if (thumbBuffer) {
        await sock.message.send(m.chat, {
          type: 'image',
          media: thumbBuffer,
          mimetype: 'image/jpeg',
          caption: buildCaption(meta)
        }, { quote: m.raw }).catch((e) => console.error('[YTMP3] Gagal kirim thumbnail:', e))
      }
    }

    try {
      const buffer = await downloadAudioBuffer(url)

      await sendAudioWithBadge(sock, m, buffer)
    } catch (e) {
      console.error('[YTMP3 ERROR] Gagal download/konversi/kirim audio:', e)
      m.reply('⚠️ Gagal mengunduh atau mengonversi audio. Coba lagi nanti.')
    }
  }
}