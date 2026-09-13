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
// plugins/tools/toimg.js

import { convertWebpToPng } from '../../lib/sticker.js'
import { isQuotedSticker, downloadQuoted } from '../../lib/mediaHelper.js'

export default {
    command: 'toimg',
    alias: ['toimage', 'stickertoimg'],
    category: 'tools',
    description: 'Mengubah stiker (statis maupun bergerak) menjadi gambar. Reply stiker lalu ketik `.toimg`. Untuk stiker bergerak, hasilnya adalah frame pertama sebagai gambar diam — gunakan `.togif` kalau ingin hasil yang tetap bergerak.',
    help: '`(reply stiker)`',
    typing: true,

    async execute(m) {
        if (!isQuotedSticker(m)) {
            return m.reply('⚠️ Reply sebuah stiker dengan perintah `.toimg` untuk mengubahnya jadi gambar.')
        }

        let stickerBuffer
        try {
            stickerBuffer = await downloadQuoted(m)
        } catch (e) {
            console.error('[TOIMG ERROR] Gagal mengunduh stiker:', e)
            return m.reply('⚠️ Gagal mengunduh stiker. Coba reply ulang.')
        }

        try {
            const imageBuffer = await convertWebpToPng(stickerBuffer)
            return m.reply({ image: imageBuffer })
        } catch (e) {
            console.error('[TOIMG ERROR] Gagal mengonversi stiker ke gambar:', e)
            return m.reply('⚠️ Gagal mengonversi stiker ke gambar. Pastikan pesan yang di-reply benar-benar stiker.')
        }
    }
}
