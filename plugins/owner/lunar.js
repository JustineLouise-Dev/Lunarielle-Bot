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
// plugins/owner/lunar.js

import {
    setAiScope,
    getAiScopes,
    setChatOverride,
    clearChatOverride,
    isAiActiveForChat
} from '../../db/aiStore.js'

const VALID_SCOPES = ['all', 'group', 'private']

function statusText(scopes, currentChatActive, hasOverride) {
    const overrideLine = hasOverride
        ? `\n📍 Chat ini punya pengaturan sendiri (override): ${currentChatActive ? '✅ ON' : '❌ OFF'} — pakai \`.lunar reset\` untuk ikut lagi ke scope global.`
        : `\n📍 Chat ini: ${currentChatActive ? '✅ ON' : '❌ OFF'} (mengikuti scope global di atas).`

    return (
        '🌙 *Status Auto AI Lunar*\n\n' +
        `• All   : ${scopes.all ? '✅ ON' : '❌ OFF'}\n` +
        `• Group  : ${scopes.group ? '✅ ON' : '❌ OFF'}\n` +
        `• Private : ${scopes.private ? '✅ ON' : '❌ OFF'}\n` +
        overrideLine + '\n\n' +
        (scopes.all
            ? 'ℹ️ Scope "all" aktif, jadi auto AI berjalan di semua chat apapun setting group/private (kecuali chat yang punya override sendiri).'
            : 'ℹ️ Tanpa scope "all", group & private jalan sesuai settingnya masing-masing (kecuali chat yang punya override sendiri).')
    )
}

export default {
    command: 'lunar',
    alias: ['ai'],
    category: 'owner',
    description:
        'Mengaktifkan/menonaktifkan auto AI (chat natural otomatis tanpa command) untuk target tertentu.\n\n' +
        '*Format:*\n' +
        '> `.lunar on` — aktif HANYA di chat ini (grup ini saja / private chat ini saja)\n' +
        '> `.lunar off` — matikan HANYA di chat ini\n' +
        '> `.lunar on all` — aktif di SEMUA chat (semua grup + semua private)\n' +
        '> `.lunar on group` — aktif di SEMUA grup\n' +
        '> `.lunar on private` — aktif di SEMUA private chat\n' +
        '> `.lunar off all/group/private` — matikan sesuai scope\n' +
        '> `.lunar reset` — hapus pengaturan khusus chat ini, ikut scope global lagi\n' +
        '> `.lunar status` — lihat status',
    help: '`on/off/status/reset` `[all/group/private]`',
    owner: true,
    typing: true,

    async execute(m, { args }) {
        const sub = (args[0] || '').toLowerCase()
        const target = (args[1] || '').toLowerCase()

        if (!sub || sub === 'status') {
            const scopes = getAiScopes()
            const currentActive = isAiActiveForChat(m.chat, m.isGroup)
            const expectedFromScope = scopes.all || (m.isGroup ? scopes.group : scopes.private)
            const hasOverride = currentActive !== expectedFromScope
            return m.reply(statusText(scopes, currentActive, hasOverride))
        }

        if (sub === 'reset') {
            clearChatOverride(m.chat)
            const scopes = getAiScopes()
            const nowActive = isAiActiveForChat(m.chat, m.isGroup)
            return m.reply(
                `🌙 Pengaturan khusus chat ini dihapus. Sekarang chat ini ikut scope global: ${nowActive ? '✅ ON' : '❌ OFF'}.\n\n` +
                statusText(scopes, nowActive, false)
            )
        }

        if (sub !== 'on' && sub !== 'off') {
            return m.reply(
                '⚠️ Perintah tidak dikenal.\n\n' +
                'Gunakan:\n' +
                '`.lunar on` / `.lunar off` — khusus chat ini\n' +
                '`.lunar on all/group/private` — semua chat sesuai target\n' +
                '`.lunar off all/group/private`\n' +
                '`.lunar reset`\n' +
                '`.lunar status`'
            )
        }

        const enabled = sub === 'on'

        if (!target) {
            setChatOverride(m.chat, enabled)
            const scopeKind = m.isGroup ? 'grup ini' : 'private chat ini'

            return m.reply(
                `🌙 Auto AI ${enabled ? 'diaktifkan ✅' : 'dimatikan ❌'} khusus untuk *${scopeKind}* saja ` +
                `(chat lain tidak terpengaruh).\n\n` +
                `Ketik \`.lunar reset\` di chat ini kapan saja untuk kembali mengikuti pengaturan global ` +
                `(\`.lunar on/off all\`, \`group\`, atau \`private\`).`
            )
        }

        if (!VALID_SCOPES.includes(target)) {
            return m.reply(
                '⚠️ Target tidak valid. Pilih salah satu: `all`, `group`, `private`, atau kosongkan untuk chat ini saja.\n\n' +
                `Contoh: \`.lunar ${sub} all\` atau cukup \`.lunar ${sub}\``
            )
        }

        const scopes = setAiScope(target, enabled)
        const scopeLabel = { all: 'SEMUA chat (grup + private)', group: 'SEMUA grup', private: 'SEMUA private chat' }[target]

        await m.reply(
            `🌙 Auto AI ${enabled ? 'diaktifkan ✅' : 'dimatikan ❌'} untuk *${scopeLabel}*.\n\n` +
            `ℹ️ Chat yang sebelumnya sudah diatur sendiri lewat \`.lunar on\`/\`.lunar off\` (tanpa target) ` +
            `tetap memakai pengaturannya sendiri sampai di-\`.lunar reset\`.\n\n` +
            statusText(scopes, isAiActiveForChat(m.chat, m.isGroup), false)
        )
    }
}
