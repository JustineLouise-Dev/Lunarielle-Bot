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
// plugins/help/viewlist.js
//
// Command mandiri `.viewlist` — tetap tersedia untuk yang mengetik manual.
// Menampilkan tombol "View List" tunggal (native flow single_select) yang
// saat ditekan membuka sheet berisi seluruh kategori fitur bot. Sheet yang
// sama juga sudah tertanam langsung pada tombol "View List" di `.menu`,
// sehingga tidak perlu menunggu command ini dipanggil terpisah dulu.

import { config } from '../../settings.js'
import { uniquePlugins, groupByCategory, buildCategoryListButton } from './menu.js'

export default {
    command: 'viewlist',
    alias: ['vlist', 'listmenu'],
    category: 'help',
    description: 'Menampilkan pilihan kategori fitur bot untuk dijelajahi satu per satu.',
    typing: true,

    async execute(m, { plugins }) {
        const pluginList = uniquePlugins(plugins)
        const groups = groupByCategory(pluginList)
        const usedPrefix = m.prefix
        const totalFitur = [...groups.values()].reduce((a, b) => a + b.length, 0)

        const body = [
            `╭───「 *${config.botName}* 」───╮`,
            `│ 🗂️ *Daftar Kategori Fitur*`,
            `│`,
            `│ ✅ Total : *${totalFitur}* fitur`,
            `│ 📁 Kategori : *${groups.size}*`,
            `╰──────────────────────╯`,
            '',
            '💡 Tekan tombol *"Lihat Kategori"* di bawah untuk menjelajahi tiap kategori fitur. 👇'
        ].join('\n')

        const buttons = [buildCategoryListButton(groups, usedPrefix, '📋 Lihat Kategori')]

        return m.reply({
            interactiveMessage: {
                header: { title: `❍ ${config.botName} ❍`, hasMediaAttachment: false },
                body: { text: body },
                footer: { text: `✦ Powered by ${config.botName} ✦` },
                nativeFlowMessage: {
                    buttons,
                    messageVersion: 1
                },
                contextInfo: {
                    stanzaId: m.id,
                    participant: m.sender,
                    remoteJid: m.chat,
                    quotedMessage: m.raw?.message
                }
            }
        })
    }
}
