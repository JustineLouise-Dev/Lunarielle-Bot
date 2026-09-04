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
// plugins/owner/restart.js

import fs from 'fs'
import path from 'path'

export default {
  command: 'restart',
  alias: ['restartbot', 'botrs', 'botres', 'resbot'],
  category: 'owner',
  description: 'Memulai ulang process bot.',
  onlyOwner: true,

  async execute(m) {
    const trashPath = path.join(process.cwd(), 'sampah')
    const restartFile = path.join(trashPath, 'restart_info.json')

    if (!fs.existsSync(trashPath)) {
      fs.mkdirSync(trashPath, { recursive: true })
    }

    const restartData = {
      jid: m.chat,
      sender: m.sender,
      id: m.id,
      text: m.text || m.body || '.restart',
      time: Date.now()
    }

    try {
      fs.writeFileSync(restartFile, JSON.stringify(restartData, null, 2))
      await m.reply('🔄 *Bot sedang restart...*\nMohon tunggu sekitar 5-10 detik.')

      setTimeout(() => {
        process.exit(0)
      }, 1000)
    } catch (err) {
      console.error('[RESTART ERROR]', err)
      await m.reply('❌ Gagal menyiapkan file restart.')
    }
  }
}
