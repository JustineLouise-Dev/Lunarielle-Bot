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
// plugins/group/afk.js

import { setAfk } from '../../db/afk.js'

export default {
  command: 'afk',
  category: 'group',
  description: 'Menandai kamu sebagai AFK (Away From Keyboard) dengan alasan opsional (khusus di grup).',
  groupOnly: true,
  typing: true,

  async execute(m, { args }) {
    const reason = args.join(' ').trim() || 'Tidak ada alasan'

    setAfk(m.sender, m.chat, reason)

    await m.reply(`💤 Kamu sekarang AFK.\nAlasan: ${reason}`)
  }
}
