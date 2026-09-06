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
// lib/messageStyle.js

export const DIVIDER = '┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈'

export function header(title) {
  return `✦ *${title}* ✦`
}

export function footer(text) {
  return `✦ ${text} ✦`
}

export function infoLine(emoji, label, value, padLength = 8) {
  const paddedLabel = String(label).padEnd(padLength, ' ')
  return `${emoji} ${paddedLabel}·  ${value}`
}

export const STATUS_BADGE = {
  pending: '⏳ Pending',
  accepted: '✅ Diterima',
  rejected: '❌ Ditolak'
}

export function listItem(index, statusText, bodyLines = []) {
  const lines = [`*${index}.* ${statusText}`]
  for (const l of bodyLines) lines.push(`    ${l}`)
  return lines.join('\n')
}

export function formatDateID(ms, opts = { dateStyle: 'medium', timeStyle: 'short' }) {
  return new Date(ms).toLocaleString('id-ID', opts)
}

export function formatUptime(seconds) {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const parts = []
  if (d) parts.push(`${d}h`)
  if (h) parts.push(`${h}j`)
  if (m) parts.push(`${m}m`)
  if (!d && !h) parts.push(`${s}d`)
  return parts.length ? parts.join(' ') : '0d'
}
