// Copyright (c) 2026 Justine Louise & MioDev.
// Created by Justine Louise & MioDev.
//
// This software is provided for personal and educational use only.
// Commercial use, resale, or distribution for profit is strictly prohibited
// without prior written permission from the author.
//
// Please respect the developer's work.
// Do not remove or modify this copyright notice or claim this project as your own.
//
// © 2026 Justine Louise & MioDev. All Rights Reserved.
// ® Powered By Zapo-js
// db/groupCache.js

import chalk from 'chalk'

const groupCache = new Map()
const inFlight = new Map()

// Duplikat minimal dari handler.js:normalizeJid, sengaja tidak di-import
// dari sana untuk menghindari circular import (handler.js sendiri meng-
// import dari file ini). Menghapus device-id (":12") dan resource suffix
// ("/...") dari JID, misal "6282xxxx:12@s.whatsapp.net" -> "6282xxxx@s.whatsapp.net".
// Ini penting karena `meJid`/`meLid` dari sock.getCredentials() adalah device
// JID (mengandung device-id), sedangkan participant.jid di metadata grup
// adalah bare user JID tanpa device-id — tanpa normalisasi ini, pencocokan
// bot dengan dirinya sendiri di daftar partisipan akan selalu gagal.
function normalizeBareJid(jid) {
    if (!jid) return jid
    return jid.split('/')[0].split(':')[0]
}

export async function getGroupMetadata(jid, sock, { force = false } = {}) {
    if (!jid || !jid.endsWith('@g.us')) return null
    if (!force && groupCache.has(jid)) return groupCache.get(jid)
    if (inFlight.has(jid)) return inFlight.get(jid)

    const fetchPromise = sock.group.queryGroupMetadata(jid)
        .then((metadata) => {
            groupCache.set(jid, metadata)
            return metadata
        })
        .catch((err) => {
            console.error(chalk.red(`[GROUP CACHE] Gagal fetch metadata ${jid}:`), err?.message || err)
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

export function patchGroupMetadata(jid, mutateFn) {
    const metadata = groupCache.get(jid)
    if (!metadata) return null
    mutateFn(metadata)
    return metadata
}

function extractDigits(jid) {
    if (!jid) return null
    const digits = String(jid).replace(/\D/g, '')
    return digits || null
}

function findParticipant(jid, participantJid) {
    const metadata = groupCache.get(jid)
    const participants = metadata?.participants
    if (!participants) return null

    const direct = participants.find(
        (p) => p.jid === participantJid || p.lid === participantJid || p.phoneNumber === participantJid
    )
    if (direct) return direct

    // Fallback: cocokkan berdasarkan digit nomor telepon saja, untuk
    // berjaga-jaga bila format JID (device-id, server LID/PN) sedikit
    // berbeda antara kredensial bot dan data partisipan grup.
    const targetDigits = extractDigits(participantJid)
    if (!targetDigits) return null

    return participants.find((p) => {
        return extractDigits(p.jid) === targetDigits ||
            extractDigits(p.lid) === targetDigits ||
            extractDigits(p.phoneNumber) === targetDigits
    }) ?? null
}

function findParticipantByAny(jid, participantJids) {
    for (const pj of participantJids) {
        if (!pj) continue
        const found = findParticipant(jid, pj)
        if (found) return found
    }
    return null
}

export const isAdminInGroup = (jid, participantJid) => {
    const p = findParticipant(jid, participantJid)
    return !!(p?.isAdmin || p?.isSuperAdmin)
}

export const isSuperAdminInGroup = (jid, participantJid) => !!findParticipant(jid, participantJid)?.isSuperAdmin

/**
 * Mengambil identitas akun bot sendiri (PN & LID) langsung dari kredensial
 * auth, bukan dari `sock.user` (properti itu tidak ada di WaClient/zapo-js,
 * sehingga sebelumnya selalu bernilai undefined dan bikin isBotAdmin selalu
 * salah walau bot sudah admin beneran).
 */
export function getBotJids(sock) {
    const creds = sock?.getCredentials?.() ?? null
    return {
        meJid: normalizeBareJid(creds?.meJid) ?? null,
        meLid: normalizeBareJid(creds?.meLid) ?? null
    }
}

/**
 * Mengecek status admin bot di sebuah grup, mencocokkan baik JID bentuk PN
 * maupun LID (grup bisa menyimpan salah satu atau keduanya tergantung mode
 * LID-addressing), memakai data cache yang sudah ada (tanpa fetch ulang).
 */
export function isBotAdminInGroup(jid, sock) {
    const { meJid, meLid } = getBotJids(sock)
    const p = findParticipantByAny(jid, [meJid, meLid])

    if (!p) {
        const metadata = groupCache.get(jid)
        console.log(chalk.yellow(
            `[BOT ADMIN CHECK] Tidak ketemu bot di partisipan ${jid}. ` +
            `meJid=${meJid || '-'} meLid=${meLid || '-'} ` +
            `totalPartisipan=${metadata?.participants?.length ?? 'null (belum ada cache)'}`
        ))
    }

    return !!(p?.isAdmin || p?.isSuperAdmin)
}

/**
 * Memastikan status admin bot akurat dengan memaksa refetch metadata grup
 * langsung dari WhatsApp (bukan cache lama), lalu mengecek status admin bot
 * memakai identitas asli dari kredensial auth (meJid/meLid).
 */
export async function refreshBotAdminStatus(jid, sock) {
    await getGroupMetadata(jid, sock, { force: true })
    return isBotAdminInGroup(jid, sock)
}

export { groupCache }
