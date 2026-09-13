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
// plugins/tools/ttmp4.js

import { isTiktokUrl, getMetadata, downloadVideoBuffer, formatCount, formatDuration, truncate } from '../../lib/ytdlp.js'

function buildCaption(meta) {
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
        `⏱️ Durasi   : ${formatDuration(meta.durationSeconds)}`
    )
}

export default {
    command: 'ttmp4',
    alias: ['tiktokvideo', 'tiktokdl'],
    category: 'tools',
    description: 'Download video TikTok tanpa watermark via url.',
    help: '<url tiktok>',
    typing: true,

    async execute(m, { args }) {
        const skipThumbnail = args.includes('--fromtt')
        const url = (args.find(a => isTiktokUrl(a)) || args[0] || '').trim()

        if (!url || !isTiktokUrl(url)) {
            return m.reply(`⚠️ Masukkan url TikTok yang valid.\nContoh: \`${m.prefix}${m.command} https://vt.tiktok.com/xxxxxxx\``)
        }

        let meta
        try {
            meta = await getMetadata(url)
        } catch (e) {
            console.error('[TTMP4 ERROR] Gagal mengambil data TikTok:', e)
            return m.reply('⚠️ Gagal mengambil data video. Pastikan url valid dan videonya tidak private/dihapus.')
        }

        if (!skipThumbnail && meta.thumbnail) {
            await m.reply({ image: { url: meta.thumbnail }, caption: buildCaption(meta) }).catch(() => {})
        }

        try {
            const buffer = await downloadVideoBuffer(url, 1080)
            await m.reply({
                video: buffer,
                mimetype: 'video/mp4',
                caption: `✅ *${truncate(meta.title, 150)}*\n📺 Resolusi: HD (maks 1080p)`
            })
        } catch (e) {
            console.error('[TTMP4 ERROR] Gagal download/kirim video:', e)
            await m.reply('⚠️ Gagal mengunduh atau mengirim video. Coba lagi nanti.')
        }
    }
}
