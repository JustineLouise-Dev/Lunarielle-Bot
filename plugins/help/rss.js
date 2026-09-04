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
// plugins/bot/rss.js
import { formatBytes } from '../../lib/utils.js'

export default {
  command: 'memory',
  alias: ['mem', 'ram', 'rss'],
  category: 'help',
  description: 'Menampilkan detail penggunaan memory bot.',
  typing: true,
  async execute(m) {
    const mem = process.memoryUsage()
    const lines = Object.entries(mem)
      .map(([key, value]) => `◦ *${key}:* ${formatBytes(value)}`)
      .join('\n')

    await m.reply(`*── 「 MEMORY USAGE 」 ──*\n\n${lines}`)
  }
}
