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
// db/jsonStore.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const STORE_DIR = path.join(__dirname, '..', 'store')

if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true })
}

export function createJsonStore(filename, idField = 'id') {
    const filePath = path.join(STORE_DIR, filename)
    const cache = new Map()

    function load() {
        if (!fs.existsSync(filePath)) {
            return
        }

        try {
            const raw = fs.readFileSync(filePath, 'utf8')
            const rows = raw.trim() ? JSON.parse(raw) : []

            for (const row of rows) {
                if (row && row[idField]) {
                    cache.set(row[idField], row)
                }
            }
        } catch (error) {
            console.error(`[JSON STORE] Gagal membaca ${filename}:`, error?.message || error)
        }
    }

    function flush() {
        try {
            const rows = [...cache.values()]
            const tmpPath = filePath + '.tmp'

            fs.writeFileSync(tmpPath, JSON.stringify(rows, null, 2), 'utf8')
            fs.renameSync(tmpPath, filePath)
        } catch (error) {
            console.error(`[JSON STORE] Gagal menulis ${filename}:`, error?.message || error)
        }
    }

    load()

    return {
        cache,
        get(id) {
            return cache.get(id) || null
        },
        set(id, record) {
            cache.set(id, record)
            flush()
            return record
        },
        delete(id) {
            const existed = cache.delete(id)
            if (existed) flush()
            return existed
        },
        all() {
            return [...cache.values()]
        },
        flush
    }
}
