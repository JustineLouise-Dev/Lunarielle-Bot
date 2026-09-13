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
// lib/utils.js

import util from 'util'

const MAX_OUTPUT_LENGTH = 20000
const MAX_ERROR_LENGTH = 3000

export function formatBytes(bytes, decimals = 2) {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0) return 'Baru saja'
  const units = [[86_400_000, 'hari'], [3_600_000, 'jam'], [60_000, 'menit'], [1000, 'detik']]
  const parts = []
  let rem = Math.floor(ms)
  for (const [unitMs, label] of units) {
    const val = Math.floor(rem / unitMs)
    if (val > 0) { parts.push(`${val} ${label}`); rem %= unitMs }
  }
  return parts.join(', ') || '0 detik'
}

export function buildQuoteContext(m) {
  return {
    stanzaId: m.id,
    participant: m.sender,
    remoteJid: m.chat,
    quotedMessage: m.message,
    mentionedJid: [m.sender]
  }
}

export function getQuotedText(quoted) {
  const msg = quoted?.message
  if (!msg) return ''
  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    msg.documentMessage?.caption ||
    ''
  )
}

function parsePhoneJid(rawNumber) {
  const digits = String(rawNumber || '').replace(/[^0-9]/g, '')
  return digits ? `${digits}@s.whatsapp.net` : null
}

export function extractTargetJid(m, args = []) {
  const mentioned = (m.mentionedJid || []).find(jid => !jid.endsWith('@g.us') && !jid.endsWith('@newsletter'))
  if (mentioned) return mentioned

  if (m.quoted?.sender && !m.quoted.sender.endsWith('@g.us')) return m.quoted.sender

  const raw = args.find(arg => /^@?\d{8,20}$/.test(arg) || /^\d+@(s\.whatsapp\.net|lid)$/.test(arg))
  if (!raw) return null

  const cleaned = raw.replace(/^@/, '')
  return cleaned.includes('@') ? cleaned : parsePhoneJid(cleaned)
}

export function extractFeatureTarget(m, args = []) {
  const featureName = args[0]?.toLowerCase()

  if (!featureName || featureName.startsWith('-')) {
    return { error: `Masukkan nama fitur dan targetnya.\nContoh: \`${m.prefix}${m.command} safelinku 628xxx\`\n\nTarget bisa lewat @mention, reply pesan, atau ketik nomor langsung.` }
  }

  const target = extractTargetJid(m, args.slice(1))
  if (!target) return { error: '❌ Target tidak terdeteksi. Mention, reply pesan dia, atau ketik nomornya langsung.' }

  const plugin = global.plugins?.get(featureName)
  if (!plugin) return { error: `❌ Fitur \`${featureName}\` tidak ditemukan.` }

  return { featureName, target, plugin }
}

export function parseChannelTarget(raw) {
  const text = String(raw || '').trim()

  if (!text) {
    return { invite: null, jid: null }
  }

  if (/^\d+@newsletter$/.test(text)) {
    return { invite: null, jid: text }
  }

  const match = text.match(/whatsapp\.com\/channel\/([A-Za-z0-9]+)/)
  if (match) {
    return { invite: match[1], jid: null }
  }

  if (/^[A-Za-z0-9]+$/.test(text)) {
    return { invite: text, jid: null }
  }

  return { invite: null, jid: null }
}

export function transformImports(code) {
  let result = code

  result = result.replace(
    /import\s*\*\s*as\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g,
    `const $1 = await importModule('$2');`
  )

  result = result.replace(
    /import\s+(\w+)\s*,\s*\{([^}]+)\}\s*from\s+['"]([^'"]+)['"];?/g,
    `const { default: $1, $2 } = await importModule('$3');`
  )

  result = result.replace(
    /import\s+(\w+)\s+from\s+['"]([^'"]+)['"];?/g,
    `const $1 = (await importModule('$2')).default;`
  )

  result = result.replace(
    /import\s*\{\s*([^}]+)\s*\}\s*from\s+['"]([^'"]+)['"];?/g,
    `const { $1 } = await importModule('$2');`
  )

  result = result.replace(/^export\s+(default\s+)?/gm, '')
  result = result.replace(/^export\s+\{[^}]*\};?\s*$/gm, '')

  return result
}

