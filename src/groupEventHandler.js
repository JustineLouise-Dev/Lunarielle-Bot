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
// src/groupEventHandler.js

import chalk from 'chalk'
import {
  hasGroupMetadata,
  patchGroupMetadata,
  invalidateGroupMetadata,
  getGroupMetadata
} from '../db/groupCache.js'
import { handleGroupParticipantsUpdate } from '../lib/welcome.js'

const PARTICIPANT_ACTIONS = new Set(['add', 'remove', 'promote', 'demote'])
const GROUP_METADATA_EVENTS_NEEDING_REFRESH = new Set([
  'subject',
  'photo',
  'group_code',
  'group_description'
])

function patchParticipants(jid, action, participants) {
  return patchGroupMetadata(jid, (metadata) => {
    if (!Array.isArray(metadata.participants)) return

    const targetJids = action !== 'add' ? new Set(participants.map((p) => p.jid)) : null

    switch (action) {
      case 'add':
        for (const p of participants) {
          if (!metadata.participants.some((mp) => mp.jid === p.jid)) {
            metadata.participants.push({
              jid: p.jid,
              type: 'participant',
              isAdmin: false,
              isSuperAdmin: false,
              phoneNumber: p.phoneJid,
              displayName: p.displayName,
              username: p.username,
              expirationSeconds: p.expirationSeconds
            })
          }
        }
        break

      case 'remove':
        metadata.participants = metadata.participants.filter((mp) => !targetJids.has(mp.jid))
        break

      case 'promote':
        for (const mp of metadata.participants) {
          if (targetJids.has(mp.jid)) {
            mp.isAdmin = true
            mp.type = 'admin'
          }
        }
        break

      case 'demote':
        for (const mp of metadata.participants) {
          if (targetJids.has(mp.jid)) {
            mp.isAdmin = false
            mp.type = 'participant'
          }
        }
        break
    }

    if (typeof metadata.size === 'number') {
      metadata.size = metadata.participants.length
    }
  })
}

export function groupEventHandler(sock) {
  sock.on('group', async (event) => {
    const jid = event?.groupJid || event?.chatJid
    if (!jid) return

    if (!hasGroupMetadata(jid)) return

    const action = String(event?.action || '').toLowerCase()
    const participants = event?.participants || []

    if (PARTICIPANT_ACTIONS.has(action) && participants.length) {

      if (action === 'add' || action === 'remove') {
        handleGroupParticipantsUpdate(sock, { groupJid: jid, participants, action }).catch((err) => {
          console.error(chalk.red('[WELCOME/LEFT] Gagal memproses event:'), err?.message || err)
        })
      }

      const patched = patchParticipants(jid, action, participants)
      if (patched) {
        console.log(
          chalk.blue(
            `[GROUP CACHE] Patch participants (${action}) di ${jid} oleh ${event.authorJid || 'unknown'}`
          )
        )
        return
      }
    }

    const needsFullRefresh = GROUP_METADATA_EVENTS_NEEDING_REFRESH.has(action)
    invalidateGroupMetadata(jid)
    await getGroupMetadata(jid, sock, { force: needsFullRefresh })
    console.log(chalk.blue(`[GROUP CACHE] ${needsFullRefresh ? 'Refetch' : 'Update'} metadata (action: ${action || 'unknown'}) di ${jid}`))
  })
}
