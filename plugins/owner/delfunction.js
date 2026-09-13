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
// plugins/owner/delfunction.js

import { removeFunctionTrigger } from '../../db/aiStore.js'

export default {
    command: 'delfunction',
    alias: ['delfungsi', 'delaiaction'],
    category: 'owner',
    description: 'Menghapus function call (aksi kontekstual auto AI) berdasarkan id. Lihat id-nya lewat `.listfunction`.',
    help: '`<id>`',
    owner: true,
    typing: true,

    async execute(m, { args }) {
        const id = args[0]

        if (!id) {
            return m.reply('⚠️ Sertakan id function yang mau dihapus. Lihat `.listfunction` dulu.')
        }

        const removed = removeFunctionTrigger(id)

        return m.reply(
            removed
                ? `🗑️ Function \`${id}\` berhasil dihapus.`
                : `⚠️ Function dengan id \`${id}\` tidak ditemukan.`
        )
    }
}