export function createFakeConsole() {
  const consoleOutput = []

  const format = (...args) =>
    args
      .map((arg) =>
        typeof arg === 'object' && arg !== null
          ? util.inspect(arg, { depth: 3, colors: false })
          : String(arg)
      )
      .join(' ')

  const fakeConsole = {
    log: (...a) => { consoleOutput.push(format(...a)); console.log(...a) },
    error: (...a) => { consoleOutput.push(format(...a)); console.error(...a) },
    warn: (...a) => { consoleOutput.push(format(...a)); console.warn(...a) }
  }

  return { consoleOutput, fakeConsole }
}

export function formatEvalResult(evaled, consoleOutput) {
  let output = ''
  if (consoleOutput.length > 0) output += `📜 Console:\n${consoleOutput.join('\n')}\n\n`

  if (evaled === undefined) {
    if (consoleOutput.length === 0) output += 'undefined'
  } else if (evaled === null) {
    output += 'null'
  } else if (Buffer.isBuffer(evaled)) {
    output += `<Buffer ${evaled.length} bytes>\n${evaled.slice(0, 200).toString('utf8')}`
  } else if (typeof evaled === 'object' || typeof evaled === 'function') {
    output += util.inspect(evaled, { depth: 4, colors: false })
  } else {
    output += String(evaled)
  }

  if (!output.trim()) output = 'Selesai (No Output)'
  if (output.length > MAX_OUTPUT_LENGTH) output = output.slice(0, MAX_OUTPUT_LENGTH) + '\n... (truncated)'

  return output
}

export function formatEvalError(err) {
  let errText = err?.stack || err?.message || String(err)
  if (errText.length > MAX_ERROR_LENGTH) errText = errText.slice(0, MAX_ERROR_LENGTH) + '\n... (truncated)'
  return errText
}

export async function executeAsyncCode(code, context) {
  const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor
  const names = Object.keys(context)
  const values = Object.values(context)

  let fn
  try {
    fn = new AsyncFunction(...names, `return (\n${code}\n)`)
  } catch {
    fn = new AsyncFunction(...names, code)
  }

  return fn(...values)
}

export function detectMediaType(mime) {
  if (!mime) return null
  if (mime.startsWith('image/')) return mime === 'image/webp' ? 'sticker' : 'image'
  if (mime.startsWith('video/')) return 'video'
  if (mime.startsWith('audio/')) return 'audio'
  if (/pdf|msword|officedocument/.test(mime)) return 'document'
  return 'file'
}

export function isLongLike(value) {
  if (!value || typeof value !== 'object') return false
  if (typeof value.toNumber === 'function') return true
  return typeof value.low === 'number' && typeof value.high === 'number' && typeof value.unsigned === 'boolean'
}

const MEDIA_BYTE_FIELDS = ['mediaKey', 'fileSha256', 'fileEncSha256']

function looksLikeBase64(value) {
  return value.length > 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(value)
}

export function reviveBase64Fields(value) {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(reviveBase64Fields)
  if (Buffer.isBuffer(value) || value instanceof Uint8Array) return value
  if (isLongLike(value)) return value
  const out = {}
  for (const [key, val] of Object.entries(value)) {
    out[key] =
      typeof val === 'string' && MEDIA_BYTE_FIELDS.includes(key) && looksLikeBase64(val)
        ? Buffer.from(val, 'base64')
        : reviveBase64Fields(val)
  }
  return out
}

export function jidDigits(jid) {
  return String(jid || '').split('@')[0].replace(/[^0-9]/g, '') || null
}

export function getCommandAliases(command) {
  const aliases = []
  for (const [key, plugin] of global.plugins ?? []) {
    if (plugin.command === command && key !== command) aliases.push(key)
  }
  return aliases
}
