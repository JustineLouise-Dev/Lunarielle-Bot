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
// lib/handler.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { downloadMediaMessage, areJidsSameUser } from 'baileys'
import * as boxLog from './logger.js'
import { detectMediaType } from './utils.js'
import { saveRawMessage } from '../db/rawMessage.js'
import { isAiActiveForChat } from '../db/aiStore.js'
import { matchAddrespon } from '../db/addresponStore.js'
import { runAutoAi } from './aiEngine.js'
import { resolveMediaTarget } from './mediaHelper.js'

const VISION_MIME_PREFIXES = ['image/']

function isVisionCapableMime(mime = '') {
    return VISION_MIME_PREFIXES.some(prefix => mime.startsWith(prefix))
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'config.json'))
)

boxLog.state.botName = config.botName || boxLog.state.botName

const plugins = []
const pluginMap = new Map()

function unwrapMessage(message) {
    let msg = message

    while (msg) {
        if (msg.ephemeralMessage?.message) {
            msg = msg.ephemeralMessage.message
            continue
        }

        if (msg.viewOnceMessage?.message) {
            msg = msg.viewOnceMessage.message
            continue
        }

        if (msg.viewOnceMessageV2?.message) {
            msg = msg.viewOnceMessageV2.message
            continue
        }

        if (msg.viewOnceMessageV2Extension?.message) {
            msg = msg.viewOnceMessageV2Extension.message
            continue
        }

        break
    }

    return msg || {}
}

