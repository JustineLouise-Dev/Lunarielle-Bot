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
// plugins/channel/idch.js

import { parseChannelTarget, getQuotedText } from '../../lib/utils.js'
import { sendInteractiveMenu } from '../../lib/wrapper.js'

export default async function idch(m, { conn, args }) {
    const raw = args.join(' ') || getQuotedText(m.quoted)
    const { invite } = parseChannelTarget(raw)

    if (!invite) {
        return m.reply(
            `Kirim link channel yang valid!\n\n` +
            `Contoh:\n` +
            `> \`${m.prefix}${m.command} <url channel>\`\n\n` +
            `atau reply pesan berisi link channel lalu ketik:\n` +
            `> \`${m.prefix}${m.command}\``
        )
    }

    let metadata
    try {
        metadata = await conn.newsletterMetadata('invite', invite)
    } catch {
        return m.reply('Link channel tidak valid, kadaluarsa, atau channel sudah tidak ada.')
    }

    const jid = metadata.id || metadata.jid

    await sendInteractiveMenu(conn, m.chat, {
        title: '📍 Info Channel ID',
        text: `📌 *ID Channel:*\n\`\`\`${jid}\`\`\``,
        footer: 'Gunakan tombol di bawah untuk menyalin ID',
        buttons: [
            {
                type: 'reply',
                displayText: '📋 Salin ID Channel',
                id: jid
            }
        ]
    }, { quoted: m })
}

idch.command = 'idch'
idch.alias = ['idchanel', 'idchannel', 'channelid', 'chanelid']
idch.category = 'channel'
idch.description = 'Menampilkan ID Channel dari link WhatsApp Channel.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Menggunakan URL channel`\n> .idch <url channel>\n\n' +
    '> `Menggunakan link channel dari pesan yang di-reply`\n> .idch'
idch.typing = true
