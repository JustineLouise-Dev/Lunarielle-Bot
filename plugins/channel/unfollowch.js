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
// plugins/chanel/unfollowch.js
import { parseChannelTarget } from '../../lib/utils.js'

export default {
  command: 'unfollowch',
  alias: ['unfollowchanel', 'unfollowchannel', 'ufch', 'unfollch', 'unfolch'],
  category: 'channel',
  description: 'Berhenti mengikuti channel WhatsApp dari link atau JID.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Menggunakan URL channel`\n> .unfollowch <url channel>\n\n' +
    '> `Menggunakan JID channel`\n> .unfollowch <jid channel>\n\n' +
    '> `Menggunakan link channel dari pesan yang di-reply`\n> .unfollowch',
  ownerOnly: true,
  typing: true,

  async execute(m, { sock, args }) {

    const raw = args.join(' ') || m.quoted?.text || ''
    const { invite, jid: parsedJid } = parseChannelTarget(raw)

    if (!invite && !parsedJid) {
      return m.reply(`Kirim link atau JID channel yang valid!\n\nContoh:\n> \`${m.prefix}${m.command} <url chanel>\`\n> \`${m.prefix}${m.command} <jid chanel>\`\n\natau reply pesan berisi link channel lalu ketik:\n> \`${m.prefix}${m.command}\``)
    }

    let jid = parsedJid
    let name = null

    try {
      if (!jid) {
        const metadata = await sock.newsletter.fetchByInvite(invite)
        jid = metadata.jid
        name = metadata.name
      }

      await sock.newsletter.unfollow(jid)
    } catch {
      return m.reply('Gagal unfollow channel, link/JID tidak valid atau channel tidak ditemukan.')
    }

    await m.reply(`✅ Berhasil unfollow channel${name ? `:\n*${name}*` : ''}\n\`\`\`${jid}\`\`\``)
  }
}
