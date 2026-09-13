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
// plugins/tools/tt.js

import { isTiktokUrl, getMetadata, formatCount, formatDuration, truncate } from '../../lib/ytdlp.js'
import { sendInteractiveMenu } from '../../lib/wrapper.js'

function buildBody(meta) {
    const followerLine = meta.subscriberCount != null
        ? `👥 Followers: ${formatCount(meta.subscriberCount)}\n`
        : ''
    const shareLine = meta.shares != null
        ? `🔁 Share    : ${formatCount(meta.shares)}\n`
        : ''
    return (
        `🎬 *${truncate(meta.title, 150)}*\n\n` +
        `👤 Creator  : ${meta.channel}\n` +
        followerLine +
        `❤️ Like     : ${formatCount(meta.likes)}\n` +
        `💬 Komentar : ${formatCount(meta.comments)}\n` +
        shareLine +
        `👁️ Views    : ${formatCount(meta.views)}\n` +
        `⏱️ Durasi   : ${formatDuration(meta.durationSeconds)}\n\n` +
        `Mau download yang mana? 👇`
    )
}

export default {
    command: 'tt',
    alias: ['tiktok'],
    category: 'tools',
    description: 'Ambil info video TikTok via url, lalu pilih mau download video (.ttmp4) atau audio (.ttmp3) lewat tombol.',
    help: '<url tiktok>',
    typing: true,

    async execute(m, { conn, args }) {
        const url = (args.find(a => isTiktokUrl(a)) || args[0] || '').trim()

        if (!url || !isTiktokUrl(url)) {
            return m.reply(`⚠️ Masukkan url TikTok yang valid.\nContoh: \`${m.prefix}${m.command} https://vt.tiktok.com/xxxxxxx\``)
        }

        let meta
        try {
            meta = await getMetadata(url)
        } catch (e) {
            console.error('[TT ERROR] Gagal mengambil data TikTok:', e)
            return m.reply('⚠️ Gagal mengambil data video. Pastikan url valid dan videonya tidak private/dihapus.')
        }

        const bodyText = buildBody(meta)
        const buttons = [
            { type: 'reply', displayText: '🎬 Download Video', id: `${m.prefix}ttmp4 ${url} --fromtt` },
            { type: 'reply', displayText: '🎧 Download Audio', id: `${m.prefix}ttmp3 ${url} --fromtt` }
        ]

        try {
            await sendInteractiveMenu(conn, m.chat, {
                title: '',
                text: bodyText,
                footer: 'Pilih format download di bawah',
                buttons
            }, { quoted: m })
        } catch (e) {
            console.error('[TT ERROR] Gagal kirim pesan interaktif, fallback ke pesan biasa:', e)
            await m.reply(bodyText)
        }
    }
}
