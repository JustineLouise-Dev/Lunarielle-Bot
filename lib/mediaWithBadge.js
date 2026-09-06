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
// lib/mediaWithBadge.js

import { config } from '../settings.js'
import { parseChannelTarget } from './utils.js'

let cachedChannel
let cachedChannelPromise = null

async function resolveChannelInfo(sock) {
  if (cachedChannel !== undefined) return cachedChannel
  if (cachedChannelPromise) return cachedChannelPromise

  cachedChannelPromise = (async () => {
    try {
      const { invite, jid } = parseChannelTarget(config.channelUrl)
      if (!invite && !jid) {
        cachedChannel = null
        return cachedChannel
      }

      const metadata = jid
        ? await sock.newsletter.fetch(jid)
        : await sock.newsletter.fetchByInvite(invite)

      cachedChannel = { jid: metadata.jid, name: metadata.name }
    } catch (e) {

      console.error('[MEDIA BADGE] Gagal ambil metadata channel, badge dilewati:', e.message || e)
      cachedChannel = null
    }
    return cachedChannel
  })()

  const result = await cachedChannelPromise
  cachedChannelPromise = null
  return result
}

async function buildBadgeContextInfo(sock) {
  const channel = await resolveChannelInfo(sock)
  if (!channel) return undefined

  return {
    mentionedJid: [],
    groupMentions: [],
    statusAttributions: [],
    forwardingScore: 1,
    isForwarded: true,
    forwardOrigin: 0,
    forwardedNewsletterMessageInfo: {
      newsletterJid: channel.jid,
      newsletterName: channel.name,
      serverMessageId: 0
    }
  }
}

export async function sendAudioWithBadge(sock, m, buffer, extra = {}) {
  const { caption, mimetype = 'audio/mpeg', ptt = false, ...rest } = extra
  const contextInfo = await buildBadgeContextInfo(sock)

  return sock.message.send(m.chat, {
    type: 'audio',
    media: buffer,
    mimetype,
    ptt,
    ...(caption ? { caption } : {}),
    ...(contextInfo ? { contextInfo } : {}),
    ...rest
  }, { quote: m.raw })
}

export async function sendVideoWithBadge(sock, m, buffer, extra = {}) {
  const { caption, mimetype = 'video/mp4', ...rest } = extra
  const contextInfo = await buildBadgeContextInfo(sock)

  return sock.message.send(m.chat, {
    type: 'video',
    media: buffer,
    mimetype,
    ...(caption ? { caption } : {}),
    ...(contextInfo ? { contextInfo } : {}),
    ...rest
  }, { quote: m.raw })
}