function getText(message) {
    const msg = unwrapMessage(message)

    let interactiveReplyId = null
    if (msg.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson) {
        try {
            const params = JSON.parse(msg.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
            interactiveReplyId = params.id || params.selected_id || null
        } catch {}
    }

    return (
        msg.conversation ||
        msg.extendedTextMessage?.text ||
        msg.imageMessage?.caption ||
        msg.videoMessage?.caption ||
        msg.documentMessage?.caption ||

        msg.listResponseMessage?.singleSelectReply?.selectedRowId ||

        interactiveReplyId ||

        msg.buttonsResponseMessage?.selectedButtonId ||
        msg.templateButtonReplyMessage?.selectedId ||
        ''
    )
}

function detectMessageType(message) {
    const msg = unwrapMessage(message)

    if (msg.conversation || msg.extendedTextMessage) return 'text'
    if (msg.listResponseMessage) return 'text'
    if (msg.interactiveResponseMessage) return 'text'
    if (msg.buttonsResponseMessage || msg.templateButtonReplyMessage) return 'text'
    if (msg.imageMessage) return 'image'
    if (msg.videoMessage) return 'video'
    if (msg.audioMessage) return msg.audioMessage.ptt ? 'voice' : 'audio'
    if (msg.stickerMessage) return 'sticker'
    if (msg.documentMessage) return 'document'
    if (msg.contactMessage || msg.contactsArrayMessage) return 'contact'
    if (msg.locationMessage || msg.liveLocationMessage) return 'location'
    if (msg.reactionMessage) return 'reaction'

    return 'other'
}

function normalizeJid(jid = '') {
    return String(jid).trim().split(':')[0]
}

function getContextInfo(message) {
    const msg = unwrapMessage(message)

    return (
        msg.extendedTextMessage?.contextInfo ||
        msg.imageMessage?.contextInfo ||
        msg.videoMessage?.contextInfo ||
        msg.documentMessage?.contextInfo ||
        msg.stickerMessage?.contextInfo ||
        {}
    )
}

function getMentionedJids(message) {
    const context = getContextInfo(message)
    return Array.isArray(context.mentionedJid) ? context.mentionedJid : []
}

async function isSameUserAsBot(candidateJid, botJid, conn) {
    if (!candidateJid || !botJid) return false

    try {
        if (areJidsSameUser(candidateJid, botJid)) return true
    } catch {}

    if (normalizeJid(candidateJid).split('@')[0] === normalizeJid(botJid).split('@')[0]) {
        return true
    }

    const candidateIsLid = candidateJid.endsWith('@lid')
    const botIsLid = botJid.endsWith('@lid')

    if (candidateIsLid === botIsLid) return false

    const lidMapping = conn?.signalRepository?.lidMapping
    if (!lidMapping) return false

    try {
        const lidJid = candidateIsLid ? candidateJid : botJid
        const pnJid = candidateIsLid ? botJid : candidateJid

        const resolvedPn = await lidMapping.getPNForLID(lidJid)
        if (resolvedPn && getNumber(resolvedPn) === getNumber(pnJid)) return true

        if (typeof lidMapping.getLIDForPN === 'function') {
            const resolvedLid = await lidMapping.getLIDForPN(pnJid)
            if (resolvedLid && getNumber(resolvedLid) === getNumber(lidJid)) return true
        }
    } catch (error) {
        boxLog.logError({ scope: 'AUTO AI LID MAPPING', message: error?.message || error })
    }

    return false
}

async function isReplyToBot(message, botJid, conn) {
    const context = getContextInfo(message)
    const quotedParticipant = context.participant

    if (!quotedParticipant || !botJid) return false

    return isSameUserAsBot(quotedParticipant, botJid, conn)
}

function getNumber(jid = '') {
    return normalizeJid(jid)
        .replace('@s.whatsapp.net', '')
        .replace('@lid', '')
        .replace('@g.us', '')
        .replace(/\D/g, '')
}

async function isOwner(m, conn) {
    const senderJid =
        m.sender ||
        m.key?.participant ||
        ''

    const owners = Array.isArray(config.owner)
        ? config.owner
        : [config.owner]

    const ownerNumbers = owners
        .map(owner => String(owner).replace(/\D/g, ''))
        .filter(Boolean)

    if (m.fromMe === true) {
        return true
    }

    if (senderJid.endsWith('@s.whatsapp.net')) {
        const senderNumber = getNumber(senderJid)

        if (ownerNumbers.includes(senderNumber)) {
            return true
        }
    }

    if (senderJid.endsWith('@lid')) {
        try {
            const lidMapping =
                conn?.signalRepository?.lidMapping

            if (lidMapping) {
                const pn = await lidMapping.getPNForLID(senderJid)

                if (pn) {
                    const pnNumber = getNumber(pn)

                    if (ownerNumbers.includes(pnNumber)) {
                        return true
                    }
                }
            }
        } catch (error) {
            boxLog.logError({ scope: 'OWNER LID MAPPING', message: error?.message || error })
        }
    }

    const ownId = conn?.user?.id || ''
    const ownNumber = getNumber(ownId)

    if (
        ownNumber &&
        ownerNumbers.includes(ownNumber)
    ) {
        return true
    }

    return false
}

function getQuoted(m) {
    const context =
        m.message?.extendedTextMessage?.contextInfo ||
        m.message?.imageMessage?.contextInfo ||
        m.message?.videoMessage?.contextInfo ||
        m.message?.documentMessage?.contextInfo ||
        {}

    const quotedMessage = context.quotedMessage

    if (!quotedMessage) {
        return null
    }

    const qType = Object.keys(unwrapMessage(quotedMessage))[0] || null
    const rawContent = qType ? unwrapMessage(quotedMessage)[qType] : null

    const quoted = {
        id: context.stanzaId,
        sender:
            context.participant ||
            context.remoteJid ||
            '',
        message: quotedMessage,
        key: {
            remoteJid: m.chat,
            id: context.stanzaId,
            participant: context.participant,
            fromMe: false
        },
        type: qType
    }

    Object.defineProperties(quoted, {
        text: {
            get() { return rawContent?.text ?? rawContent?.caption ?? quotedMessage.conversation ?? null },
            enumerable: true, configurable: true
        },
        mime: {
            get() { return rawContent?.mimetype || '' },
            enumerable: true, configurable: true
        },
        isMedia: {
            get() { return !!this.mime },
            enumerable: true, configurable: true
        },
        mediaType: {
            get() { return detectMediaType(this.mime) },
            enumerable: true, configurable: true
        },
        caption: {
            get() { return rawContent?.caption ?? null },
            enumerable: true, configurable: true
        },

        full: {
            get() { return qType ? { [qType]: rawContent } : {} },
            enumerable: true, configurable: true
        }
    })

    quoted.download = async () => {
        if (!quoted.isMedia) throw new Error('Pesan yang di-quote bukan media.')
        return downloadMediaMessage(
            { key: quoted.key, message: quotedMessage },
            'buffer',
            {},
            {}
        )
    }

    return quoted
}

function normalizePlugin(mod, relPath) {
    if (typeof mod === 'function') {
        return {
            command: mod.command,
            alias: mod.alias,
            category: mod.category || 'other',
            description: mod.description || '',
            help: mod.help,
            hidden: mod.hidden === true,
            group: mod.group === true,
            owner: mod.owner === true,
            admin: mod.admin === true,
            botAdmin: mod.botAdmin === true,
            typing: mod.typing === true,
            run: mod,
            __file: relPath,
            __style: 'function'
        }
    }

    if (mod && typeof mod === 'object' && typeof mod.execute === 'function') {
        return {
            command: mod.command,
            alias: mod.alias,
            category: mod.category || 'other',
            description: mod.description || '',
            help: mod.help,
            hidden: mod.hidden === true,
            group: mod.group === true,
            owner: mod.owner === true,
            admin: mod.admin === true,
            botAdmin: mod.botAdmin === true,
            typing: mod.typing === true,
            run: (m, ctx) => mod.execute(m, ctx),
            __file: relPath,
            __style: 'object'
        }
    }

    return null
}

function getPluginFiles(dir) {
    const result = []

    if (!fs.existsSync(dir)) {
        return result
    }

    const entries = fs.readdirSync(dir, {
        withFileTypes: true
    })

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)

        if (entry.isDirectory()) {
            result.push(...getPluginFiles(fullPath))
            continue
        }

        if (
            entry.isFile() &&
            entry.name.endsWith('.js')
        ) {
            result.push(fullPath)
        }
    }

    return result
}

