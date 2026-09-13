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
// plugins/help/viewlist.js

import { config } from '../../settings.js'
import { uniquePlugins, groupByCategory, buildMenuListSections } from './menu.js'
import { sendListMenu, sendInteractiveMenu } from '../../lib/wrapper.js'

export default {
    command: 'viewlist',
    alias: ['vlist', 'listmenu'],
    category: 'help',
    description: 'Menampilkan pilihan kategori fitur bot untuk dijelajahi satu per satu.',
    typing: true,

    async execute(m, { conn, plugins }) {
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

        const listSections = buildMenuListSections(groups, usedPrefix, 'menu')

        try {
            const extraButtons = []

            if (config.channelUrl) {
                extraButtons.push({ type: 'reply', displayText: '📢 Channel', id: `${usedPrefix}channel` })
            }
            extraButtons.push({ type: 'reply', displayText: '👤 Developer', id: `${usedPrefix}creator` })

            return await sendInteractiveMenu(conn, m.chat, {
                title: `❍ ${config.botName} ❍`,
                text: body,
                footer: `✦ Powered by ${config.botName} ✦`,
                buttons: [
                    { type: 'list', displayText: '📋 Lihat Kategori', sections: listSections },
                    ...extraButtons
                ]
            }, { quoted: m })
        } catch (interactiveError) {
            try {
                return await sendListMenu(conn, m.chat, {
                    title: `❍ ${config.botName} ❍`,
                    text: body,
                    footer: `✦ Powered by ${config.botName} ✦`,
                    buttonText: '📋 Lihat Kategori',
                    sections: listSections
                }, { quoted: m })
            } catch (listError) {
                return m.reply(body)
            }
        }
    }
}
