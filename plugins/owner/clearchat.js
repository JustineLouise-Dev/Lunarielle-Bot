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
// plugins/owner/clearchat.js

import { getAllKnownChatJids } from '../../db/rawMessage.js'

function isRealChatJid(jid) {
  if (!jid) return false
  if (jid === 'status@broadcast') return false
  if (jid.endsWith('@newsletter')) return false
  if (jid.endsWith('@broadcast')) return false
  return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@g.us') || jid.endsWith('@lid')
}

export default {
  command: 'clearchat',
  alias: ['clearallchat', 'hapussemuachat'],
  category: 'owner',
  description:
    'Membersihkan (menghapus) SELURUH chat yang tercatat di bot, sama seperti menekan ' +
    '"Hapus semua chat" di menu Riwayat Obrolan WhatsApp. Hanya berlaku di sisi bot ' +
    '(chat hilang dari daftar bot, tidak menghapus pesan di HP lawan chat).\n\n' +
    '*Format Penggunaan:*\n' +
    `> .clearchat confirm`,
  help: '`confirm`',
  onlyOwner: true,
  typing: true,

  async execute(m, { sock, args }) {
    const confirmed = /^(confirm|ya|yes)$/i.test(String(args?.[0] || '').trim())

    if (!confirmed) {
      return m.reply(
        '⚠️ *PERINGATAN*\n\n' +
        'Perintah ini akan menghapus *SELURUH chat* yang tercatat di bot ini ' +
        '(semua grup & private), persis seperti "Hapus semua chat" di WhatsApp.\n\n' +
        'Tindakan ini tidak bisa dibatalkan.\n\n' +
        `Ketik \`${m.prefix}clearchat confirm\` untuk melanjutkan.`
      )
    }

    const allJids = getAllKnownChatJids().filter(isRealChatJid)

    if (!allJids.length) {
      return m.reply('ℹ️ Tidak ada chat yang tercatat untuk dihapus.')
    }

    await m.reply(`🔄 Menghapus ${allJids.length} chat, mohon tunggu...`)

    let success = 0
    let failed = 0

    for (const jid of allJids) {
      if (jid === m.chat) continue

      try {
        await sock.chat.deleteChat(jid, { deleteMedia: true })
        success++
      } catch (err) {
        console.error('[CLEARCHAT ERROR]', jid, err?.message || err)
        failed++
      }
    }

    try {
      await sock.chat.deleteChat(m.chat, { deleteMedia: true })
      success++
    } catch (err) {
      console.error('[CLEARCHAT ERROR - current chat]', m.chat, err?.message || err)
      failed++
    }

    const summary =
      `✅ *Selesai membersihkan seluruh chat*\n\n` +
      `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n` +
      `↳ Total chat tercatat : ${allJids.length}\n` +
      `↳ Berhasil dihapus    : ${success}\n` +
      `↳ Gagal dihapus       : ${failed}\n` +
      `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n✦ Khusus Owner ✦`

    return m.reply(summary)
  }
}
