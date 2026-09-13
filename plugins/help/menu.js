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
// menu.js

import { config } from '../../settings.js'
import { sendListMenu, sendInteractiveMenu } from '../../lib/wrapper.js'

export const CATEGORY_ICON = {
    channel: '📢',
    convert: '🔄',
    group: '👥',
    help: '🆘',
    interactive: '🎮',
    owner: '👑',
    search: '🔍',
    tools: '🛠️',
    root: '✨'
}

function getRuntime() {
    if (typeof Bun !== 'undefined') return `Bun v${Bun.version}`
    return `Node v${process.versions.node}`
}

export function categoryIcon(category) {
    return CATEGORY_ICON[category] || '📁'
}

function formatCategoryName(category) {
    if (!category || category === 'root') return 'Lainnya'
    return category
        .split(/[-_/]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function uniquePlugins(plugins) {
    const seen = new Set()
    const unique = []

    const iterable = plugins instanceof Map ? plugins.values() : plugins

    for (const plugin of iterable) {
        if (seen.has(plugin)) continue
        seen.add(plugin)
        unique.push(plugin)
    }

    return unique
}

export function groupByCategory(pluginList) {
    const groups = new Map()

    for (const plugin of pluginList) {
        if (plugin.hidden) continue
        if (!plugin.command) continue

        const category = plugin.category || 'root'
        if (!groups.has(category)) groups.set(category, [])
        groups.get(category).push(plugin)
    }

    for (const list of groups.values()) {
        list.sort((a, b) => String(a.command).localeCompare(String(b.command)))
    }

    return groups
}

function sortedCategoryKeys(groups) {
    return [...groups.keys()].sort((a, b) => {
        if (a === 'root') return 1
        if (b === 'root') return -1
        return a.localeCompare(b)
    })
}

function commandName(plugin) {
    return Array.isArray(plugin.command) ? plugin.command[0] : String(plugin.command)
}

function buildHeader(m) {
    const prefixes = Array.isArray(config.prefixes) && config.prefixes.length
        ? config.prefixes
        : [config.prefix || '.']
    const prefix = config.noprefix ? 'no prefix' : prefixes.join(' ')

    return [
        `╭───「 *${config.botName}* 」───╮`,
        `│ ✦ Halo, *${m.pushName || 'Kak'}* 👋`,
        `│`,
        `│ 👑 Owner   : ${config.ownerName || '-'}`,
        `│ ⚙️ Prefix  : ${prefix}`,
        `│ 🖥️ Runtime : ${getRuntime()}`,
        `│ 📦 Library : Baileys`,
        `╰──────────────────────╯`
    ].join('\n')
}

function buildCategoryListText(groups, usedPrefix, command) {
    const lines = ['┏━━━ ✦ *KATEGORI MENU* ✦ ━━━┓', '']

    for (const category of sortedCategoryKeys(groups)) {
        const jumlah = groups.get(category).length
        lines.push(`  ${categoryIcon(category)} *${formatCategoryName(category)}*  ┆  ${jumlah} fitur`)
        lines.push(`     ↳ \`${usedPrefix}${command} ${category}\``)
    }

    lines.push('')
    lines.push('┗━━━━━━━━━━━━━━━━━━━━━━┛')
    lines.push('')
    lines.push('💡 *Tips Cepat*')
    lines.push(`  •  Semua fitur   ➜ \`${usedPrefix}${command} all\``)
    lines.push(`  •  Per kategori  ➜ \`${usedPrefix}${command} <kategori>\``)

    return lines.join('\n')
}

export function buildAllMenuText(groups, usedPrefix) {
    const lines = ['┏━━━ ✦ *SEMUA FITUR* ✦ ━━━┓', '']

    for (const category of sortedCategoryKeys(groups)) {
        const items = groups.get(category)
        lines.push(`  ${categoryIcon(category)} *${formatCategoryName(category)}* ┆ ${items.length} fitur`)

        for (const plugin of items) {
            lines.push(`     ▸ ${usedPrefix}${commandName(plugin)}`)
        }

        lines.push('')
    }

    lines.push('┗━━━━━━━━━━━━━━━━━━━┛')
    lines.push('')
    lines.push(`✅ *Total: ${groups.size ? [...groups.values()].reduce((a, b) => a + b.length, 0) : 0} Fitur Tersedia*`)

    return lines.join('\n').trim()
}

function buildCategoryMenuText(groups, categoryKey, usedPrefix) {
    const items = groups.get(categoryKey)
    const lines = [
        `┏━━━ ${categoryIcon(categoryKey)} *${formatCategoryName(categoryKey).toUpperCase()}* ━━━┓`,
        `┆ ${items.length} fitur tersedia`,
        ''
    ]

    for (const plugin of items) {
        lines.push(`  ▸ ${usedPrefix}${commandName(plugin)}`)
    }

    lines.push('')
    lines.push('┗━━━━━━━━━━━━━━━━━━━┛')

    return lines.join('\n')
}

export function buildMenuListSections(groups, usedPrefix, command) {
    const totalFitur = [...groups.values()].reduce((a, b) => a + b.length, 0)

    const categoryRows = sortedCategoryKeys(groups).map((category) => ({
        title: `${categoryIcon(category)} ${formatCategoryName(category)}`,
        description: `${groups.get(category).length} fitur`,
        rowId: `${usedPrefix}${command} ${category}`
    }))

    const sections = [
        {
            title: '✨ Semua Fitur',
            rows: [
                {
                    title: '📚 All Menu',
                    description: `Tampilkan seluruh ${totalFitur} fitur sekaligus`,
                    rowId: `${usedPrefix}${command} all`
                }
            ]
        },
        {
            title: '🗂️ Kategori Fitur',
            rows: categoryRows
        }
    ]

    return sections
}

export default {
    command: 'menu',
    category: 'help',
    description: `Menampilkan daftar menu fitur bot berdasarkan kategori.

*Format Penggunaan:*
> \`Menampilkan semua fitur\`
> .menu all

> \`Menampilkan fitur berdasarkan kategori\`
> .menu <kategori>`,
    help: '`[kategori|all]`',
    typing: true,

    async execute(m, { conn, plugins }) {
        const pluginList = uniquePlugins(plugins)
        const groups = groupByCategory(pluginList)
        const arg = (m.args[0] || '').toLowerCase()
        const usedPrefix = m.prefix
        const header = buildHeader(m)

        let body

        if (!arg) {
            body = buildCategoryListText(groups, usedPrefix, m.command)
        } else if (arg === 'all') {
            body = buildAllMenuText(groups, usedPrefix)
        } else {
            const matchedKey = [...groups.keys()].find((key) => key.toLowerCase() === arg)

            if (!matchedKey) {
                return m.reply(`Kategori "${arg}" tidak ditemukan. Ketik ${usedPrefix}${m.command} untuk melihat daftar kategori.`)
            }

            body = buildCategoryMenuText(groups, matchedKey, usedPrefix)
        }

        const hasil = header + '\n\n' + body

        try {
            const extraButtons = []

            if (config.channelUrl) {
                extraButtons.push({ type: 'reply', displayText: '📢 Channel', id: `${usedPrefix}channel` })
            }
            extraButtons.push({ type: 'reply', displayText: '👤 Developer', id: `${usedPrefix}creator` })

            return await sendInteractiveMenu(conn, m.chat, {
                title: `✦ ${config.botName} ✦`,
                text: hasil,
                footer: `✦ Powered by ${config.botName} ✦`,
                buttons: [
                    {
                        type: 'list',
                        displayText: '📋 Lihat Kategori',
                        sections: buildMenuListSections(groups, usedPrefix, m.command)
                    },
                    ...extraButtons
                ]
            }, { quoted: m })
        } catch (interactiveError) {
            try {
                return await sendListMenu(conn, m.chat, {
                    title: `✦ ${config.botName} ✦`,
                    text: hasil,
                    footer: `✦ Powered by ${config.botName} ✦`,
                    buttonText: '📋 Lihat Kategori',
                    sections: buildMenuListSections(groups, usedPrefix, m.command)
                }, { quoted: m })
            } catch (listError) {

                return m.reply(hasil)
            }
        }
    }
}
