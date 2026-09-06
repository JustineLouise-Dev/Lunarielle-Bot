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
// plugins/owner/listrespon.js

import { listAddrespon } from '../../db/addresponStore.js'

const TYPE_LABEL = {
  text: 'Teks',
  image: 'Gambar',
  sticker: 'Stiker',
  video: 'Video',
  audio: 'Audio (VN)',
  document: 'Dokumen'
}

export default {
  command: 'listrespon',
  alias: ['listresponse', 'listautorespon'],
  category: 'owner',
  description: 'Melihat daftar semua trigger auto-respon (fitur .addrespon) beserta semua respon di dalamnya (khusus owner).',
  onlyOwner: true,

  async execute(m) {
    const triggers = listAddrespon()

    if (!triggers.length) {
      return m.reply('ℹ️ Belum ada auto-respon yang tersimpan.\n\nGunakan `.addrespon <trigger>` (dengan reply pesan) untuk menambahkan.')
    }

    const totalRespon = triggers.reduce((sum, t) => sum + t.items.length, 0)

    const blocks = triggers.map((t) => {
      const itemLines = t.items.map((item, i) => {
        const label = TYPE_LABEL[item.type] || item.type
        const preview = item.type === 'text' && item.text ? ` — "${item.text.slice(0, 40)}${item.text.length > 40 ? '…' : ''}"` : ''
        return `   ${i + 1}. ${label}${preview}`
      })
      return `🔑 *${t.trigger}* (${t.items.length} respon)\n${itemLines.join('\n')}`
    })

    return m.reply(
      `🗂️ *Daftar Auto-Respon* (${triggers.length} trigger, ${totalRespon} respon)\n\n` +
      `${blocks.join('\n\n')}\n\n` +
      `Hapus semua respon trigger: \`.delrespon <trigger>\`\n` +
      `Hapus satu respon saja: \`.delrespon <trigger>|<nomor>\``
    )
  }
}
