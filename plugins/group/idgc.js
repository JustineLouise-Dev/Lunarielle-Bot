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
// plugins/group/idgc.js
import { buildQuoteContext } from '../../lib/utils.js'

export default {
  command: 'idgc',
  alias: ['idgrup', 'idgroup', 'grupid', 'groupid'],
  category: 'group',
  description: `Tampilkan *ID Grup* dalam bentuk tombol copy.

\`Cara Penggunaan:\`
> langsung kirim perintah: \`.idgc\` (hanya di dalam grup)`,
  groupOnly: true,
  typing: true,

  async execute(m) {
    await m.reply({
      interactiveMessage: {
        header: { title: '📍 Info Group ID', hasMediaAttachment: false },
        body: {
          text: `📌 *ID Grup:*\n\`\`\`${m.chat}\`\`\``
        },
        footer: { text: 'Gunakan tombol di bawah untuk menyalin ID' },
        nativeFlowMessage: {
          buttons: [
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: '📋 Salin ID Grup',
                copy_code: m.chat
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
