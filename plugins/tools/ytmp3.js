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
// plugins/tools/ytmp3.js

import { isYoutubeUrl, getMetadata, downloadAudioBuffer, formatCount, formatDuration, truncate } from '../../lib/ytdlp.js'

function buildCaption(meta) {
    const subscriberLine = meta.subscriberCount != null
        ? `🔔 Subscriber: ${formatCount(meta.subscriberCount)}\n`
        : ''
    return (
        `🎧 *${truncate(meta.title, 150)}*\n\n` +
        `📺 Channel   : ${meta.channel}\n` +
        subscriberLine +
        `👍 Like      : ${formatCount(meta.likes)}\n` +
        `👁️ Views     : ${formatCount(meta.views)}\n` +
        `⏱️ Durasi    : ${formatDuration(meta.durationSeconds)}\n\n` +
        `📝 ${truncate(meta.description, 250)}`
    )
}

export default {
    command: 'ytmp3',
    alias: ['ytaudio', 'ytdlaudio'],
    category: 'tools',
    description: 'Download audio dari YouTube via url dengan kualitas audio tertinggi.',
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
            console.error('[YTMP3] Gagal ambil metadata:', e)
            return null
        })

        if (!skipThumbnail && meta?.thumbnail) {
            await m.reply({ image: { url: meta.thumbnail }, caption: buildCaption(meta) }).catch(() => {})
        }

        try {
            const buffer = await downloadAudioBuffer(url)
            await m.reply({ audio: buffer, mimetype: 'audio/mpeg', ptt: false })
        } catch (e) {
            console.error('[YTMP3 ERROR] Gagal download/kirim audio:', e)
            await m.reply('⚠️ Gagal mengunduh atau mengonversi audio. Coba lagi nanti.')
        }
    }
}
