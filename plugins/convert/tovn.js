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
// plugins/konvert/tovn.js

export default {
  command: 'tovn',
  alias: ['tovoice', 'vn'],
  category: 'convert',
  description: 'Mengubah audio, video, atau document menjadi voice note.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Reply audio, video, atau document lalu ketik:`\n> .tovn',
  help: '`(reply)`',
  typing: true,
  wait: true,

  async execute(m, { sock }) {
    if (!m.quoted) {
      return m.reply('Balas audio, video, atau dokumen audio yang ingin diubah menjadi voice note.')
    }

    const mime = m.quoted.mime || ''
    const validMime = /^(audio|video)\/|application\/(octet-stream|pdf|msword|vnd\.|x-)/

    if (!validMime.test(mime)) {
      return m.reply(`Format tidak didukung: ${mime || 'unknown'}`)
    }

    try {
      const buffer = await m.quoted.download()

      if (!buffer || buffer.length < 1024) {
        return m.reply('Download gagal atau file terlalu kecil.')
      }

      await sock.sendVoiceNote(m.chat, buffer, { quote: m })
    } catch (e) {
      console.error('[TOVN] error:', e)
      m.reply('Gagal mengonversi media menjadi voice note.')
    }
  }
}
