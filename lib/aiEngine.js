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
// lib/aiEngine.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import axios from 'axios'
import {
    getHistory,
    pushHistory,
    listFunctionTriggers,
    getFunctionTrigger
} from '../db/aiStore.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'config.json'))
)

const WORKER_URL = config.starmedia?.workerUrl || 'https://api.justinelouise.workers.dev'
const CLIENT_API_KEY = config.starmedia?.clientApiKey || ''

function httpBase() {
    return WORKER_URL.replace(/\/$/, '')
}

const BUBBLE_DELAY_MS = config.lunar?.bubbleDelayMs ?? 500

const MEDIA_TYPE_LABEL_FOR_AI = {
    text: 'pesan teks',
    sticker: 'stiker',
    image: 'gambar',
    video: 'video',
    audio: 'audio/voice note',
    document: 'dokumen'
}

function buildFunctionCallBriefing() {
    const fns = listFunctionTriggers()
    if (!fns.length) return null

    const list = fns
        .map(f => {
            const label = MEDIA_TYPE_LABEL_FOR_AI[f.mediaType] || f.mediaType
            const detail = f.mediaType === 'text' && f.textContent
                ? ` (isi teksnya: "${f.textContent}")`
                : ''
            return `- id="${f.id}" -> kirim ${label}${detail} saat: ${f.prompt}`
        })
        .join('\n')

    return (
        'Catatan khusus dari owner bot (bukan pesan dari lawan bicara): kamu ' +
        'punya beberapa aksi opsional (function call) yang boleh kamu pakai ' +
        'KALAU memang situasinya cocok — jangan dipakai di setiap chat, ' +
        'gunakan sesekali saja saat benar-benar pas:\n' +
        list +
        '\n\nKalau kamu memutuskan salah satu aksi itu cocok dipakai sekarang, ' +
        'tambahkan baris terakhir PERSIS dengan format:\n' +
        '[[ACTION:id_aksi]]\n' +
        'Baris itu harus jadi baris paling akhir di balasanmu, dan HANYA ' +
        'tulis itu kalau memang ingin memicu aksinya. Jangan tulis ' +
        '[[ACTION:...]] kalau tidak ada aksi yang cocok. Balas catatan ini ' +
        'dengan "siap" saja untuk konfirmasi kamu paham, lalu lanjutkan ' +
        'mengobrol seperti biasa untuk pesan-pesan berikutnya.'
    )
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function callLunarAi(contents) {
    if (!CLIENT_API_KEY) {
        throw new Error('missing_api_key')
    }

    let body
    try {
        const res = await axios.post(
            `${httpBase()}/api/lunarai/generate`,
            {
                contents,
                generationConfig: {
                    thinkingConfig: {
                        thinkingLevel: 'MINIMAL'
                    }
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Api-Key': CLIENT_API_KEY
                },
                validateStatus: () => true
            }
        )
        body = res.data || {}

        if (res.status < 200 || res.status >= 300) {
            const reason = body?.error || `http_${res.status}`
            throw new Error(reason)
        }
    } catch (err) {
        if (err.response) {
            const reason = err.response.data?.error || `http_${err.response.status}`
            throw new Error(reason)
        }
        if (err.message && !err.request) {
            throw err
        }
        throw new Error(`network_error: ${err.message}`)
    }

    const text =
        body?.candidates?.[0]?.content?.parts
            ?.map(p => p.text || '')
            .join('') || ''

    return text
}

function errorMessage(reason) {
    const map = {
        missing_api_key: '🔑 API key AI belum diatur owner (config.json -> starmedia.clientApiKey).',
        unauthorized: '🔑 API key AI tidak valid.',
        invalid_api_key: '🔑 API key AI tidak dikenal server.',
        revoked_api_key: '🔑 API key AI sudah dicabut.',
        daily_limit_exceeded: '📛 Batas pemakaian AI harian sudah tercapai, coba lagi besok ya.',
        weekly_limit_exceeded: '📛 Batas pemakaian AI minggu ini sudah tercapai.',
        monthly_limit_exceeded: '📛 Batas pemakaian AI bulan ini sudah tercapai.',
        upstream_error: '⚠️ AI sedang bermasalah di sisi server, coba lagi sebentar lagi.',
        service_unavailable: '⚠️ AI belum dikonfigurasi di server (belum ada AI Provider Key di admin panel).'
    }
    return map[reason] || `⚠️ Gagal memproses AI: ${reason}`
}

function parseAiOutput(raw) {
    const text = String(raw || '')

    let actionId = null
    const actionRegex = /\[\[ACTION:([a-zA-Z0-9_]+)\]\]/g
    const cleaned = text.replace(actionRegex, (_, id) => {
        actionId = id
        return ''
    })

    const textLines = cleaned
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)

    return { bubbles: textLines, actionId }
}

