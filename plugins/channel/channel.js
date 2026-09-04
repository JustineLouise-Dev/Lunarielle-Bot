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
// plugins/chanel/channel.js

import { config } from '../../settings.js'
import { buildQuoteContext } from '../../lib/utils.js'

export default {
  command: 'channel',
  alias: ['chanel', 'ch'],
  category: 'channel',
  description: 'Menampilkan channel WhatsApp resmi bot.',
  typing: true,

  async execute(m) {
    const url = config.channelUrl

    if (!url) {
      return m.reply('Channel resmi belum diatur oleh owner bot.')
    }

    await m.reply({
      interactiveMessage: {
        header: { title: `📢 Channel Resmi ${config.botName}`, hasMediaAttachment: false },
        body: {
          text: 'Ikuti channel resmi kami untuk update fitur, pengumuman, dan info terbaru seputar bot.'
        },
        footer: { text: 'Klik tombol di bawah untuk membuka channel' },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_url',
              buttonParamsJson: JSON.stringify({
                display_text: '📢 Buka Channel',
                url
              })
            }
          ],
          messageVersion: 1
        },
        contextInfo: buildQuoteContext(m)
      }
    })
  }
}