let pluginsLoaded = false
let pluginsLoading = null

export async function loadPlugins({ force = false } = {}) {
    if (pluginsLoading) return pluginsLoading
    if (pluginsLoaded && !force) return plugins

    pluginsLoading = (async () => {
        const pluginDir = path.join(__dirname, '..', 'plugins')

        if (!fs.existsSync(pluginDir)) {
            fs.mkdirSync(pluginDir, { recursive: true })
        }

        const files = getPluginFiles(pluginDir)
        plugins.length = 0
        pluginMap.clear()

        for (const fullPath of files) {
            try {
                const module = await import(
                    pathToFileURL(fullPath).href + `?update=${Date.now()}`
                )
                const relPath = path.relative(pluginDir, fullPath)
                const plugin = normalizePlugin(module.default, relPath)

                if (!plugin || !plugin.command) {
                    console.log(`[PLUGIN] Invalid: ${relPath}`)
                    continue
                }

                plugins.push(plugin)

                const names = Array.isArray(plugin.command)
                    ? plugin.command
                    : plugin.command instanceof RegExp
                        ? []
                        : [plugin.command]

                const aliases = Array.isArray(plugin.alias)
                    ? plugin.alias
                    : plugin.alias
                        ? [plugin.alias]
                        : []

                for (const name of [...names, ...aliases]) {
                    if (name) pluginMap.set(String(name).toLowerCase(), plugin)
                }
            } catch (error) {
                boxLog.logError({
                    scope: 'PLUGIN LOAD',
                    message: `${path.relative(pluginDir, fullPath)}: ${error?.message || error}`
                })
            }
        }

        pluginsLoaded = true
        console.log(`[PLUGIN] ${plugins.length} plugin berhasil dimuat.`)
        return plugins
    })()

    try {
        return await pluginsLoading
    } finally {
        pluginsLoading = null
    }
}

function getBotJid(conn) {
    return (
        conn?.user?.id ||
        conn?.user?.lid ||
        conn?.authState?.creds?.me?.id ||
        conn?.authState?.creds?.me?.lid ||
        ''
    )
}

async function maybeRunAddrespon(conn, m) {
    if (m.fromMe) return false

    const rawText = getText(m.message).trim()
    if (!rawText) return false

    // NOTE: auto-respon triggers on exact text match regardless of group/private
    // chat and regardless of whether the bot was tagged or replied to — that's
    // the whole point of the feature (any user typing "intro" gets the canned
    // reply). Gating this behind a mention/reply check (like auto-AI does)
    // made triggers silently never fire in groups unless the bot was tagged.
    const cleanedText = rawText.replace(/@\d{5,20}/g, '').trim()

    const entry = matchAddrespon(cleanedText)
    if (!entry || !entry.items.length) return false

    for (const item of entry.items) {
        try {
            if (item.type === 'text') {
                if (item.text) {
                    await conn.sendMessage(m.chat, { text: item.text }, { quoted: m })
                }
                continue
            }

            if (!item.media) continue
            const buffer = Buffer.from(item.media, 'base64')

            if (item.type === 'image') {
                await conn.sendMessage(m.chat, { image: buffer, caption: item.text || undefined }, { quoted: m })
            } else if (item.type === 'sticker') {
                await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
            } else if (item.type === 'video') {
                await conn.sendMessage(m.chat, { video: buffer, caption: item.text || undefined }, { quoted: m })
            } else if (item.type === 'audio') {
                await conn.sendMessage(m.chat, {
                    audio: buffer,
                    mimetype: item.mimetype || 'audio/ogg; codecs=opus',
                    ptt: true
                }, { quoted: m })
            } else if (item.type === 'document') {
                await conn.sendMessage(m.chat, {
                    document: buffer,
                    mimetype: item.mimetype || 'application/octet-stream',
                    fileName: `respon.${item.ext || 'bin'}`
                }, { quoted: m })
            }
        } catch (err) {
            boxLog.logError({ scope: 'ADDRESPON', message: err?.message || err })
        }
    }

    return true
}

