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
// plugins/tools/c2i.js

import { downloadQuotedDocument, getQuotedPlainText } from '../../lib/mediaHelper.js'

const RAY_API = 'https://ray.tinte.dev/api/v1/screenshot'
const DEFAULT_TITLE = 'code.js'
const TIMEOUT_MS = 60000

const EXT_LANG = {
    js: 'javascript', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'tsx', jsx: 'javascript',
    py: 'python', rs: 'rust', go: 'go',
    html: 'html', css: 'css', json: 'json',
    sh: 'bash', bash: 'bash', sql: 'sql',
    java: 'java', cpp: 'cpp', cc: 'cpp',
    rb: 'ruby', swift: 'swift', kt: 'kotlin'
}

function detectLanguage(filename) {
    const ext = filename?.split('.').pop()?.toLowerCase()
    return EXT_LANG[ext] || 'javascript'
}

async function resolveInput(m) {
    if (!m.quoted) {
        return { error: 'Balas teks atau document berisi code yang ingin diubah jadi gambar.' }
    }

    const docResult = await downloadQuotedDocument(m)
    if (!docResult.error) {
        const code = docResult.buffer.toString('utf8').trim()
        if (!code) return { error: 'File yang dibalas kosong.' }
        const title = docResult.fileName || DEFAULT_TITLE
        return { code, title, language: detectLanguage(title) }
    }

    const code = getQuotedPlainText(m)?.trim()
    if (!code) return { error: 'Pesan yang dibalas tidak memiliki teks atau code.' }

    return { code, title: DEFAULT_TITLE, language: detectLanguage(DEFAULT_TITLE) }
}

async function generateImage(code, title, language) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

    let res

    try {
        res = await fetch(RAY_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code,
                language,
                theme: 'crafter-station',
                padding: 8,
                fontSize: 18,
                lineNumbers: true,
                title,
                background: 'ocean'
            }),
            signal: controller.signal
        })
    } catch (err) {
        if (err?.name === 'AbortError') {
            throw new Error('Request timeout setelah 1 menit.')
        }
        throw err
    } finally {
        clearTimeout(timer)
    }

    if (!/^image\//.test(res.headers.get('content-type') || '')) {
        const detail = await res.text().catch(() => '')
        throw new Error(`API error ${res.status}${detail ? `: ${detail.slice(0, 300)}` : ''}`)
    }

    return Buffer.from(await res.arrayBuffer())
}

export default {
    command: 'c2i',
    alias: ['tocarbon', '2carbon', 'carbonify'],
    category: 'tools',
    description: 'Mengubah code menjadi gambar bergaya carbon.\n\n' +
        '*Format Penggunaan:*\n' +
        '> `Balas teks atau document berisi code lalu ketik:`\n> .c2i',
    help: '`(reply teks/docs)`',
    typing: true,

    async execute(m, { args }) {
        const asThumbnail = args.some((a) => a.toLowerCase() === '-ct')

        if (asThumbnail) {
            return m.reply('⚠️ Opsi `-ct` (kirim sebagai link-preview thumbnail) belum didukung di bot ini. Gunakan `.c2i` tanpa `-ct` untuk hasil sebagai gambar biasa.')
        }

        const input = await resolveInput(m)
        if (input.error) return m.reply(input.error)

        let buffer

        try {
            buffer = await generateImage(input.code, input.title, input.language)
        } catch (err) {
            console.error('[C2I] error:', err?.message || err)
            return m.reply('Gagal membuat gambar dari code, coba lagi nanti.')
        }

        return m.reply({
            image: buffer,
            mimetype: 'image/png',
            caption: `✅ ${input.title}`
        })
    }
}
