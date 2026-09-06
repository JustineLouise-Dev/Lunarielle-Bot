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
// plugins/downloader/play.js

import {
  searchYoutube,
  getYoutubeMeta,
  downloadAudioBuffer,
  fetchThumbnailBuffer,
  formatCount,
  formatDuration,
  truncate
} from '../../lib/youtube.js'
import { sendAudioWithBadge } from '../../lib/mediaWithBadge.js'

function buildCaption(meta, query) {
  return (
    `🔎 Hasil pencarian: *${query}*\n\n` +
    `🎵 *${meta.title}*\n\n` +
    `📺 Channel   : ${meta.channel}\n` +
    `👍 Like      : ${formatCount(meta.likes)}\n` +
    `👥 Subscriber: ${formatCount(meta.subscriberCount)}\n` +
    `⏱️ Durasi    : ${formatDuration(meta.durationSeconds)}\n\n` +
    `📝 ${truncate(meta.description, 250)}`
  )
}

export default {
  command: 'play',
  alias: ['ytplay', 'search'],
  category: 'downloader',
  description: 'Cari video di YouTube pakai judul, lalu langsung download & kirim audionya (kualitas terbaik yang didukung WhatsApp).\n\n' +
    '*Format Penggunaan:*\n> `.play <judul>`',
  help: '<judul>',
  typing: true,

  async execute(m, { sock, args }) {
    const query = args.join(' ').trim()

    if (!query) {
      return m.reply('⚠️ Masukkan judul video/audio yang mau dicari.\nContoh: `.play blue youngkai`')
    }

    let found
    try {
      found = await searchYoutube(query)
    } catch (e) {
      console.error('[PLAY ERROR] Gagal mencari di YouTube:', e)
      return m.reply('⚠️ Gagal mencari di YouTube. Coba lagi nanti.')
    }

    if (!found) {
      return m.reply(`⚠️ Tidak ditemukan hasil untuk *${query}*.`)
    }

    const meta = await getYoutubeMeta(found.url).catch((e) => {
      console.error('[PLAY] Gagal ambil metadata:', e)
      return null
    })

    if (!meta) {
      return m.reply('⚠️ Gagal membaca metadata video hasil pencarian.')
    }

    const thumbBuffer = await fetchThumbnailBuffer(meta.thumbnail).catch((e) => {
      console.error('[PLAY] Gagal download thumbnail:', e.message || e)
      return null
    })

    if (thumbBuffer) {
      await sock.message.send(m.chat, {
        type: 'image',
        media: thumbBuffer,
        mimetype: 'image/jpeg',
        caption: buildCaption(meta, query)
      }, { quote: m.raw }).catch((e) => console.error('[PLAY] Gagal kirim thumbnail:', e))
    }

    try {

      const buffer = await downloadAudioBuffer(meta.url)
      await sendAudioWithBadge(sock, m, buffer)
    } catch (e) {
      console.error('[PLAY ERROR] Gagal download/kirim audio:', e)
      m.reply('⚠️ Gagal mengunduh atau mengonversi audio. Coba lagi nanti.')
    }
  }
}