export async function runAutoAi(m, { conn, media }) {
    const jid = m.chat
    const userText = (m.text || '').trim()

    if (!userText && !media) return

    const history = getHistory(jid)
    const functionBriefing = buildFunctionCallBriefing()

    const currentParts = []
    if (media) {
        currentParts.push({ inlineData: { mimeType: media.mimeType, data: media.data } })
    }
    currentParts.push({
        text: userText || '(user mengirim gambar/stiker ini tanpa keterangan apa pun — tanggapi isinya secara natural sesuai konteks obrolan)'
    })

    const contents = [
        ...(functionBriefing
            ? [
                { role: 'user', parts: [{ text: functionBriefing }] },
                { role: 'model', parts: [{ text: 'siap' }] }
            ]
            : []),
        ...history.map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        })),
        { role: 'user', parts: currentParts }
    ]

    let raw
    try {
        raw = await callLunarAi(contents)
    } catch (err) {
        await m.reply(errorMessage(err.message))
        return
    }

    if (!raw.trim()) {
        await m.reply('🌙 AI tidak memberikan balasan (kemungkinan konten difilter atau respons kosong dari server). Coba kirim ulang pesannya.')
        return
    }

    const { bubbles, actionId } = parseAiOutput(raw)

    pushHistory(jid, 'user', userText || '[mengirim gambar/stiker]')
    pushHistory(jid, 'model', bubbles.join('\n'))

    try { await conn.sendPresenceUpdate('composing', jid) } catch {}

    for (let i = 0; i < bubbles.length; i++) {
        const bubble = bubbles[i]

        if (i > 0) {
            await sleep(BUBBLE_DELAY_MS)
            try { await conn.sendPresenceUpdate('composing', jid) } catch {}
        }

        await conn.sendMessage(jid, { text: bubble })
    }

    if (actionId) {
        const trigger = getFunctionTrigger(actionId)

        if (trigger) {
            await sleep(BUBBLE_DELAY_MS)

            try {
                if (trigger.mediaType === 'text') {
                    if (trigger.textContent) {
                        await conn.sendMessage(jid, { text: trigger.textContent })
                    }
                } else if (trigger.media) {
                    const buffer = Buffer.from(trigger.media, 'base64')

                    if (trigger.mediaType === 'sticker') {
                        await conn.sendMessage(jid, { sticker: buffer })
                    } else if (trigger.mediaType === 'image') {
                        await conn.sendMessage(jid, { image: buffer })
                    } else if (trigger.mediaType === 'video') {
                        await conn.sendMessage(jid, { video: buffer })
                    } else if (trigger.mediaType === 'audio') {
                        await conn.sendMessage(jid, {
                            audio: buffer,
                            mimetype: trigger.mimetype || 'audio/ogg; codecs=opus',
                            ptt: true
                        })
                    } else if (trigger.mediaType === 'document') {
                        await conn.sendMessage(jid, {
                            document: buffer,
                            mimetype: trigger.mimetype || 'application/octet-stream',
                            fileName: trigger.fileName || 'file'
                        })
                    }
                }
            } catch (err) {
                console.error('[AI FUNCTION CALL] Gagal mengirim aksi:', err?.message || err)
            }
        }
    }
}
