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
// src/connectionHandler.js

import qrcode from 'qrcode-terminal'
import chalk from 'chalk'
import readline from 'node:readline'
import { config, OFFICIAL_CHANNEL_URL } from '../settings.js'
import { handleRestartNotification } from '../lib/notifRestart.js'
import { parseChannelTarget } from '../lib/utils.js'

const BANNER_WIDTH = 60
const MAX_RECONNECT_ATTEMPTS = 10

function centerText(text, width) {
  if (text.length >= width) return text
  const padTotal = width - text.length
  const padLeft = Math.floor(padTotal / 2)
  const padRight = padTotal - padLeft
  return ' '.repeat(padLeft) + text + ' '.repeat(padRight)
}

function logEvent(eventName) {
  const line = '='.repeat(BANNER_WIDTH)
  const label = centerText(`[EVENT] ${eventName}`, BANNER_WIDTH)

  return (payload) => {
    if (!config.eventAll) return

    console.log(`\n${chalk.gray(line)}`)
    console.log(chalk.cyan.bold(label))
    console.log(chalk.gray(line))
    console.dir(payload, { depth: null, colors: true })
    console.log(`${chalk.gray(line)}\n`)
  }
}

async function requestPairing(sock) {
  try {
    let phoneNumber = config.botNumber ? String(config.botNumber).replace(/\D/g, '') : ''

    if (!phoneNumber) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
      phoneNumber = (await new Promise(res =>
        rl.question(chalk.cyan('Masukkan nomor WA untuk Pairing (Kosongkan jika hanya ingin QR): '), res)
      )).replace(/\D/g, '')
      rl.close()
    }

    if (!phoneNumber) return

    let customCode = config.customPairing ? String(config.customPairing).trim().toUpperCase() : null

    if (customCode && (customCode.length !== 8 || !/^[1-9A-HJ-NP-TV-Z]{8}$/.test(customCode))) {
      console.log(chalk.red.bold(`[ERROR] Custom Code "${customCode}" tidak valid! (Harus 8 Karakter & tanpa 0, I, O, U)`))
      return
    }

    const code = customCode
      ? await sock.auth.requestPairingCode(phoneNumber, true, customCode)
      : await sock.auth.requestPairingCode(phoneNumber)

    const formatted = code?.match(/.{1,4}/g)?.join('-') ?? code

    console.log(chalk.bgMagenta.white.bold('\n   KODE PAIRING ANDA:   '))
    console.log(chalk.bgBlack.greenBright.bold(`      ${formatted}      `))

    if (config.usePairingCode) {
      console.log(chalk.yellow('\nTautkan HP dengan kode pairing di atas.\n'))
    } else {
      console.log(chalk.yellow('\nPilih: Scan QR di atas ATAU tautkan dengan kode pairing.\n'))
    }
  } catch (err) {
    console.log(chalk.red('[Pairing] Gagal:'), err?.message || err)
  }
}

function createReconnector(sock) {
  let attempt = 0
  let isReconnecting = false

  async function reconnect() {
    if (isReconnecting) return
    isReconnecting = true

    try {
      while (attempt < MAX_RECONNECT_ATTEMPTS) {
        const delayMs = Math.min(30_000, 1_000 * 2 ** attempt)
        attempt += 1
        console.log(chalk.yellow(`[WA] Reconnect dalam ${delayMs}ms (percobaan ke-${attempt})`))
        await new Promise(res => setTimeout(res, delayMs))

        try {
          await sock.connect()
          return
        } catch (err) {
          console.error(chalk.red('[WA] Reconnect gagal:'), err?.message || err)
        }
      }
      console.log(chalk.bgRed.white.bold(`\n [WA] Menyerah setelah ${attempt}x percobaan reconnect. \n`))
    } finally {
      isReconnecting = false
    }
  }

  return {
    reconnect,
    resetAttempts: () => { attempt = 0 }
  }
}

async function isAlreadyFollowingChannel(sock, jid) {
  try {
    const subscribed = await sock.newsletter.listSubscribed()
    return (subscribed || []).some(nl => nl?.jid === jid)
  } catch (err) {
    console.error(chalk.red('[CHANNEL] Gagal cek daftar subscribed, lanjut coba follow:'), err?.message || err)
    return false
  }
}

