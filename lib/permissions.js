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
// lib/permissions.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getGroupMetadata, getCachedGroupMetadata } from '../db/groupCache.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json')))

function normalizeJid(jid = '') {
    return String(jid).trim().split(':')[0]
}

function getNumber(jid = '') {
    return normalizeJid(jid)
        .replace('@s.whatsapp.net', '')
        .replace('@lid', '')
        .replace('@g.us', '')
        .replace(/\D/g, '')
}

export function isOwnerSender(m) {
    if (m.fromMe === true) return true

    const owners = Array.isArray(config.owner) ? config.owner : [config.owner]
    const ownerNumbers = owners.map(o => String(o).replace(/\D/g, '')).filter(Boolean)

    return ownerNumbers.includes(getNumber(m.sender))
}

async function ensureMetadata(chat, conn) {
    return getCachedGroupMetadata(chat) || getGroupMetadata(chat, conn)
}

export async function isSenderAdmin(m, conn) {
    const metadata = await ensureMetadata(m.chat, conn)
    const participant = metadata?.participants?.find(
        p => normalizeJid(p.id) === normalizeJid(m.sender)
    )

    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
}

export async function isBotAdmin(m, conn) {
    const metadata = await ensureMetadata(m.chat, conn)
    const botJid = normalizeJid(conn?.user?.id || '')
    const participant = metadata?.participants?.find(
        p => normalizeJid(p.id) === botJid
    )

    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
}
