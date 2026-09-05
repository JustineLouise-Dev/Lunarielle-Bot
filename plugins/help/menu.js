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
// menu.js
import zapoPkg from 'zapo-js/package.json' with { type: 'json' }
import { config } from '../../settings.js'

const zapoVersion = zapoPkg.version

export const CATEGORY_ICON = {
    channel: '📢',
    convert: '🔄',
    grup: '👥',
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

    for (const plugin of plugins.values()) {
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

        const category = plugin.category || 'root'
        if (!groups.has(category)) groups.set(category, [])
        groups.get(category).push(plugin)
    }

    for (const list of groups.values()) {
        list.sort((a, b) => a.command.localeCompare(b.command))
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

function buildHeader(m) {
    const prefix = config.noprefix ? 'no prefix' : config.prefixes.join(' ')

    return [
        `╭───「 *${config.botName}* 」───╮`,
        `│ ✦ Halo, *@${m.sender.split('@')[0]}* 👋`,
        `│`,
        `│ 👑 Owner   : ${config.ownerName}`,
        `│ ⚙️ Prefix  : ${prefix}`,
        `│ 🖥️ Runtime : ${getRuntime()}`,
        `│ 📦 Library : zapo-js v${zapoVersion}`,
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
            lines.push(`     ▸ ${usedPrefix}${plugin.command}`)
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
        lines.push(`  ▸ ${usedPrefix}${plugin.command}`)
    }

    lines.push('')
    lines.push('┗━━━━━━━━━━━━━━━━━━━┛')

    return lines.join('\n')
}

export function buildCategorySections(groups, usedPrefix) {
    const totalFitur = [...groups.values()].reduce((a, b) => a + b.length, 0)

    const categoryRows = sortedCategoryKeys(groups).map((category) => ({
        header: '',
        title: `${categoryIcon(category)} ${formatCategoryName(category)}`,
        description: `${groups.get(category).length} fitur`,
        id: `${usedPrefix}menu ${category}`
    }))

    const sections = [
        {
            title: '✨ Semua Fitur',
            highlight_label: '',
            rows: [
                {
                    header: '',
                    title: '📚 All Menu',
                    description: `Tampilkan seluruh ${totalFitur} fitur sekaligus`,
                    id: `${usedPrefix}menu all`
                }
            ]
        },
        {
            title: '🗂️ Kategori Fitur',
            highlight_label: '',
            rows: categoryRows
        }
    ]

    if (config.channelUrl) {
        sections.push({
            title: '🔗 Lainnya',
            highlight_label: '',
            rows: [
                {
                    header: '',
                    title: '📢 Channel Resmi',
                    description: 'Update fitur & pengumuman terbaru',
                    id: `${usedPrefix}channel`
                }
            ]
        })
    }

    return sections
}

export function buildCategoryListButton(groups, usedPrefix, title = '📋 Lihat Kategori') {
    return {
        name: 'single_select',
        buttonParamsJson: JSON.stringify({
            title,
            sections: buildCategorySections(groups, usedPrefix)
        })
    }
}

export function buildMenuButtons(groups, usedPrefix) {
    return [
        buildCategoryListButton(groups, usedPrefix, '📋 View List'),
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '📢 Channel',
                id: `${usedPrefix}channel`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '👤 Creator',
                id: `${usedPrefix}creator`
            })
        }
    ]
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

    async execute(m, { plugins }) {
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

        return m.reply({
            interactiveMessage: {
                header: { title: `✦ ${config.botName} ✦`, hasMediaAttachment: false },
                body: { text: hasil },
                footer: { text: `✦ Powered by ${config.botName} ✦` },
                nativeFlowMessage: {
                    buttons: buildMenuButtons(groups, usedPrefix),
                    messageVersion: 1
                },
                contextInfo: {
                    stanzaId: m.id,
                    participant: m.sender,
                    remoteJid: m.chat,
                    quotedMessage: m.raw?.message,
                    mentionedJid: [m.sender]
                }
            }
        })
    }
}