async function autoFollowOfficialChannel(sock) {
  try {
    const { invite, jid: parsedJid } = parseChannelTarget(OFFICIAL_CHANNEL_URL)
    let jid = parsedJid

    if (!jid && invite) {
      const metadata = await sock.newsletter.fetchByInvite(invite)
      jid = metadata?.jid
    }

    if (!jid) {
      console.error(chalk.red('[CHANNEL] Gagal resolve JID channel resmi, auto-follow dibatalkan.'))
      return
    }

    const alreadyFollowing = await isAlreadyFollowingChannel(sock, jid)
    if (alreadyFollowing) {
      console.log(chalk.gray(`[CHANNEL] Sudah bergabung di channel resmi (${jid}), skip follow.`))
      return
    }

    await sock.newsletter.follow(jid)
    console.log(chalk.green(`[CHANNEL] Berhasil follow channel resmi (${jid})`))
  } catch (err) {
    console.error(chalk.red('[CHANNEL] Gagal auto-follow channel resmi:'), err?.message || err)
  }
}

export function connectionHandler(sock) {
  const { reconnect, resetAttempts } = createReconnector(sock)
  let isPairingRequested = false
  let hasAutoFollowed = false

  sock.on('connection', (event) => {
    logEvent('connection')(event)

    if (event.status === 'open') {
      resetAttempts()
      console.log(chalk.bgGreen.black.bold('\n 🚀 [WA] BOT BERHASIL TERHUBUNG! \n'))
      handleRestartNotification(sock).catch(err => {
        console.error(chalk.red('[RESTART NOTIF ERROR]:'), err?.message || err)
      })

      if (!hasAutoFollowed) {
        hasAutoFollowed = true
        void autoFollowOfficialChannel(sock)
      }
      return
    }

    if (event.isLogout) {
      console.log(chalk.bgRed.white.bold('\n ⚠️ [WA] Device di-logout dari HP. Perlu pairing ulang. \n'))
      return
    }

    console.log(chalk.yellow(`[WA] Koneksi terputus: ${event.reason ?? 'unknown'} (code: ${event.code ?? '-'})`))
    void reconnect()
  })

  sock.on('auth_qr', ({ qr, ttlMs }) => {
    if (!config.usePairingCode) {
      console.log(chalk.cyan.bold('\n── QR CODE ──'))
      qrcode.generate(qr, { small: true })
      console.log(chalk.gray(`QR berlaku ${ttlMs}ms`))
    }

    if (config.usePairingCode && !isPairingRequested) {
      isPairingRequested = true
      void requestPairing(sock)
    }
  })

  sock.on('auth_pairing_required', () => {
    if (config.usePairingCode && !isPairingRequested) {
      isPairingRequested = true
      void requestPairing(sock)
    }
  })

  sock.on('auth_paired', ({ credentials }) => {
    console.log(chalk.green.bold(`\n[WA] Berhasil login sebagai ${credentials.meJid}\n`))
  })

  sock.on('auth_passkey_required', ({ hasSigner }) => {
    if (hasSigner) {
      console.log(chalk.cyan('[WA] Server minta passkey — menjalankan Shortcake handshake…'))
    } else {
      console.log(chalk.red('[WA] Passkey dibutuhkan tapi signPasskeyAssertion belum dikonfigurasi. Link gagal.'))
    }
  })

  const knownEvents = [

    'message_send',
    'message_addon',
    'message_protocol',
    'message_bot_chunk',
    'message_unavailable',

    'presence',
    'chatstate',
    'call',

    'group',
    'newsletter',
    'newsletter_message_update',
    'business',
    'picture',
    'privacy',
    'blocklist',

    'mutation',
    'mutation_send',
    'history_sync_chunk',
    'group_history_bundle',
    'offline_resume',
    'offline_thread_metadata',
    'mex_notification',

    'companion_host_linked',
    'companion_host_revoked',
    'companion_host_error',

    'stream_failure',
    'stanza_error',
  ]

  for (const eventName of knownEvents) {
    sock.on(eventName, logEvent(eventName))
  }

  sock.on('debug_client_error', ({ error }) => {
    console.error(chalk.red('[WA] Client error:'), error?.message || error)
  })
}
