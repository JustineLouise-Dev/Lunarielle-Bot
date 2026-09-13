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
// plugins/tools/togif.js

import { convertWebpToGif } from '../../lib/sticker.js'
import { isQuotedSticker, downloadQuoted } from '../../lib/mediaHelper.js'

export default {
    command: 'togif',
    alias: ['stickertogif'],
    category: 'tools',
    description: 'Mengubah stiker bergerak (animasi) menjadi GIF. Reply stiker bergerak lalu ketik `.togif`.',
    help: '`(reply stiker bergerak)`',
    typing: true,

    async execute(m) {
        if (!isQuotedSticker(m)) {
            return m.reply('⚠️ Reply sebuah stiker bergerak dengan perintah `.togif` untuk mengubahnya jadi GIF.')
        }

        const quotedSticker = m.quoted?.message?.stickerMessage
        if (quotedSticker && quotedSticker.isAnimated === false) {
            return m.reply('⚠️ Stiker ini bukan stiker bergerak. Gunakan `.toimg` untuk stiker diam.')
        }

        let stickerBuffer
        try {
            stickerBuffer = await downloadQuoted(m)
        } catch (e) {
            console.error('[TOGIF ERROR] Gagal mengunduh stiker:', e)
            return m.reply('⚠️ Gagal mengunduh stiker. Coba reply ulang.')
        }

        try {
            const gifBuffer = await convertWebpToGif(stickerBuffer)
            return m.reply({
                video: gifBuffer,
                gifPlayback: true,
                mimetype: 'video/mp4'
            })
        } catch (e) {
            console.error('[TOGIF ERROR] Gagal mengonversi stiker ke GIF:', e)
            return m.reply('⚠️ Gagal mengonversi stiker ke GIF. Pastikan pesan yang di-reply benar-benar stiker bergerak.')
        }
    }
}
