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
// plugins/tools/play.js

import { searchOnline, downloadAudioBuffer, formatCount, formatDuration, truncate } from '../../lib/ytdlp.js'

function buildCaption(meta, query) {
    const subscriberLine = meta.subscriberCount != null
        ? `🔔 Subscriber: ${formatCount(meta.subscriberCount)}\n`
        : ''
    return (
        `🔎 Hasil pencarian: *${query}*\n\n` +
        `🎵 *${meta.title}*\n\n` +
        `📺 Channel   : ${meta.channel}\n` +
        subscriberLine +
        `👍 Like      : ${formatCount(meta.likes)}\n` +
        `👁️ Views     : ${formatCount(meta.views)}\n` +
        `⏱️ Durasi    : ${formatDuration(meta.durationSeconds)}\n\n` +
        `📝 ${truncate(meta.description, 250)}`
    )
}

export default {
    command: 'play',
    alias: ['ytplay', 'search'],
    category: 'tools',
    description: 'Cari video di YouTube pakai judul, lalu langsung download & kirim audionya.',
    help: '<judul lagu/video>',
    typing: true,

    async execute(m, { args }) {
        const query = args.join(' ').trim()

        if (!query) {
            return m.reply(`⚠️ Masukkan judul video/audio yang mau dicari.\nContoh: \`${m.prefix}${m.command} blue youngkai\``)
        }

        let meta
        try {
            meta = await searchOnline(query, 1)
        } catch (e) {
            console.error('[PLAY ERROR] Gagal mencari di YouTube:', e)
            return m.reply('⚠️ Gagal mencari di YouTube. Coba lagi nanti.')
        }

        if (!meta) {
            return m.reply(`⚠️ Tidak ditemukan hasil untuk *${query}*.`)
        }

        if (meta.thumbnail) {
            await m.reply({ image: { url: meta.thumbnail }, caption: buildCaption(meta, query) }).catch(() => {})
        }

        try {
            const buffer = await downloadAudioBuffer(meta.url)
            await m.reply({ audio: buffer, mimetype: 'audio/mpeg', ptt: false })
        } catch (e) {
            console.error('[PLAY ERROR] Gagal download/kirim audio:', e)
            await m.reply('⚠️ Gagal mengunduh atau mengonversi audio. Coba lagi nanti.')
        }
    }
}
