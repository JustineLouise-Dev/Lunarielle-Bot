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
// db/afk.js

import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('afk.json', 'key')

function makeKey(jid, groupJid) {
    return `${jid}|${groupJid}`
}

export function setAfk(jid, groupJid, reason) {
    const since = Date.now()
    const cleanReason = reason || 'Tidak ada alasan'
    const record = { key: makeKey(jid, groupJid), jid, groupJid, reason: cleanReason, since }

    store.set(record.key, record)
    return record
}

export function getAfk(jid, groupJid) {
    return store.get(makeKey(jid, groupJid))
}

export function clearAfk(jid, groupJid) {
    const key = makeKey(jid, groupJid)
    const existing = store.get(key)

    store.delete(key)
    return existing
}

export function formatDuration(ms) {
    let totalSeconds = Math.floor(ms / 1000)

    const days = Math.floor(totalSeconds / 86400)
    totalSeconds -= days * 86400
    const hours = Math.floor(totalSeconds / 3600)
    totalSeconds -= hours * 3600
    const minutes = Math.floor(totalSeconds / 60)
    totalSeconds -= minutes * 60
    const seconds = totalSeconds

    const parts = []
    if (days > 0) parts.push(`${days} hari`)
    if (hours > 0) parts.push(`${hours} jam`)
    if (minutes > 0) parts.push(`${minutes} menit`)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds} detik`)

    return parts.join(' ')
}
