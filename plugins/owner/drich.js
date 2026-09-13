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
// plugins/owner/drich.js

import { getRichMessages, deleteRawMessageRecord } from '../../db/rawMessage.js'
import { refreshBotAdminStatus } from '../../db/groupCache.js'

const SCOPE_ALIASES = {
  group: 'group',
  grup: 'group',
  groups: 'group',
  g: 'group',
  private: 'private',
  privat: 'private',
  pribadi: 'private',
  pv: 'private',
  p: 'private',
  all: 'all',
  semua: 'all',
  a: 'all'
}

const SCOPE_LABEL = {
  group: 'grup',
  private: 'private',
  all: 'grup & private'
}

async function canRevokeInGroup(jid, sock) {
  try {
    return !!(await refreshBotAdminStatus(jid, sock))
  } catch {
    return false
  }
}

export default {
  command: 'drich',
  alias: ['deleterich'],
  category: 'owner',
  description:
    'Menghapus (revoke) seluruh pesan richmessage (game/interactive seperti Snake, Chess, Piano, dsb) ' +
    'yang pernah dikirim bot, baik di grup, private, atau keduanya.\n\n' +
    '*Format Penggunaan:*\n' +
    '> .drich group\n> .drich private\n> .drich all',
  help: '`group` `/` `private` `/` `all`',
  onlyOwner: true,
  typing: true,

  async execute(m, { sock, args }) {
    const rawScope = String(args?.[0] || '').toLowerCase().trim()
    const scope = SCOPE_ALIASES[rawScope]

    if (!scope) {
      return m.reply(
        '⚠️ Pilih target penghapusan.\n\n' +
        'Gunakan:\n' +
        `\`${m.prefix}drich group\` — hapus richmessage di semua grup\n` +
        `\`${m.prefix}drich private\` — hapus richmessage di semua chat private\n` +
        `\`${m.prefix}drich all\` — hapus richmessage di grup & private sekaligus`
      )
    }

    const rows = getRichMessages(scope)

    if (!rows.length) {
      return m.reply(`ℹ️ Tidak ada richmessage yang tercatat untuk dihapus (target: ${SCOPE_LABEL[scope]}).`)
    }

    await m.reply(`🔄 Menghapus ${rows.length} richmessage (target: ${SCOPE_LABEL[scope]}), mohon tunggu...`)

    const groupAdminCache = new Map()

    let success = 0
    let failed = 0
    let skippedNotAdmin = 0
    const skippedGroups = new Set()

    for (const row of rows) {
      const isGroup = !!row.is_group

      if (isGroup) {
        if (!groupAdminCache.has(row.jid)) {
          groupAdminCache.set(row.jid, await canRevokeInGroup(row.jid, sock))
        }
        if (!groupAdminCache.get(row.jid)) {
          skippedNotAdmin++
          skippedGroups.add(row.jid)
          continue
        }
      }

      try {
        await sock.message.send(row.jid, {
          type: 'revoke',
          target: {
            remoteJid: row.jid,
            id: row.msg_id,
            fromMe: true,
            participant: undefined
          }
        })
        deleteRawMessageRecord(row.msg_id)
        success++
      } catch (err) {
        console.error('[DRICH ERROR]', row.jid, row.msg_id, err?.message || err)
        failed++
      }
    }

    let summary =
      `✅ *Selesai menghapus richmessage* (target: ${SCOPE_LABEL[scope]})\n\n` +
      `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n` +
      `↳ Berhasil dihapus : ${success}\n` +
      `↳ Gagal dihapus    : ${failed}\n`

    if (skippedNotAdmin) {
      summary += `↳ Dilewati (bot bukan admin) : ${skippedNotAdmin} pesan di ${skippedGroups.size} grup\n`
    }

    summary += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n✦ Khusus Owner ✦`

    return m.reply(summary)
  }
}
