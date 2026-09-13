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
// plugins/help/help.js

export default {
  command: 'help',
  alias: ['command'],
  category: 'help',
  description: `Menampilkan detail command atau alias plugin.

*Format Penggunaan:*
> \`Menampilkan informasi plugin\`
> .help <command/alias>`,
  help: '`<command/alias>`',

  async execute(m, { plugins }) {
    const requested = m.args?.[0]?.toLowerCase()

    if (!requested) {
      return m.reply(`Gunakan: ${m.prefix}${m.command} <command atau alias>\nContoh: ${m.prefix}${m.command} ping`)
    }

    const plugin = plugins.get(requested)
    if (!plugin) {
      return m.reply(`Fitur \`${requested}\` tidak ditemukan.\nGunakan ${m.prefix}menu untuk melihat daftar fitur.`)
    }

    const rawAliases = plugin.alias
    const aliases = Array.isArray(rawAliases)
      ? rawAliases
      : rawAliases
        ? [rawAliases]
        : []

    const aliasText = aliases.length
      ? aliases.map(alias => `\`${alias}\``).join(', ')
      : '-'

    const source = plugin.__file || 'Tidak diketahui'
    const description = plugin.description || 'Tidak ada deskripsi.'
    const commandName = Array.isArray(plugin.command) ? plugin.command[0] : plugin.command

    const info =
      `*Informasi Fitur*\n\n` +
      `*Command:* \`${m.prefix}${commandName}\`\n` +
      `*Alias:* ${aliasText}\n` +
      `*Deskripsi:*\n${description}\n` +
      `*Directory:* \`${source}\``

    return m.reply(info)
  }
}
