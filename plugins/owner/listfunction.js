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
// plugins/owner/listfunction.js

import { listFunctionTriggers } from '../../db/aiStore.js'

const MEDIA_TYPE_LABEL = {
    text: 'teks',
    sticker: 'stiker',
    image: 'gambar',
    video: 'video',
    audio: 'audio/voice note',
    document: 'dokumen'
}

export default {
    command: 'listfunction',
    alias: ['listfungsi', 'listaiaction'],
    category: 'owner',
    description: 'Menampilkan daftar function call (aksi kontekstual auto AI) yang sudah didaftarkan lewat `.function`.',
    help: '',
    owner: true,
    typing: true,

    async execute(m) {
        const fns = listFunctionTriggers()

        if (!fns.length) {
            return m.reply('📭 Belum ada function call yang didaftarkan.\n\nReply teks/media apa pun lalu ketik `.function <prompt>`.')
        }

        const lines = fns.map((f, i) => {
            const jenis = MEDIA_TYPE_LABEL[f.mediaType] || f.mediaType
            const preview = f.mediaType === 'text' && f.textContent
                ? `\n   Isi: "${f.textContent.slice(0, 60)}${f.textContent.length > 60 ? '...' : ''}"`
                : ''
            return `*${i + 1}.* \`${f.id}\`\n   Jenis: ${jenis}${preview}\n   Kondisi: ${f.prompt}`
        })

        return m.reply(`🧩 *Daftar Function Call*\n\n${lines.join('\n\n')}`)
    }
}
