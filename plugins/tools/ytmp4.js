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
// plugins/tools/ytmp4.js

import { isYoutubeUrl, getMetadata, downloadVideoBuffer, formatCount, formatDuration, truncate } from '../../lib/ytdlp.js'

function buildCaption(meta) {
    const subscriberLine = meta.subscriberCount != null
        ? `🔔 Subscriber: ${formatCount(meta.subscriberCount)}\n`
        : ''
    return (
        `🎬 *${truncate(meta.title, 150)}*\n\n` +
        `📺 Channel   : ${meta.channel}\n` +
        subscriberLine +
        `👍 Like      : ${formatCount(meta.likes)}\n` +
        `👁️ Views     : ${formatCount(meta.views)}\n` +
        `⏱️ Durasi    : ${formatDuration(meta.durationSeconds)}\n\n` +
        `📝 ${truncate(meta.description, 250)}`
    )
}

export default {
    command: 'ytmp4',
    alias: ['ytvideo', 'ytdlvideo'],
    category: 'tools',
    description: 'Download video dari YouTube via url (kualitas terbaik yang tersedia, maks 1080p).',
    help: '<url youtube>',
    typing: true,

    async execute(m, { args }) {
        const skipThumbnail = args.includes('--fromplay')
        const url = (args.find(a => isYoutubeUrl(a)) || args[0] || '').trim()

        if (!url || !isYoutubeUrl(url)) {
            return m.reply(
                `⚠️ Masukkan url video YouTube yang valid.\nContoh: \`${m.prefix}${m.command} https://youtube.com/watch?v=xxxxxxx\``
            )
        }

        const meta = await getMetadata(url).catch(e => {
            console.error('[YTMP4] Gagal ambil metadata:', e)
            return null
        })

        if (!skipThumbnail && meta?.thumbnail) {
            await m.reply({ image: { url: meta.thumbnail }, caption: buildCaption(meta) }).catch(() => {})
        }

        try {
            const buffer = await downloadVideoBuffer(url, 1080)
            await m.reply({
                video: buffer,
                mimetype: 'video/mp4',
                caption: `✅ *${truncate(meta?.title || 'Video', 150)}*\n📺 Resolusi: HD (maks 1080p)`
            })
        } catch (e) {
            console.error('[YTMP4 ERROR] Gagal download/kirim video:', e)
            await m.reply('⚠️ Gagal mengunduh atau mengirim video. Coba lagi nanti.')
        }
    }
}
