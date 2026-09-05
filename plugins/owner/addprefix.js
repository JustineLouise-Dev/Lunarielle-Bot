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
// plugins/owner/addprefix.js

import { config, updateSetting } from '../../settings.js'

const MAX_PREFIX_LENGTH = 5

export default {
  command: 'addprefix',
  alias: ['tambahprefix'],
  category: 'owner',
  description: 'Menambahkan prefix baru ke daftar prefix bot.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Menambahkan prefix baru`\n> .addprefix <prefix>',
  onlyOwner: true,

  async execute(m, { args }) {
    const raw = args?.[0]

    if (!raw) {
      return m.reply(
        `Usage: \`${m.prefix}addprefix <prefix>\`\n\n` +
        `Prefix aktif saat ini:\n${config.prefixes.map((p) => `- \`${p}\``).join('\n')}`
      )
    }

    const newPrefix = raw.trim()

    if (!newPrefix) return m.reply('❌ Prefix tidak boleh kosong.')
    if (/\s/.test(newPrefix)) return m.reply('❌ Prefix tidak boleh mengandung spasi.')
    if (newPrefix.length > MAX_PREFIX_LENGTH) return m.reply(`❌ Prefix maksimal ${MAX_PREFIX_LENGTH} karakter.`)
    if (config.prefixes.includes(newPrefix)) return m.reply(`⚠️ Prefix \`${newPrefix}\` sudah terdaftar.`)

    if (!updateSetting('prefixes', [...config.prefixes, newPrefix])) {
      return m.reply('❌ Gagal menyimpan prefix ke settings.js.')
    }

    return m.reply(
      `✅ Prefix \`${newPrefix}\` berhasil ditambahkan.\n\n` +
      `Prefix aktif sekarang:\n${config.prefixes.map((p) => `- \`${p}\``).join('\n')}`
    )
  }
}
