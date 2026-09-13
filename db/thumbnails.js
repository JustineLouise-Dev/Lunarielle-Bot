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
// db/thumbnails.js

import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('thumbnails.json', 'key')

function makeKey(name, jenis) {
    return `${String(name).trim()}|${jenis}`
}

export function saveThumb({ name, jenis, status = 'random', metadata, expired = null }) {
    if (!name || !jenis || !metadata) return null

    const safeStatus = jenis === 'favicon' ? 'random' : (status === 'private' ? 'private' : 'random')
    const now = Date.now()
    const key = makeKey(name, jenis)
    const existing = store.get(key)

    const record = {
        key,
        name: String(name).trim(),
        jenis,
        status: safeStatus,
        metadata: typeof metadata === 'string' ? metadata : JSON.stringify(metadata),
        expired,
        createdAt: existing?.createdAt || now,
        updatedAt: now
    }

    store.set(key, record)

    return { name: record.name, jenis, status: safeStatus, changes: 1 }
}

export function getThumb(name, jenis) {
    const row = store.get(makeKey(name, jenis))
    if (!row) return null
    return { ...row, metadata: JSON.parse(row.metadata) }
}

export function getRandomThumb(jenis) {
    const now = Date.now()
    const candidates = store.all().filter(row =>
        row.jenis === jenis &&
        row.status === 'random' &&
        (row.expired === null || row.expired === undefined || row.expired > now)
    )

    if (!candidates.length) return null

    const picked = candidates[Math.floor(Math.random() * candidates.length)]
    return { ...picked, metadata: JSON.parse(picked.metadata) }
}

export function listThumbs(jenis) {
    return store.all()
        .filter(row => row.jenis === jenis)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(row => ({ ...row, metadata: undefined }))
}

export function deleteThumb(name, jenis) {
    return store.delete(makeKey(name, jenis))
}
