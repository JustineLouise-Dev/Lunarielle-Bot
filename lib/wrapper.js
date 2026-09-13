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
// lib/wrapper.js

import { proto, generateWAMessageFromContent, downloadMediaMessage } from 'baileys'

export async function sendListMenu(conn, jid, data, options = {}) {
    const {
        title = '',
        text,
        footer = '',
        buttonText,
        sections
    } = data

    const listMessage = {
        title,
        description: text,
        buttonText,
        listType: proto.Message.ListMessage.ListType.SINGLE_SELECT,
        sections: sections.map(section => ({
            title: section.title,
            rows: section.rows.map(row => ({
                title: row.title,
                description: row.description || '',
                rowId: row.rowId
            }))
        })),
        footerText: footer
    }

    const messageContent = { listMessage }

    if (options.quoted) {
        messageContent.contextInfo = {
            stanzaId: options.quoted.key?.id,
            participant: options.quoted.key?.participant || options.quoted.key?.remoteJid,
            quotedMessage: options.quoted.message
        }
    }

    const waMessage = generateWAMessageFromContent(
        jid,
        messageContent,
        { userJid: conn.user?.id }
    )

    const additionalNodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'list',
                    attrs: {
                        type: 'product_list',
                        v: '2'
                    }
                }
            ]
        }
    ]

    return conn.relayMessage(
        jid,
        waMessage.message,
        {
            messageId: waMessage.key.id,
            additionalNodes
        }
    )
}

export async function sendInteractiveMenu(conn, jid, data, options = {}) {
    const { title = '', text, footer = '', buttons } = data

    const nativeButtons = buttons.map((btn) => {
        if (btn.type === 'list') {
            return {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                    title: btn.displayText,
                    sections: btn.sections.map((section) => ({
                        title: section.title,
                        highlight_label: '',
                        rows: section.rows.map((row) => ({
                            header: '',
                            title: row.title,
                            description: row.description || '',
                            id: row.rowId
                        }))
                    }))
                })
            }
        }

        return {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: btn.displayText,
                id: btn.id
            })
        }
    })

    const interactive = {
        header: title ? { title, hasMediaAttachment: false } : undefined,
        body: { text },
        footer: footer ? { text: footer } : undefined,
        nativeFlowMessage: { buttons: nativeButtons, messageVersion: 1 },
        contextInfo: {}
    }

    if (options.quoted) {
        interactive.contextInfo.stanzaId = options.quoted.key?.id
        interactive.contextInfo.participant = options.quoted.key?.participant || options.quoted.key?.remoteJid
        interactive.contextInfo.quotedMessage = options.quoted.message
    }

    const isGroup = typeof jid === 'string' && (jid.endsWith('@g.us') || jid.endsWith('@broadcast'))
    const additionalNodes = [
        {
            tag: 'biz',
            attrs: {},
            content: [
                {
                    tag: 'interactive',
                    attrs: { type: 'native_flow', v: '1' },
                    content: [
                        { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                    ]
                }
            ]
        }
    ]
    if (!isGroup) {
        additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })
    }

    const relayResult = await conn.relayMessage(
        jid,
        { interactiveMessage: interactive },
        { additionalNodes }
    )

    return { key: { id: relayResult, fromMe: true, remoteJid: jid } }
}

export async function downloadQuotedMedia(quoted) {
    if (!quoted?.message) {
        throw new Error('Tidak ada media pada pesan yang di-reply.')
    }

    return downloadMediaMessage(
        { message: quoted.message, key: quoted.key },
        'buffer',
        {}
    )
}

export default {
    sendListMenu,
    sendInteractiveMenu,
    downloadQuotedMedia
}