async function maybeRunAutoAi(conn, m) {
    if (m.fromMe) return

    const rawText = getText(m.message).trim()

    const mediaTarget = resolveMediaTarget(m)
    const hasVisionMedia = !!mediaTarget && isVisionCapableMime(mediaTarget.mime)

    if (!rawText && !hasVisionMedia) return

    if (!isAiActiveForChat(m.chat, m.isGroup)) {
        boxLog.logError({
            scope: 'LUNAR',
            message: `Auto AI tidak aktif untuk chat ${m.chat} (cek hasil ".lunar status" di chat ini).`
        })
        return
    }

    if (m.isGroup) {
        const botJids = [
            conn?.user?.id,
            conn?.user?.lid,
            conn?.authState?.creds?.me?.id,
            conn?.authState?.creds?.me?.lid
        ].filter(Boolean)

        const mentioned = getMentionedJids(m.message)

        let isTagged = false
        for (const botJid of botJids) {
            if (await Promise.all(mentioned.map(jid => isSameUserAsBot(jid, botJid, conn))).then(r => r.some(Boolean))) {
                isTagged = true
                break
            }
        }

        let isReplied = false
        for (const botJid of botJids) {
            if (await isReplyToBot(m.message, botJid, conn)) {
                isReplied = true
                break
            }
        }

        if (!isTagged && !isReplied) {
            const context = getContextInfo(m.message)
            boxLog.logError({
                scope: 'LUNAR',
                message: 'Auto AI tidak terpicu di grup (bot tidak di-tag/di-reply).',
                detail: JSON.stringify({
                    botJids,
                    mentionedJid: mentioned,
                    quotedParticipant: context.participant || null
                })
            })
            return
        }
    }

    m.text = rawText
        .replace(/@\d{5,20}/g, '')
        .trim()

    let media = null
    if (hasVisionMedia) {
        try {
            const buffer = await mediaTarget.download()
            media = { mimeType: mediaTarget.mime, data: buffer.toString('base64') }
        } catch (err) {
            boxLog.logError({ scope: 'AUTO AI VISION', message: err?.message || err })
        }
    }

    await runAutoAi(m, { conn, media })
}

