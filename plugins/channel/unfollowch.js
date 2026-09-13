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
// plugins/channel/unfollowch.js

import { parseChannelTarget, getQuotedText } from '../../lib/utils.js'

export default async function unfollowch(m, { conn, args }) {
    const raw = args.join(' ') || getQuotedText(m.quoted)
    const { invite, jid: parsedJid } = parseChannelTarget(raw)

    if (!invite && !parsedJid) {
        return m.reply(
            `Kirim link atau JID channel yang valid!\n\n` +
            `Contoh:\n` +
            `> \`${m.prefix}${m.command} <url channel>\`\n` +
            `> \`${m.prefix}${m.command} <jid channel>\`\n\n` +
            `atau reply pesan berisi link channel lalu ketik:\n` +
            `> \`${m.prefix}${m.command}\``
        )
    }

    let jid = parsedJid
    let name = null

    try {
        if (!jid) {
            const metadata = await conn.newsletterMetadata('invite', invite)
            jid = metadata.id || metadata.jid
            name = metadata.name
        }

        await conn.newsletterUnfollow(jid)
    } catch {
        return m.reply('Gagal unfollow channel, link/JID tidak valid atau channel tidak ditemukan.')
    }

    await m.reply(`✅ Berhasil unfollow channel${name ? `:\n*${name}*` : ''}\n\`\`\`${jid}\`\`\``)
}

unfollowch.command = 'unfollowch'
unfollowch.alias = ['unfollowchanel', 'unfollowchannel', 'ufch', 'unfollch', 'unfolch']
unfollowch.category = 'channel'
unfollowch.description = 'Berhenti mengikuti channel WhatsApp dari link atau JID.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Menggunakan URL channel`\n> .unfollowch <url channel>\n\n' +
    '> `Menggunakan JID channel`\n> .unfollowch <jid channel>\n\n' +
    '> `Menggunakan link channel dari pesan yang di-reply`\n> .unfollowch'
unfollowch.owner = true
unfollowch.typing = true
