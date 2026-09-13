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
// db/aiStore.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const STATE_FILE = path.join(DATA_DIR, 'aiState.json')

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
    }
}

const DEFAULT_STATE = {
    scopes: {
        all: false,
        group: false,
        private: false
    },
    chatOverrides: {},
    functions: [],
    history: {}
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
            scopes: { ...DEFAULT_STATE.scopes, ...(parsed.scopes || {}) },
            chatOverrides: parsed.chatOverrides || {},
            functions: Array.isArray(parsed.functions) ? parsed.functions : [],
            history: parsed.history || {}
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
        console.error('[AI STORE] Gagal menulis aiState.json:', err?.message || err)
    }
}

export function setAiScope(scope, enabled) {
    const state = loadState()

    if (!['all', 'group', 'private'].includes(scope)) {
        throw new Error(`Scope tidak dikenal: ${scope}`)
    }

    if (scope === 'all') {
        state.scopes.all = !!enabled
        state.scopes.group = !!enabled
        state.scopes.private = !!enabled
    } else {
        state.scopes[scope] = !!enabled
        state.scopes.all = state.scopes.group && state.scopes.private
    }

    persist()
    return state.scopes
}

export function getAiScopes() {
    return { ...loadState().scopes }
}

export function setChatOverride(jid, enabled) {
    const state = loadState()
    state.chatOverrides[jid] = !!enabled
    persist()
}

export function clearChatOverride(jid) {
    const state = loadState()
    delete state.chatOverrides[jid]
    persist()
}

export function isAiActiveForChat(jid, isGroup) {
    const state = loadState()

    if (Object.prototype.hasOwnProperty.call(state.chatOverrides, jid)) {
        return !!state.chatOverrides[jid]
    }

    return isGroup ? !!state.scopes.group : !!state.scopes.private
}

const MAX_HISTORY_EXCHANGES = 5
const MAX_HISTORY_TURNS = MAX_HISTORY_EXCHANGES * 2

export function getHistory(jid) {
    const state = loadState()
    return state.history[jid] ? [...state.history[jid]] : []
}

export function pushHistory(jid, role, text) {
    const state = loadState()
    if (!state.history[jid]) state.history[jid] = []

    state.history[jid].push({ role, text })

    if (state.history[jid].length > MAX_HISTORY_TURNS) {
        state.history[jid] = state.history[jid].slice(-MAX_HISTORY_TURNS)
    }

    persist()
}

export function clearHistory(jid) {
    const state = loadState()
    delete state.history[jid]
    persist()
}

export function addFunctionTrigger({ prompt, mediaType, mediaBase64, mimetype, textContent, fileName }) {
    const state = loadState()

    const entry = {
        id: `fn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        prompt: String(prompt || '').trim(),
        mediaType: mediaType || 'sticker',
        media: mediaBase64 || null,
        mimetype: mimetype || 'image/webp',
        textContent: textContent || null,
        fileName: fileName || null,
        createdAt: Date.now()
    }

    state.functions.push(entry)
    persist()
    return entry
}

export function listFunctionTriggers() {
    return loadState().functions.map(f => ({
        id: f.id,
        prompt: f.prompt,
        mediaType: f.mediaType,
        mimetype: f.mimetype,
        textContent: f.textContent,
        fileName: f.fileName,
        createdAt: f.createdAt
    }))
}

export function getFunctionTrigger(id) {
    return loadState().functions.find(f => f.id === id) || null
}

export function removeFunctionTrigger(id) {
    const state = loadState()
    const before = state.functions.length
    state.functions = state.functions.filter(f => f.id !== id)
    persist()
    return state.functions.length !== before
}
