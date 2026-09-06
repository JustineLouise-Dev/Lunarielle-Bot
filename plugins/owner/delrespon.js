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
// plugins/owner/delrespon.js

import { deleteAddrespon, deleteAddresponItem, getAddrespon } from '../../db/addresponStore.js'

function parseArgs(args) {
  const raw = args.join(' ').trim()
  const pipeSplit = raw.split('|').map((s) => s.trim()).filter(Boolean)

  if (pipeSplit.length >= 2 && /^\d+$/.test(pipeSplit[pipeSplit.length - 1])) {
    const index = parseInt(pipeSplit[pipeSplit.length - 1], 10)
    const trigger = pipeSplit.slice(0, -1).join('|')
    return { trigger, index }
  }

  return { trigger: raw, index: null }
}

export default {
  command: 'delrespon',
  alias: ['delresponse', 'delautorespon'],
  category: 'owner',
  description:
    'Menghapus auto-respon (fitur .addrespon) berdasarkan trigger-nya. ' +
    'Contoh: `.delrespon hai` (hapus SEMUA respon untuk trigger itu) atau `.delrespon hai|2` (hapus respon nomor 2 saja).',
  help: '`<trigger>` `[|nomor]`',
  onlyOwner: true,

  async execute(m, { args }) {
    const { trigger, index } = parseArgs(args)

    if (!trigger) {
      return m.reply(
        '⚠️ Sertakan trigger yang mau dihapus.\n\n' +
        'Contoh:\n' +
        '`.delrespon hai` — hapus SEMUA respon untuk trigger "hai"\n' +
        '`.delrespon hai|2` — hapus respon nomor 2 saja dari trigger "hai"\n\n' +
        'Gunakan `.listrespon` untuk melihat semua trigger & nomor respon yang tersimpan.'
      )
    }

    const existing = getAddrespon(trigger)
    if (!existing) {
      return m.reply(`⚠️ Trigger "*${trigger}*" tidak ditemukan.\n\nGunakan \`.listrespon\` untuk melihat semua trigger yang tersimpan.`)
    }

    if (index === null) {
      deleteAddrespon(trigger)
      return m.reply(`✅ Semua auto-respon (${existing.items.length}) dengan trigger "*${existing.trigger}*" berhasil dihapus.`)
    }

    if (index < 1 || index > existing.items.length) {
      return m.reply(
        `⚠️ Nomor respon tidak valid. Trigger "*${existing.trigger}*" cuma punya *${existing.items.length}* respon.\n` +
        `Gunakan \`.listrespon\` untuk melihat nomornya.`
      )
    }

    const result = deleteAddresponItem(trigger, index)
    if (result === 'deleted-trigger') {
      return m.reply(
        `✅ Respon nomor ${index} dihapus. Itu adalah respon terakhir, jadi trigger "*${existing.trigger}*" ` +
        `ikut terhapus seluruhnya.`
      )
    }
    if (result === 'deleted-item') {
      const sisa = existing.items.length - 1
      return m.reply(`✅ Respon nomor ${index} dari trigger "*${existing.trigger}*" berhasil dihapus. Sisa *${sisa}* respon untuk trigger ini.`)
    }
    return m.reply('⚠️ Gagal menghapus respon (tidak ditemukan).')
  }
}
