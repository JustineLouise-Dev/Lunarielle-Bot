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
// plugins/downloader/tt.js

import { isTiktokUrl, getTiktokData, fetchBuffer, formatCount, formatDuration, truncate } from '../../lib/tiktok.js'
import { buildQuoteContext } from '../../lib/utils.js'
import { config } from '../../settings.js'

function buildBody(meta) {
  return (
    `🎬 *${truncate(meta.title, 150)}*\n\n` +
    `👤 Creator  : ${meta.author}${meta.authorUsername ? ` (${meta.authorUsername})` : ''}\n` +
    `❤️ Like     : ${formatCount(meta.likes)}\n` +
    `💬 Komentar : ${formatCount(meta.comments)}\n` +
    `🔁 Share    : ${formatCount(meta.shares)}\n` +
    `👁️ Views    : ${formatCount(meta.views)}\n` +
    `⏱️ Durasi   : ${formatDuration(meta.durationSeconds)}\n\n` +
    `Mau download yang mana? 👇`
  )
}

export default {
  command: 'tt',
  alias: ['tiktok'],
  category: 'downloader',
  description: 'Ambil info video TikTok via url, lalu pilih mau download video (.ttmp4) atau audio (.ttmp3) lewat tombol.\n\n' +
    '*Format Penggunaan:*\n> `.tt <url>`',
  help: '<url>',
  typing: true,

  async execute(m, { sock, args }) {
    const url = (args.find((a) => isTiktokUrl(a)) || args[0] || '').trim()

    if (!url || !isTiktokUrl(url)) {
      return m.reply(
        '⚠️ Masukkan url TikTok yang valid.\n' +
        'Contoh: `.tt https://vt.tiktok.com/xxxxxxx`'
      )
    }

    let meta
    try {
      meta = await getTiktokData(url)
    } catch (e) {
      console.error('[TT ERROR] Gagal mengambil data TikTok:', e)
      return m.reply('⚠️ Gagal mengambil data video. Pastikan url valid dan videonya tidak private/dihapus.')
    }

    if (!meta.videoUrl && !meta.audioUrl) {
      return m.reply('⚠️ Video/audio tidak ditemukan (mungkin private/dihapus).')
    }

    const prefix = m.prefix

    const buttons = []
    if (meta.videoUrl) {
      buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🎬 Download Video',
          id: `${prefix}ttmp4 ${url} --fromtt`
        })
      })
    }
    if (meta.audioUrl) {
      buttons.push({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
          display_text: '🎧 Download Audio',
          id: `${prefix}ttmp3 ${url} --fromtt`
        })
      })
    }

    const bodyText = buildBody(meta)

    let coverBuffer = null
    if (meta.cover) {
      coverBuffer = await fetchBuffer(meta.cover).catch((e) => {
        console.error('[TT] Gagal download cover:', e.message || e)
        return null
      })
    }

    let imageMessage
    if (coverBuffer) {
      try {
        const up = await sock.message.upload(coverBuffer, { type: 'image', mimetype: 'image/jpeg' })
        imageMessage = {
          url: up.url,
          directPath: up.directPath,
          mediaKey: up.mediaKey,
          fileSha256: up.fileSha256,
          fileEncSha256: up.fileEncSha256,
          fileLength: up.fileLength,
          mediaKeyTimestamp: up.mediaKeyTimestamp,
          mimetype: up.mimetype || 'image/jpeg'
        }
      } catch (e) {
        console.error('[TT] Gagal siapkan gambar cover untuk header interaktif:', e)
      }
    }

    try {
      return await m.reply({
        interactiveMessage: {
          header: {
            title: '',
            hasMediaAttachment: !!imageMessage,
            ...(imageMessage ? { imageMessage } : {})
          },
          body: { text: bodyText },
          footer: { text: `✦ Powered by ${config.botName} ✦` },
          nativeFlowMessage: { buttons, messageVersion: 1 },
          contextInfo: buildQuoteContext(m)
        }
      })
    } catch (e) {
      console.error('[TT ERROR] Gagal kirim pesan interaktif, fallback ke pesan biasa:', e)
      try {
        if (coverBuffer) {
          await sock.message.send(
            m.chat,
            { type: 'image', media: coverBuffer, mimetype: 'image/jpeg', caption: bodyText },
            { quote: m.raw }
          )
        } else {
          await m.reply(bodyText)
        }
      } catch (e2) {
        console.error('[TT ERROR] Fallback pesan biasa juga gagal:', e2)
      }
    }
  }
}
