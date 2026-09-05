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
// plugins/owner/untrust.js

import { removeTrustedUser } from '../../db/trustedFeatures.js'
import { getPushNameByJid } from '../../db/contacts.js'
import { extractFeatureTarget } from '../../lib/utils.js'

export default {
  command: 'untrust',
  alias: ['untrustuser'],
  category: 'owner',
  description: 'Menghapus izin user tertentu untuk fitur yang sudah di-trust.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `.untrust <fitur/alias> <target>`\n\n' +
    '*Target bisa berupa:* @mention, reply pesan dia, atau ketik nomornya langsung',
  help: '`<fitur>` `<@mention/reply/nomor>`',
  onlyOwner: true,
  typing: true,

  async execute(m, { args }) {
    const { error, target, plugin } = extractFeatureTarget(m, args)
    if (error) return m.reply(error)

    const { removed } = removeTrustedUser(target, plugin.command)
    const label = getPushNameByJid(target) || target

    m.reply(removed
      ? `✅ Trust dihapus.\n\n👤 *User:* ${label}\n🔧 *Fitur:* \`${plugin.command}\``
      : `⚠️ User ini memang tidak pernah di-trust untuk fitur \`${plugin.command}\`.`)
  }
}
