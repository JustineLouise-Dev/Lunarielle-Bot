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
// plugins/owner/noprefix.js

import { config, updateConfig } from '../../settings.js'

export default {
  command: 'noprefix',
  alias: ['nopref'],
  category: 'owner',
  description: 'Mengaktifkan atau menonaktifkan mode tanpa prefix.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Mengaktifkan mode tanpa prefix`\n> .noprefix on\n\n' +
    '> `Menonaktifkan mode tanpa prefix`\n> .noprefix off',
  onlyOwner: true,

  async execute(m, { args }) {
    const arg = args ? args[0]?.toLowerCase() : undefined

    if (!arg) {
      const status = config.noprefix ? 'ON' : 'OFF'
      return m.reply(
        `No-Prefix Mode: *${status}*\n\n` +
        `Usage: \`${m.prefix}noprefix on\` or \`${m.prefix}noprefix off\``
      )
    }

    if (['on', 'true'].includes(arg)) {
      updateConfig('noprefix', true)
      return m.reply('✅ No-Prefix Mode is now *ON*. Commands can be executed without a prefix.')
    }

    if (['off', 'false'].includes(arg)) {
      updateConfig('noprefix', false)
      return m.reply('❌ No-Prefix Mode is now *OFF*. Commands require a prefix.')
    }

    return m.reply(`Usage: \`${m.prefix}noprefix on\` or \`${m.prefix}noprefix off\``)
  }
}