export async function handleMessage(conn, msg) {
    try {
        const m = msg

        if (!m?.message) {
            return
        }

        m.chat =
            m.key?.remoteJid ||
            m.chat ||
            ''

        m.sender =
            m.key?.participant ||
            m.participant ||
            m.key?.remoteJid ||
            ''

        m.fromMe =
            m.key?.fromMe === true ||
            m.fromMe === true

        m.isGroup =
            m.chat.endsWith('@g.us')

        m.mentionedJid =
            m.mentionedJid ||
            getMentionedJids(m.message)

        m.quoted =
            m.quoted ||
            getQuoted(m)

        m.reply = async content => {

            const payload = typeof content === 'string'
                ? { text: content }
                : content

            return conn.sendMessage(
                m.chat,
                payload,
                { quoted: m }
            )
        }

        const text = getText(m.message)
        const messageType = detectMessageType(m.message)
        const senderName = m.pushName || getNumber(m.sender) || 'Unknown'
        const senderNumber = getNumber(m.sender)

        try {
            saveRawMessage({
                id: m.key?.id,
                chat: m.chat,
                sender: m.sender,
                pushName: m.pushName,
                type: messageType,
                isGroup: m.isGroup,
                isFromMe: m.fromMe,
                prefix: null,
                command: null,
                text: text || null,
                isMedia: messageType !== 'text' && messageType !== 'other',
                mediaType: messageType,
                raw: m.message
            })
        } catch (err) {
            boxLog.logError({
                scope: 'RAWMESSAGE',
                message: 'gagal menyimpan pesan masuk',
                detail: err?.message || String(err)
            })
        }

        boxLog.trackIncoming({
            type: messageType,
            sender: m.sender,
            chat: m.chat,
            isGroup: m.isGroup
        })

        if (m.isGroup) {
            let groupName = m.chat
            try {
                const metadata = await conn.groupMetadata(m.chat)
                groupName = metadata?.subject || m.chat
            } catch {}

            boxLog.logGroupEvent('message', {
                groupName,
                groupId: m.chat,
                sender: senderName,
                type: messageType
            })
        }

        if (!text) {
            return
        }

        const prefixList = Array.isArray(config.prefixes) && config.prefixes.length
            ? config.prefixes
            : [config.prefix || '.']

        const noPrefix = config.noprefix === true

        let usedPrefix = prefixList.find(p => text.startsWith(p))

        if (!usedPrefix && !noPrefix) {
            try {
                const handled = await maybeRunAddrespon(conn, m)
                if (handled) return
            } catch (error) {
                boxLog.logError({ scope: 'ADDRESPON', message: error?.message || error })
            }

            try {
                await maybeRunAutoAi(conn, m)
            } catch (error) {
                boxLog.logError({ scope: 'AUTO AI', message: error?.message || error })
            }

            return
        }

        const body = usedPrefix
            ? text.slice(usedPrefix.length).trim()
            : text.trim()

        if (!body) {
            return
        }

        const args = body.split(/\s+/)
        const command = args.shift().toLowerCase()
        const commandText = args.join(' ')

        m.prefix = usedPrefix || ''
        m.command = command
        m.args = args
        m.text = commandText
        m.id = m.key?.id
        m.pushName = m.pushName || senderName

        let plugin = pluginMap.get(command) || null

        if (!plugin) {
            plugin = plugins.find(p => p.command instanceof RegExp && (() => {
                p.command.lastIndex = 0
                const ok = p.command.test(command)
                p.command.lastIndex = 0
                return ok
            })()) || null
        }

        if (!plugin) {
            return
        }

        boxLog.logIncomingMessage({
            senderName,
            number: senderNumber,
            chat: m.chat,
            isGroup: m.isGroup,
            id: m.key?.id,
            type: messageType,
            text,
            command,
            pluginFile: plugin.__file
        })

        if (plugin.group && !m.isGroup) {
            return m.reply(
                config?.pesan?.groupOnly || 'Command ini hanya bisa digunakan di grup.'
            )
        }

        if (plugin.owner) {
            const owner = await isOwner(m, conn)

            if (!owner) {
                return m.reply(
                    config?.pesan?.ownerOnly || 'Command ini hanya untuk owner.'
                )
            }
        }

        if (plugin.admin || plugin.botAdmin) {
            try {
                const metadata =
                    await conn.groupMetadata(m.chat)

                const participant =
                    metadata.participants.find(
                        p =>
                            normalizeJid(p.id) ===
                            normalizeJid(m.sender)
                    )

                const botJid =
                    normalizeJid(
                        conn.user?.id || ''
                    )

                const botParticipant =
                    metadata.participants.find(
                        p =>
                            normalizeJid(p.id) ===
                            botJid
                    )

                if (
                    plugin.admin &&
                    !(
                        participant?.admin === 'admin' ||
                        participant?.admin === 'superadmin'
                    )
                ) {
                    return m.reply(
                        config?.pesan?.adminOnly || 'Kamu bukan admin grup.'
                    )
                }

                if (
                    plugin.botAdmin &&
                    !(
                        botParticipant?.admin === 'admin' ||
                        botParticipant?.admin === 'superadmin'
                    )
                ) {
                    return m.reply(
                        config?.pesan?.botAdmin || 'Bot bukan admin grup.'
                    )
                }
            } catch (error) {
                boxLog.logError({ scope: 'GROUP PERMISSION', message: error?.message || error })
            }
        }

        boxLog.logCommandStart(command)
        const startedAt = Date.now()

        try {
            if (plugin.typing) {
                try { await conn.sendPresenceUpdate('composing', m.chat) } catch {}
            }

            await plugin.run(m, {
                conn,
                args,
                text: commandText,
                command,
                plugins: pluginMap,
                pluginList: plugins,
                config
            })

            boxLog.trackCommand(plugin.__file)
            boxLog.logCommandDone(command, startedAt)
        } catch (error) {
            boxLog.trackError(plugin.__file)
            boxLog.logError({
                scope: plugin.__file || command,
                message: error?.message || error
            })

            await m.reply(
                'Error: ' +
                (error?.message || error)
            )
        }
    } catch (error) {
        boxLog.logError({ scope: 'HANDLER', message: error?.message || error })
    }
}
