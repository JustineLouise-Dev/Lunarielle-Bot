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
// index.js

import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    Browsers,
    fetchLatestBaileysVersion
} from 'baileys'

import { Boom } from '@hapi/boom'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import readline from 'readline'
import chalk from 'chalk'

import fs from 'fs'

import {
    loadPlugins,
    handleMessage
} from './lib/handler.js'

import * as boxLog from './lib/logger.js'
import { handleGroupParticipantsUpdate } from './lib/welcome.js'
import { ensureChannelFollowed } from './lib/autoFollowChannel.js'

const config = JSON.parse(fs.readFileSync(new URL('./config.json', import.meta.url)))

const logger = pino({
    level: 'silent'
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

function ask(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer.trim())
        })
    })
}

async function chooseLogin() {
    console.clear()

    boxLog.state.botName = config.botName || boxLog.state.botName
    boxLog.printBanner()

    console.log(chalk.gray('\n  1. Pairing Code'))
    console.log(chalk.gray('  2. QR Code\n'))

    while (true) {
        const choice = await ask(
            'Pilih metode login [1/2]: '
        )

        if (choice === '1') return 'pairing'
        if (choice === '2') return 'qr'

        console.log('❌ Pilihan tidak valid.')
    }
}

async function startBot(loginMethod, pairingPhone = null) {

    const {
        state,
        saveCreds
    } = await useMultiFileAuthState(
        config.session
    )

    let pairingRequested = false
    let reconnecting = false
    let phoneNumber = null

    if (loginMethod === 'pairing' && !state.creds.registered) {
        const number = pairingPhone || await ask('\nMasukkan nomor WhatsApp (contoh 628xxxxxxxxxx): ')
        phoneNumber = number.replace(/\D/g, '')

        if (!/^\d{8,15}$/.test(phoneNumber)) {
            throw new Error('Nomor WhatsApp tidak valid. Gunakan kode negara tanpa +, spasi, atau tanda baca.')
        }
    }

    let waVersion
    try {
        const { version, isLatest } = await fetchLatestBaileysVersion()
        waVersion = version
        console.log(chalk.dim(`📦 WhatsApp Web version: ${version.join('.')}${isLatest ? ' (latest)' : ' (bukan versi terbaru)'}`))
    } catch (error) {
        console.log(chalk.yellow('⚠️ Gagal mengambil versi WhatsApp Web terbaru, memakai versi bawaan Baileys.'))
    }

    const sock = makeWASocket({
        auth: state,
        logger,
        version: waVersion,

        browser: Browsers.ubuntu('Chrome'),

        printQRInTerminal: false,
        markOnlineOnConnect: false,
        generateHighQualityLinkPreview: true
    })

    sock.ev.on(
        'creds.update',
        saveCreds
    )

    sock.ev.on(
        'connection.update',
        async update => {

            const {
                connection,
                lastDisconnect,
                qr
            } = update

            if (
                loginMethod === 'pairing' &&
                !state.creds.registered &&
                qr &&
                !pairingRequested
            ) {
                pairingRequested = true

                try {

                    await new Promise(resolve => setTimeout(resolve, 500))

                    console.log(
                        '\n⏳ Meminta pairing code untuk ' + phoneNumber + '...'
                    )

                    const code = await sock.requestPairingCode(phoneNumber)

                    console.log(chalk.gray('\n╭──────────────────────────────╮'))
                    console.log(chalk.gray('│') + chalk.bold.cyan('        PAIRING CODE          ') + chalk.gray('│'))
                    console.log(chalk.gray('├──────────────────────────────┤'))
                    console.log(chalk.gray('│') + chalk.bold.white(`           ${code}            `) + chalk.gray('│'))
                    console.log(chalk.gray('╰──────────────────────────────╯'))
                    console.log(chalk.dim(`
📱 Di WhatsApp, buka:
   Perangkat tertaut → Tautkan perangkat
   → Tautkan dengan nomor telepon

Jika WhatsApp menampilkan notifikasi permintaan penautan,
ikuti notifikasi tersebut dan masukkan kode di atas.
`))

                } catch (e) {
                    pairingRequested = false
                    boxLog.logError({ scope: 'PAIRING', message: e?.message || e })
                }
            }

            if (
                loginMethod === 'qr' &&
                qr &&
                !state.creds.registered
            ) {

                console.log(
                    '\n📱 Scan QR berikut:\n'
                )

                qrcode.generate(
                    qr,
                    {
                        small: true
                    }
                )
            }

            if (connection === 'open') {

                reconnecting = false
                boxLog.state.botId = sock.user?.id || null
                boxLog.state.startTime = Date.now()

                boxLog.logConnection('CONNECTED', sock.user?.id || '')
                boxLog.printBanner()
                boxLog.logSystem('Waiting for incoming messages...')

                ensureChannelFollowed(sock)
            }

            if (connection === 'close') {

                const statusCode =
                    new Boom(
                        lastDisconnect?.error
                    )?.output?.statusCode

                boxLog.logConnection('DISCONNECTED', `status code: ${statusCode}`)

                if (
                    statusCode ===
                    DisconnectReason.loggedOut
                ) {

                    console.log(chalk.red('❌ Session logout.'))
                    console.log(chalk.dim('Hapus folder session/ untuk login ulang.'))

                    process.exit(0)
                }

                if (reconnecting)
                    return

                reconnecting = true

                console.log(chalk.yellow('🔄 Reconnecting dalam 3 detik...'))

                setTimeout(() => {

                    startBot(
                        state.creds.registered ? 'existing' : loginMethod,
                        phoneNumber
                    ).catch(console.error)

                }, 3000)
            }
        }
    )

    sock.ev.on(
        'messages.upsert',
        async ({
            messages,
            type
        }) => {

            for (
                const message of
                messages || []
            ) {

                try {

                    if (!message?.message)
                        continue

                    if (
                        message.key?.remoteJid ===
                        'status@broadcast'
                    )
                        continue

                    await handleMessage(
                        sock,
                        message
                    )

                } catch (e) {

                    boxLog.trackError()
                    boxLog.logError({ scope: 'MESSAGE', message: e?.message || e })
                }
            }
        }
    )

    sock.ev.on(
        'group-participants.update',
        async (event) => {
            try {
                const { id: groupId, participants, action } = event

                let groupName = groupId
                try {
                    const metadata = await sock.groupMetadata(groupId)
                    groupName = metadata?.subject || groupId
                } catch {}

                for (const participant of participants || []) {
                    const user = participant.replace(/@.+$/, '')

                    if (action === 'add') {
                        boxLog.logGroupEvent('join', { user, groupName })
                    } else if (action === 'remove') {
                        boxLog.logGroupEvent('leave', { user, groupName })
                    }
                }

                await handleGroupParticipantsUpdate(sock, { groupJid, participants, action })
            } catch (e) {
                boxLog.logError({ scope: 'GROUP EVENT', message: e?.message || e })
            }
        }
    )

    return sock
}

async function main() {

    console.log(chalk.dim('🔄 Memeriksa session...'))

    await loadPlugins()

    const statsIntervalMs = config.statsIntervalMs || 5 * 60 * 1000
    setInterval(() => {
        boxLog.printStats()
        boxLog.logPluginActivity()
    }, statsIntervalMs)

    const {
        state
    } = await useMultiFileAuthState(
        config.session
    )

    if (state.creds.registered) {

        console.log(chalk.green('🔐 Session ditemukan.'))
        console.log(chalk.dim('🚀 Langsung reconnect...\n'))

        await startBot(
            'existing'
        )

        return
    }

    console.log(chalk.yellow('🆕 Session tidak ditemukan.'))

    const loginMethod =
        await chooseLogin()

    await startBot(
        loginMethod
    )
}

main().catch(error => {

    boxLog.logError({ scope: 'FATAL', message: error?.message || error })

    process.exit(1)
})
