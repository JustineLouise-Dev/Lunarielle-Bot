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
// plugins/owner/eval.js

import { runUserCode } from '../../handler.js'

export default {
  command: '>',
  alias: ['eval', 'ev', '=>', '!!'],
  category: 'owner',
  description: 'Menjalankan kode JavaScript secara langsung.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Menjalankan kode JavaScript`\n> .eval <code>',
  help: '`<code>`',
  onlyOwner: true,

  async execute(m, { sock }) {
    const code = m.text.slice(m.prefix.length + m.command.length).trim()
    if (!code) return m.reply('*Masukkan kode setelah prefix eval!*')

    return m.reply(await runUserCode(code, m, sock))
  }
}
