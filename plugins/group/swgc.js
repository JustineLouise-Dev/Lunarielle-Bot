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
// plugins/group/swgc.js

export default {
  command: 'swgc',
  category: 'group',
  description: 'Kirim pesan sebagai status grup.\n\n*Format:* .swgc [teks|emoji]\n*Wajib:* Reply pesan',
  help: '[teks|emoji] (reply pesan)',
  admin: true,
  group: true,

  async execute(m, { conn, args }) {
    if (!m.quoted) throw 'Reply pesan yang mau dijadikan status grup!'
    if (!m.quoted.message) throw 'Data pesan tidak ditemukan!'

    const full = m.quoted.message
    const msgType = Object.keys(full).find(k => k.endsWith('Message') && k !== 'messageContextInfo')
    if (!msgType) throw 'Tipe pesan tidak dikenali!'

    const raw = { ...full[msgType] }
    const input = args.join(' ').trim()

    if (input) {
      const [listName = '', listEmoji = ''] = input.split('|').map(s => s.trim())
      raw.contextInfo = {
        ...(raw.contextInfo || {}),
        statusAudienceMetadata: {
          audienceType: 2,
          ...(listName ? { listName } : {}),
          ...(listEmoji ? { listEmoji } : {})
        }
      }
    }

    await conn.relayMessage(m.chat, {
      groupStatusMessageV2: { message: { [msgType]: raw } }
    }, {
      additionalNodes: [{ tag: 'meta', attrs: { is_group_status: 'true' } }],
      additionalAttributes: { type: 'text' }
    })

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: { remoteJid: m.chat, id: m.id, fromMe: m.fromMe, participant: m.isGroup ? m.sender : undefined }
      }
    })
  }
}
