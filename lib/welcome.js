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
// lib/welcome.js

import { getGroupSetting } from '../db/groupSettings.js'
import { getGroupMetadata } from '../db/groupCache.js'
import { config } from '../settings.js'

export const DEFAULT_WELCOME_TEXT =
  'Selamat datang $user di *$subject*! 👋\n\n' +
  '📝 Deskripsi grup:\n$desc\n\n' +
  'Semoga betah dan jangan lupa baca peraturan grup ya. Total member sekarang: $members'

export const DEFAULT_LEFT_TEXT =
  'Sampai jumpa $user 👋\n' +
  'Telah keluar dari *$subject*. Sisa member sekarang: $members'

function jidToDisplayName(jid) {
  const digits = String(jid || '').split('@')[0]
  return digits ? `@${digits}` : jid
}

export function formatWelcomeTemplate(template, { groupName, groupDesc, userJid, memberCount }) {
  const userMention = jidToDisplayName(userJid)
  const desc = (groupDesc || '-').trim() || '-'

  return String(template)
    .replaceAll('$subject', groupName || '-')
    .replaceAll('$group', groupName || '-')
    .replaceAll('$desc', desc)
    .replaceAll('$description', desc)
    .replaceAll('$user', userMention)
    .replaceAll('$mention', userMention)
    .replaceAll('$members', String(memberCount ?? '-'))
    .replaceAll('$count', String(memberCount ?? '-'))
}

const recentlyHandled = new Map()
const DEDUP_WINDOW_MS = 8000

function dedupKey(groupJid, participantJid, action) {
  return `${groupJid}::${participantJid}::${action}`
}

function shouldSkipAsDuplicate(groupJid, participantJid, action) {
  const key = dedupKey(groupJid, participantJid, action)
  const now = Date.now()
  const last = recentlyHandled.get(key)

  for (const [k, ts] of recentlyHandled) {
    if (now - ts > DEDUP_WINDOW_MS) recentlyHandled.delete(k)
  }

  if (last && now - last < DEDUP_WINDOW_MS) return true
  recentlyHandled.set(key, now)
  return false
}

function buildFooterText() {
  return `Created by ${config.ownerName || 'Justine Louise'}`
}

function buildWelcomeMessageContent(text) {
  return {
    interactiveMessage: {
      body: { text },
      footer: { text: buildFooterText() },
      nativeFlowMessage: { buttons: [] }
    }
  }
}

export async function handleGroupParticipantsUpdate(sock, { groupJid, participants, action }) {
  if (!groupJid?.endsWith('@g.us')) return
  if (action !== 'add' && action !== 'remove') return

  const settingKey = action === 'add' ? 'welcome' : 'left'
  const isEnabled = getGroupSetting(groupJid, settingKey, false)
  if (!isEnabled) return

  let metadata = null
  try {
    metadata = await getGroupMetadata(groupJid, sock)
  } catch (e) {
    console.error(`[WELCOME/LEFT] Gagal ambil groupMetadata untuk ${groupJid}:`, e?.message || e)
  }

  const groupName = metadata?.subject || groupJid.split('@')[0]
  const groupDesc = metadata?.desc || ''
  const memberCount = metadata?.participants?.length ?? '-'

  const templateKey = action === 'add' ? 'welcomeText' : 'leftText'
  const defaultTemplate = action === 'add' ? DEFAULT_WELCOME_TEXT : DEFAULT_LEFT_TEXT
  const template = getGroupSetting(groupJid, templateKey, defaultTemplate)

  for (const participant of participants) {
    const participantJid = participant?.jid || participant?.phoneJid
    if (!participantJid) {
      console.error(`[WELCOME/LEFT] Melewati satu participant di ${groupJid}: jid tidak ditemukan.`, participant)
      continue
    }

    if (shouldSkipAsDuplicate(groupJid, participantJid, action)) continue

    const text = formatWelcomeTemplate(template, {
      groupName,
      groupDesc,
      userJid: participantJid,
      memberCount
    })

    try {
      await sock.message.send(
        groupJid,
        buildWelcomeMessageContent(text),
        { mentions: [participantJid] }
      )
    } catch (e) {
      console.error(`[WELCOME/LEFT] Gagal mengirim pesan ${action} di ${groupJid}:`, e?.message || e)
    }
  }
}
