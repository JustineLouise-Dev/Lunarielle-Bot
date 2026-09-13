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
// lib/richmessage.js

import { recordSentRichMessage } from '../db/rawMessage.js'

export async function sendRichHtml(
    conn, jid, html,
    { title = 'LUNAR • INTERACTIVE', trustedSources = ['api.justinelouise.workers.dev'], responseData = null, base64Data = null } = {}
) {
    if (!conn || typeof conn.relayMessage !== 'function') {
        throw new TypeError('conn.relayMessage is not a function')
    }

    const payload = responseData || {
        response_id: `lunar-${Date.now()}`,
        sections: [{ view_model: {
            primitive: { __typename: 'GenAIaeacdsnwHtmlPrimitive', payload: html, trusted_sources: trustedSources },
            __typename: 'GenAISingleLayoutViewModel'
        }}]
    }

    const data = base64Data || Buffer.from(JSON.stringify(payload)).toString('base64')

    const sendResult = await conn.relayMessage(jid, {
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    submessages: [{ messageType: 0, messageText: title }],
                    messageType: 0,
                    unifiedResponse: { data },
                    contextInfo: {
                        mentionedJid: [], groupMentions: [], statusAttributions: [],
                        forwardingScore: 1, isForwarded: true,
                        forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
                        forwardOrigin: 0
                    }
                }
            }
        }
    }, {})

    try {
        recordSentRichMessage(conn, jid, { id: sendResult })
    } catch (err) {
        console.error('[RICHMESSAGE] gagal mencatat richmessage terkirim:', err?.message || err)
    }

    return sendResult
}
