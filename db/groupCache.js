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
// db/groupCache.js

const groupCache = new Map()
const inFlight = new Map()

function normalizeJid(jid = '') {
    return String(jid).trim().split(':')[0]
}

export async function getGroupMetadata(jid, conn, { force = false } = {}) {
    if (!jid || !jid.endsWith('@g.us')) return null
    if (!force && groupCache.has(jid)) return groupCache.get(jid)
    if (inFlight.has(jid)) return inFlight.get(jid)

    const fetchPromise = conn.groupMetadata(jid)
        .then((metadata) => {
            groupCache.set(jid, metadata)
            return metadata
        })
        .catch((err) => {
            console.error(`[GROUP CACHE] Gagal fetch metadata ${jid}:`, err?.message || err)
            return null
        })
        .finally(() => inFlight.delete(jid))

    inFlight.set(jid, fetchPromise)
    return fetchPromise
}

export const getCachedGroupMetadata = (jid) => groupCache.get(jid) ?? null
export const hasGroupMetadata = (jid) => groupCache.has(jid)
export const setGroupMetadata = (jid, metadata) => groupCache.set(jid, metadata)
export const invalidateGroupMetadata = (jid) => groupCache.delete(jid)

function findParticipant(jid, participantJid) {
    const metadata = groupCache.get(jid)
    const participants = metadata?.participants
    if (!participants) return null

    const target = normalizeJid(participantJid)
    return participants.find((p) => normalizeJid(p.id) === target) || null
}

export const isAdminInGroup = (jid, participantJid) => {
    const p = findParticipant(jid, participantJid)
    return p?.admin === 'admin' || p?.admin === 'superadmin'
}

export function isBotAdminInGroup(jid, conn) {
    const botJid = normalizeJid(conn?.user?.id || '')
    if (!botJid) return false

    const p = findParticipant(jid, botJid)
    return p?.admin === 'admin' || p?.admin === 'superadmin'
}

export async function refreshBotAdminStatus(jid, conn) {
    await getGroupMetadata(jid, conn, { force: true })
    return isBotAdminInGroup(jid, conn)
}

export { groupCache }
