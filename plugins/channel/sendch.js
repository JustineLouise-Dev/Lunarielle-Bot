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
// plugins/channel/sendch.js

import { parseChannelTarget, getQuotedText } from '../../lib/utils.js'
import { downloadQuotedMedia } from '../../lib/wrapper.js'

const MEDIA_TYPE_MAP = {
    imageMessage: 'image',
    videoMessage: 'video',
    audioMessage: 'audio',
    documentMessage: 'document',
    stickerMessage: 'sticker'
}

export default async function sendch(m, { conn, args }) {
    if (!m.quoted) {
        return m.reply('❌ Reply pesan yang mau dikirim ke channel dulu ya kak.')
    }

    const raw = args.join(' ')
    const { invite, jid: parsedJid } = parseChannelTarget(raw)

    if (!invite && !parsedJid) {
        return m.reply(
            `Kirim link atau JID channel tujuan!\n\n` +
            `Contoh:\n` +
            `> \`${m.prefix}${m.command} <url channel>\`\n` +
            `> \`${m.prefix}${m.command} <jid channel>\``
        )
    }

    let targetJid = parsedJid
    let channelName = null

    try {
        const metadata = targetJid
            ? await conn.newsletterMetadata('jid', targetJid)
            : await conn.newsletterMetadata('invite', invite)
        targetJid = metadata.id || metadata.jid
        channelName = metadata.name
    } catch {
        return m.reply('❌ Link/JID channel tidak valid atau channel tidak ditemukan.')
    }

    const msgContent = m.quoted.message

    if (!msgContent || Object.keys(msgContent).length === 0) {
        return m.reply('❌ Isi pesan kosong, gak ada yang bisa dikirim.')
    }

    const msgType = Object.keys(msgContent)[0]
    const mediaKind = MEDIA_TYPE_MAP[msgType]

    let sendPayload

    if (mediaKind) {
        const mediaField = msgContent[msgType]

        let mediaBuffer
        try {
            mediaBuffer = await downloadQuotedMedia(m.quoted)
        } catch (err) {
            return m.reply(`❌ Gagal download media: ${err.message}`)
        }

        sendPayload = {
            [mediaKind]: mediaBuffer,
            mimetype: mediaField.mimetype,
            caption: mediaField.caption || undefined
        }

        if (mediaKind === 'sticker') {

            sendPayload = { sticker: mediaBuffer }
        }
    } else if (msgType === 'conversation' || msgType === 'extendedTextMessage') {
        const text = getQuotedText(m.quoted)
        if (!text) {
            return m.reply('❌ Isi pesan kosong, gak ada yang bisa dikirim.')
        }
        sendPayload = { text }
    } else {
        return m.reply(`❌ Tipe pesan \`${msgType}\` belum didukung untuk dikirim ke channel.`)
    }

    try {
        await conn.sendMessage(targetJid, sendPayload)
    } catch (err) {
        return m.reply(`❌ Gagal kirim ke channel: ${err.message}`)
    }

    await m.reply(`✅ Berhasil dikirim ke channel${channelName ? `:\n*${channelName}*` : ''}`)
}

sendch.command = 'sendch'
sendch.alias = ['sendchanel', 'sendchannel', 'sch']
sendch.category = 'channel'
sendch.description = 'Mengirim ulang pesan yang di-reply ke channel WhatsApp.\n\n' +
    '*Format Penggunaan:*\n' +
    '> `Mengirim ke URL channel`\n> .sendch <url channel>\n\n' +
    '> `Mengirim ke JID channel`\n> .sendch <jid channel>\n\n' +
    '`(reply pesan)`'
sendch.owner = true
sendch.typing = true
