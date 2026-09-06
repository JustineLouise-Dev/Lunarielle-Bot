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
// plugins/owner/fakereply.js

import crypto from 'crypto'

function normalizeNumberToJid(raw) {
  const digits = String(raw || '').replace(/[^0-9]/g, '')
  if (!digits) return null
  return `${digits}@s.whatsapp.net`
}

function resolveFakeSenderJid(m, rawTag) {
  const mentioned = m.mentionedJid || []
  const repliedParticipant = m.quoted?.sender

  if (mentioned[0]) return mentioned[0]
  if (repliedParticipant) return repliedParticipant

  const cleanedTag = String(rawTag || '').trim().replace(/^@/, '')
  if (/^\d+$/.test(cleanedTag)) return normalizeNumberToJid(cleanedTag)

  return null
}

function parseArgs(rawInput) {
  const parts = rawInput.split('|')
  if (parts.length < 3) return null

  const tag = parts[0].trim()
  const isiReply = parts[1].trim()
  const isiText = parts.slice(2).join('|').trim()

  if (!tag || !isiReply || !isiText) return null
  return { tag, isiReply, isiText }
}

export default {
  command: 'fakereply',
  alias: ['freply'],
  category: 'owner',
  description:
    'Membuat pesan bot yang seolah-olah me-reply pesan orang lain (yang sebenarnya tidak pernah ada). ' +
    'Format: `.fakereply @tag|isireply|isi text bot`. Contoh: `.fakereply @liuz|haloo|halo jugaaa`.',
  help: '`<@tag>` `|` `<isi reply>` `|` `<isi text bot>`',
  onlyOwner: true,

  async execute(m, { sock, args }) {
    const rawInput = args.join(' ').trim()
    const parsed = parseArgs(rawInput)
    if (!parsed) {
      return m.reply(
        '⚠️ Format salah.\n\n' +
        'Gunakan: `.fakereply @tag|isireply|isi text bot`\n' +
        'Contoh: `.fakereply @liuz|haloo|halo jugaaa`\n\n' +
        '• *@tag* — siapa yang "mengirim" pesan yang di-reply (bisa mention asli, reply pesan seseorang, atau nomor manual)\n' +
        '• *isireply* — isi pesan palsu yang seolah-olah dikirim tag tsb\n' +
        '• *isi text bot* — balasan bot ke pesan palsu itu'
      )
    }

    const { tag, isiReply, isiText } = parsed
    const fakeSenderJid = resolveFakeSenderJid(m, tag)
    const displayName = tag.replace(/^@/, '')

    const fakeQuotedMessage = { conversation: isiReply }

    const contextInfo = {
      stanzaId: `fake-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
      participant: fakeSenderJid || normalizeNumberToJid('0') || `${displayName}@s.whatsapp.net`,
      quotedMessage: fakeQuotedMessage
    }

    if (fakeSenderJid) {
      contextInfo.mentionedJid = [fakeSenderJid]
    }

    try {
      return await sock.message.send(
        m.chat,
        { extendedTextMessage: { text: isiText, contextInfo } },
        fakeSenderJid ? { mentions: [fakeSenderJid] } : {}
      )
    } catch (e) {
      console.error('[FAKEREPLY ERROR] Gagal mengirim fake reply:', e)
      return m.reply('⚠️ Gagal membuat fake reply. Coba lagi.')
    }
  }
}
