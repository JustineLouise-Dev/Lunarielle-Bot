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
// plugins/owner/function.js

import { resolveMediaTarget, getQuotedPlainText } from '../../lib/mediaHelper.js'
import {
    addFunctionTrigger,
    listFunctionTriggers,
    removeFunctionTrigger
} from '../../db/aiStore.js'

function mediaTypeFromMime(mime = '') {
    if (mime === 'image/webp') return 'sticker'
    if (mime.startsWith('image/')) return 'image'
    if (mime.startsWith('video/')) return 'video'
    if (mime.startsWith('audio/')) return 'audio'
    return 'document'
}

const MEDIA_TYPE_LABEL = {
    text: 'teks',
    sticker: 'stiker',
    image: 'gambar',
    video: 'video',
    audio: 'audio/voice note',
    document: 'dokumen'
}

export default {
    command: 'function',
    alias: ['fungsi', 'aiaction'],
    category: 'owner',
    description:
        'Mendaftarkan aksi kontekstual untuk auto AI (.lunar): reply APA PUN — ' +
        'teks, stiker, gambar, video, audio/voice note, atau dokumen — lalu ' +
        'ketik `.function <kapan aksi ini dipakai>`.\n\n' +
        '*Contoh:*\n' +
        '> (reply stiker) `.function saat kamu merasa kurang nyaman kirim stiker ini, ' +
        'tapi jangan setiap chat, gunakan sesekali saja`\n' +
        '> (reply teks "Sabar ya, aku di sini kok") `.function kalau lawan bicara ' +
        'kelihatan sedih atau capek`\n\n' +
        '*Lihat daftar:* `.function list` atau `.listfunction`\n' +
        '*Hapus:* `.function del <id>` atau `.delfunction <id>`',
    help: '`(reply teks/media)` `<prompt kondisi>` / `list` / `del <id>`',
    owner: true,
    typing: true,

    async execute(m, { args, text }) {
        const sub = (args[0] || '').toLowerCase()

        if (sub === 'list') {
            const fns = listFunctionTriggers()

            if (!fns.length) {
                return m.reply('📭 Belum ada function call yang didaftarkan.\n\nReply teks/media apa pun lalu ketik `.function <prompt>`.')
            }

            const lines = fns.map((f, i) => {
                const jenis = MEDIA_TYPE_LABEL[f.mediaType] || f.mediaType
                const preview = f.mediaType === 'text' && f.textContent
                    ? `\n   Isi: "${f.textContent.slice(0, 60)}${f.textContent.length > 60 ? '...' : ''}"`
                    : ''
                return `*${i + 1}.* \`${f.id}\`\n   Jenis: ${jenis}${preview}\n   Kondisi: ${f.prompt}`
            })

            return m.reply(`🧩 *Daftar Function Call*\n\n${lines.join('\n\n')}`)
        }

        if (sub === 'del' || sub === 'delete' || sub === 'hapus') {
            const id = args[1]

            if (!id) {
                return m.reply('⚠️ Sertakan id function yang mau dihapus. Lihat `.function list` dulu.')
            }

            const removed = removeFunctionTrigger(id)

            return m.reply(
                removed
                    ? `🗑️ Function \`${id}\` berhasil dihapus.`
                    : `⚠️ Function dengan id \`${id}\` tidak ditemukan.`
            )
        }

        const prompt = text.trim()

        if (!prompt) {
            return m.reply(
                '⚠️ Sertakan prompt/kondisi kapan aksi ini dipakai.\n\n' +
                'Contoh: reply teks, stiker, gambar, video, audio, atau dokumen apa pun, lalu ketik:\n' +
                '`.function saat kamu merasa kurang nyaman kirim ini, tapi jangan setiap chat`'
            )
        }

        if (!m.quoted) {
            return m.reply(
                '⚠️ Reply dulu pesan yang mau dijadikan aksi — bisa teks, stiker, gambar, video, ' +
                'audio/voice note, atau dokumen — baru ketik `.function <prompt kondisi>`.'
            )
        }

        const target = resolveMediaTarget(m)

        if (target) {
            const mediaType = mediaTypeFromMime(target.mime)

            let buffer
            try {
                buffer = await target.download()
            } catch (e) {
                console.error('[FUNCTION ERROR] Gagal mengunduh media:', e)
                return m.reply('⚠️ Gagal mengunduh media yang di-reply. Coba kirim ulang.')
            }

            const fileName = mediaType === 'document'
                ? (m.quoted.message?.documentMessage?.fileName || 'file')
                : null

            const entry = addFunctionTrigger({
                prompt,
                mediaType,
                mediaBase64: buffer.toString('base64'),
                mimetype: target.mime,
                fileName
            })

            await m.reply(
                `✅ *Function call berhasil didaftarkan!*\n\n` +
                `🆔 ID: \`${entry.id}\`\n` +
                `📎 Jenis: ${MEDIA_TYPE_LABEL[mediaType] || mediaType}\n` +
                `💬 Kondisi: ${prompt}\n\n` +
                `AI sekarang akan mempertimbangkan mengirim ini sendiri kalau ` +
                `konteks obrolan cocok dengan kondisi di atas.`
            )
            return
        }

        const quotedText = getQuotedPlainText(m)

        if (!quotedText.trim()) {
            return m.reply(
                '⚠️ Pesan yang di-reply tidak punya teks maupun media yang bisa dipakai. ' +
                'Reply teks, stiker, gambar, video, audio, atau dokumen, baru ketik `.function <prompt kondisi>`.'
            )
        }

        const entry = addFunctionTrigger({
            prompt,
            mediaType: 'text',
            textContent: quotedText.trim()
        })

        await m.reply(
            `✅ *Function call berhasil didaftarkan!*\n\n` +
            `🆔 ID: \`${entry.id}\`\n` +
            `📎 Jenis: teks\n` +
            `📝 Isi: "${quotedText.trim().slice(0, 100)}${quotedText.trim().length > 100 ? '...' : ''}"\n` +
            `💬 Kondisi: ${prompt}\n\n` +
            `AI sekarang akan mempertimbangkan mengirim teks ini sendiri kalau ` +
            `konteks obrolan cocok dengan kondisi di atas.`
        )
    }
}
