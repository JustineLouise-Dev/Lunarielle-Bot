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
// db/addresponStore.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const STATE_FILE = path.join(DATA_DIR, 'addresponState.json')

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
    }
}

const DEFAULT_STATE = {
    triggers: []
}

let cache = null

function loadState() {
    if (cache) return cache

    ensureDataDir()

    if (!fs.existsSync(STATE_FILE)) {
        cache = structuredClone(DEFAULT_STATE)
        persist()
        return cache
    }

    try {
        const raw = fs.readFileSync(STATE_FILE, 'utf8')
        const parsed = JSON.parse(raw)
        cache = {
            ...structuredClone(DEFAULT_STATE),
            ...parsed,
            triggers: Array.isArray(parsed.triggers) ? parsed.triggers : []
        }
    } catch {
        cache = structuredClone(DEFAULT_STATE)
    }

    return cache
}

function persist() {
    ensureDataDir()
    try {
        fs.writeFileSync(STATE_FILE, JSON.stringify(cache, null, 2))
    } catch (err) {
        console.error('[ADDRESPON STORE] Gagal menulis addresponState.json:', err?.message || err)
    }
}

function normalizeTriggerKey(trigger) {
    return String(trigger || '').trim().toLowerCase()
}

function findTriggerEntry(state, trigger) {
    const key = normalizeTriggerKey(trigger)
    return state.triggers.find(t => t.triggerKey === key) || null
}

export function addAddresponItem({ trigger, type, text, mediaBuffer, ext, mimetype, createdBy }) {
    const state = loadState()

    let entry = findTriggerEntry(state, trigger)
    if (!entry) {
        entry = {
            trigger: String(trigger || '').trim(),
            triggerKey: normalizeTriggerKey(trigger),
            items: []
        }
        state.triggers.push(entry)
    }

    const item = {
        id: `ar_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        text: text || '',
        media: mediaBuffer ? Buffer.from(mediaBuffer).toString('base64') : null,
        ext: ext || null,
        mimetype: mimetype || null,
        createdBy: createdBy || null,
        createdAt: Date.now()
    }

    entry.items.push(item)
    persist()

    return { trigger: entry, item }
}

export function listAddrespon() {
    return structuredClone(loadState().triggers)
}

export function getAddrespon(trigger) {
    const state = loadState()
    const entry = findTriggerEntry(state, trigger)
    return entry ? structuredClone(entry) : null
}

export function deleteAddrespon(trigger) {
    const state = loadState()
    const key = normalizeTriggerKey(trigger)
    const before = state.triggers.length
    state.triggers = state.triggers.filter(t => t.triggerKey !== key)
    persist()
    return state.triggers.length !== before
}

export function deleteAddresponItem(trigger, index) {
    const state = loadState()
    const entry = findTriggerEntry(state, trigger)
    if (!entry) return 'not-found'

    const idx = index - 1
    if (idx < 0 || idx >= entry.items.length) return 'not-found'

    entry.items.splice(idx, 1)

    if (entry.items.length === 0) {
        state.triggers = state.triggers.filter(t => t.triggerKey !== entry.triggerKey)
        persist()
        return 'deleted-trigger'
    }

    persist()
    return 'deleted-item'
}

export function matchAddrespon(messageText) {
    const key = normalizeTriggerKey(messageText)
    if (!key) return null

    const state = loadState()
    const entry = findTriggerEntry(state, key)
    return entry ? structuredClone(entry) : null
}
