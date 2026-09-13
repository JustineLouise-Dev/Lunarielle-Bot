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
// lib/mediaHelper.js

import { downloadMediaMessage } from 'baileys'

const MEDIA_KEYS = ['imageMessage', 'videoMessage', 'stickerMessage', 'audioMessage', 'documentMessage']

function unwrapMessage(message) {
    let msg = message
    while (msg) {
        if (msg.ephemeralMessage?.message) { msg = msg.ephemeralMessage.message; continue }
        if (msg.viewOnceMessage?.message) { msg = msg.viewOnceMessage.message; continue }
        if (msg.viewOnceMessageV2?.message) { msg = msg.viewOnceMessageV2.message; continue }
        if (msg.viewOnceMessageV2Extension?.message) { msg = msg.viewOnceMessageV2Extension.message; continue }
        break
    }
    return msg || {}
}

export function resolveMediaTarget(m) {

    if (m.quoted?.message) {
        const msg = unwrapMessage(m.quoted.message)
        const type = MEDIA_KEYS.find(k => msg[k])

        if (type) {
            const content = msg[type]
            return {
                mime: content.mimetype || '',
                seconds: content.seconds,
                isAnimatedSticker: type === 'stickerMessage' && !!content.isAnimated,
                download: () => downloadMediaMessage(
                    { message: m.quoted.message, key: m.quoted.key },
                    'buffer',
                    {}
                )
            }
        }
    }

    const ownMsg = unwrapMessage(m.message)
    const ownType = MEDIA_KEYS.find(k => ownMsg[k])

    if (ownType) {
        const content = ownMsg[ownType]
        return {
            mime: content.mimetype || '',
            seconds: content.seconds,
            isAnimatedSticker: ownType === 'stickerMessage' && !!content.isAnimated,
            download: () => downloadMediaMessage(
                { message: m.message, key: m.key },
                'buffer',
                {}
            )
        }
    }

    return null
}

export function isQuotedSticker(m) {
    if (!m.quoted?.message) return false
    const msg = unwrapMessage(m.quoted.message)
    return !!msg.stickerMessage
}

export async function downloadQuoted(m) {
    if (!m.quoted?.message) {
        throw new Error('Tidak ada media pada pesan yang di-reply.')
    }
    return downloadMediaMessage(
        { message: m.quoted.message, key: m.quoted.key },
        'buffer',
        {}
    )
}

export function getQuotedPlainText(m) {
    if (!m.quoted?.message) return ''
    const msg = unwrapMessage(m.quoted.message)
    return msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || ''
}

export async function downloadQuotedDocument(m) {
    if (!m.quoted?.message) {
        return { error: 'Tidak ada document pada pesan yang di-reply.' }
    }
    const msg = unwrapMessage(m.quoted.message)
    const doc = msg.documentMessage
    if (!doc) {
        return { error: 'Pesan yang di-reply bukan document.' }
    }
    try {
        const buffer = await downloadMediaMessage(
            { message: m.quoted.message, key: m.quoted.key },
            'buffer',
            {}
        )
        return { buffer, fileName: doc.fileName || 'file' }
    } catch (err) {
        return { error: err?.message || String(err) }
    }
}
