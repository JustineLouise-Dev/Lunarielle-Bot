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
// plugins/channel/channel.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'config.json'))
)

export default async function channel(m, { conn }) {
    const url = config.channelUrl

    if (!url) {
        return m.reply('Channel resmi belum diatur oleh owner bot.')
    }

    await conn.sendMessage(m.chat, {
        interactiveMessage: {
            header: { title: `📢 Channel Resmi ${config.botName || 'Bot'}`, hasMediaAttachment: false },
            body: {
                text: 'Ikuti channel resmi kami untuk update fitur, pengumuman, dan info terbaru seputar bot.'
            },
            footer: { text: 'Klik tombol di bawah untuk membuka channel' },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📢 Buka Channel',
                            url
                        })
                    }
                ],
                messageVersion: 1
            },
            contextInfo: {
                stanzaId: m.id,
                participant: m.sender,
                remoteJid: m.chat,
                quotedMessage: m.message,
                mentionedJid: [m.sender]
            }
        }
    }, { quoted: m })
}

channel.command = 'channel'
channel.alias = ['chanel', 'ch']
channel.category = 'channel'
channel.description = 'Menampilkan channel WhatsApp resmi bot.'
