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
// plugins/owner/addrespon.js

import { addAddresponItem } from '../../db/addresponStore.js'
import { jidDigits } from '../../lib/utils.js'

const EXT_BY_MIME = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  'video/3gpp': '3gp',
  'audio/ogg': 'ogg',
  'audio/ogg; codecs=opus': 'ogg',
  'audio/mpeg': 'mp3',
  'audio/mp4': 'm4a',
  'audio/aac': 'aac',
  'application/pdf': 'pdf'
}

function guessExt(mimetype, fileName) {
  if (fileName && fileName.includes('.')) {
    const fromName = fileName.split('.').pop()
    if (fromName && fromName.length <= 6) return fromName.toLowerCase()
  }
  if (mimetype && EXT_BY_MIME[mimetype]) return EXT_BY_MIME[mimetype]
  if (mimetype) {
    const sub = mimetype.split(';')[0].split('/')[1]
    if (sub) return sub.toLowerCase()
  }
  return 'bin'
}

function identifyQuotedContent(m) {
  const q = m.quoted
  if (!q) return null

  if (!q.isMedia) {
    return { type: 'text', text: q.text || '', mimetype: null, fileName: null }
  }

  const rawContent = q.full?.[q.type] || {}

  if (q.type === 'imageMessage') {
    return { type: 'image', text: rawContent.caption || '', mimetype: q.mime || 'image/jpeg', fileName: null }
  }
  if (q.type === 'stickerMessage') {
    return { type: 'sticker', text: '', mimetype: q.mime || 'image/webp', fileName: null }
  }
  if (q.type === 'videoMessage') {
    return { type: 'video', text: rawContent.caption || '', mimetype: q.mime || 'video/mp4', fileName: null }
  }
  if (q.type === 'audioMessage') {
    return { type: 'audio', text: '', mimetype: q.mime || 'audio/ogg', fileName: null }
  }
  if (q.type === 'documentMessage') {
    return {
      type: 'document',
      text: rawContent.caption || '',
      mimetype: q.mime || 'application/octet-stream',
      fileName: rawContent.fileName || null
    }
  }

  return null
}

function resolveMentionTrigger(m, rawTrigger) {
  const mentioned = m.mentionedJid || []
  if (!mentioned.length) return rawTrigger

  let mentionIdx = 0
  return rawTrigger.replace(/@\S+/g, (token) => {
    const jid = mentioned[mentionIdx]
    mentionIdx += 1
    if (!jid) return token
    const digits = jidDigits(jid)
    return digits ? `@${digits}` : token
  })
}

export default {
  command: 'addrespon',
  alias: ['addresponse'],
  category: 'owner',
  description:
    'Reply pesan (teks/gambar/stiker/voice note/video/dokumen) dengan `.addrespon <trigger>` untuk menambahkannya sebagai auto-respon. ' +
    'Trigger boleh berisi mention (tag @nama dari kontak, atau ketik manual @nomor) -- otomatis diseragamkan ke nomor asli. ' +
    'Satu trigger boleh punya lebih dari satu respon -- panggil `.addrespon` beberapa kali dengan trigger yang sama untuk menambah respon lain.',
  help: '`(reply)` `<trigger>`',
  onlyOwner: true,

  async execute(m, { sock, args }) {
    const rawTrigger = args.join(' ').trim()
    const trigger = resolveMentionTrigger(m, rawTrigger)
    if (!trigger) {
      return m.reply(
        '⚠️ Reply pesan yang mau dijadikan respon (teks/gambar/stiker/voice note/video/dokumen), ' +
        'lalu ketik `.addrespon <trigger>`.\n\n' +
        'Contoh:\n' +
        '`.addrespon hai` (reply gambar/stiker/vn/teks apa pun)\n\n' +
        'Nanti setiap user mengirim pesan "hai" ke bot, bot otomatis membalas dengan pesan yang kamu simpan tadi.'
      )
    }

    if (!m.quoted) {
      return m.reply(
        '⚠️ Kamu harus me-*reply* pesan yang mau dijadikan respon, bukan mengirim `.addrespon` sendirian.\n' +
        'Reply pesan (teks/gambar/stiker/voice note/video/dokumen) dengan caption `.addrespon <trigger>`.'
      )
    }

    const content = identifyQuotedContent(m)
    if (!content) {
      return m.reply('⚠️ Jenis pesan yang di-reply belum didukung untuk dijadikan auto-respon.')
    }

    if (content.type === 'text') {
      const { trigger: triggerEntry } = addAddresponItem({
        trigger,
        type: 'text',
        text: content.text,
        createdBy: m.sender
      })

      const totalRespon = triggerEntry.items.length
      return m.reply(
        `✅ Auto-respon berhasil ditambahkan!\n\n` +
        `🔑 Trigger: *${triggerEntry.trigger}*\n` +
        `📄 Jenis: Teks\n` +
        `📦 Total respon untuk trigger ini: *${totalRespon}*\n\n` +
        `Sekarang setiap user yang mengirim pesan persis "*${triggerEntry.trigger}*" ke bot akan otomatis dibalas dengan ${totalRespon > 1 ? `${totalRespon} pesan ini secara berurutan.` : 'pesan ini.'}`
      )
    }

    let mediaBuffer
    try {
      mediaBuffer = await m.quoted.download()
    } catch (e) {
      console.error('[ADDRESPON ERROR] Gagal mengunduh media:', e)
      return m.reply(
        '⚠️ Gagal mengunduh media dari pesan yang di-reply.\n' +
        'Kemungkinan media sudah kedaluwarsa/dihapus, atau bot tidak sempat menyimpan pesan tersebut.'
      )
    }

    if (!mediaBuffer || !mediaBuffer.length) {
      return m.reply('⚠️ Media kosong / gagal diproses.')
    }

    const ext = guessExt(content.mimetype, content.fileName)

    const { trigger: triggerEntry, item } = addAddresponItem({
      trigger,
      type: content.type,
      text: content.text,
      mediaBuffer,
      ext,
      mimetype: content.mimetype,
      createdBy: m.sender
    })

    const typeLabel = {
      image: 'Gambar',
      sticker: 'Stiker',
      video: 'Video',
      audio: 'Audio (akan dikirim sebagai voice note)',
      document: 'Dokumen'
    }[item.type] || item.type

    const totalRespon = triggerEntry.items.length
    return m.reply(
      `✅ Auto-respon berhasil ditambahkan!\n\n` +
      `🔑 Trigger: *${triggerEntry.trigger}*\n` +
      `📄 Jenis: ${typeLabel}\n` +
      `📦 Total respon untuk trigger ini: *${totalRespon}*\n\n` +
      `Sekarang setiap user yang mengirim pesan persis "*${triggerEntry.trigger}*" ke bot akan otomatis dibalas dengan ${totalRespon > 1 ? `${totalRespon} pesan ini secara berurutan.` : 'pesan ini.'}`
    )
  }
}
