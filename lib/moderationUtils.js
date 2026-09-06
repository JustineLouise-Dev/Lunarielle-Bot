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
// lib/moderationUtils.js

function normalizeNumberToJid(raw) {
  const digits = String(raw || '').replace(/[^0-9]/g, '')
  if (!digits) return null
  return `${digits}@s.whatsapp.net`
}

export function resolveTargetJid(m, args) {
  const mentioned = m.mentionedJid || []
  const repliedParticipant = m.quoted?.sender

  if (mentioned[0]) return mentioned[0]
  if (repliedParticipant) return repliedParticipant

  const firstArg = args[0] || ''
  if (firstArg.startsWith('@')) {
    return normalizeNumberToJid(firstArg.slice(1))
  }
  if (/^\d+$/.test(firstArg)) {
    return normalizeNumberToJid(firstArg)
  }
  return null
}
