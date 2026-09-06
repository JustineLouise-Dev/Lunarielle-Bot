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
// plugins/group/setwelcome.js

import { setGroupSetting } from '../../db/groupSettings.js'
import { formatWelcomeTemplate } from '../../lib/welcome.js'
import { getCachedGroupMetadata } from '../../db/groupCache.js'

function extractBody(m) {
  const rawText = m.text || ''
  const marker = `${m.prefix}${m.command}`
  const idx = rawText.toLowerCase().indexOf(marker.toLowerCase())
  if (idx === -1) return rawText.trim()
  return rawText.slice(idx + marker.length).trim()
}

export default {
  command: 'setwelcome',
  category: 'group',
  description: 'Mengatur teks sambutan otomatis untuk member baru (mendukung $subject, $user, $desc, $members).',
  groupOnly: true,
  adminOnly: true,
  typing: true,

  async execute(m, { args }) {
    const bodyText = extractBody(m) || args.join(' ').trim()

    if (!bodyText) {
      return m.reply(
        `⚠️ Sertakan teks sambutannya. Contoh:\n` +
        `\`${m.prefix}setwelcome Halo $user, selamat datang di $subject!\`\n\n` +
        `Placeholder: $subject, $user, $desc, $members`
      )
    }

    setGroupSetting(m.chat, 'welcomeText', bodyText)

    const metadata = getCachedGroupMetadata(m.chat)
    const preview = formatWelcomeTemplate(bodyText, {
      groupName: metadata?.subject || '-',
      groupDesc: metadata?.desc || '-',
      userJid: m.sender,
      memberCount: metadata?.participants?.length ?? '-'
    })

    await m.reply(`✅ Teks Welcome berhasil disimpan.\n\n📄 Contoh hasil (preview):\n${preview}`)
  }
}
