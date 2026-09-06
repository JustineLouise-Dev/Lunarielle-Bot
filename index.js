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
//
// index.js

import chalk from 'chalk'
import { createSocket } from './src/createSocket.js'
import { connectionHandler } from './src/connectionHandler.js'
import { messageHandler } from './src/messageHandler.js'
import { groupEventHandler } from './src/groupEventHandler.js'
import { startThumbAutoRefresh } from './lib/thumbAutoRefresh.js'

let sock

try {
  sock = createSocket()

  connectionHandler(sock)
  groupEventHandler(sock)

  messageHandler(sock).catch(err => {
    console.error(
      chalk.red('[MESSAGE] Handler error:'),
      err?.stack || err?.message || err
    )
  })

  await sock.connect()

  startThumbAutoRefresh(sock)

} catch (err) {
  console.error(
    chalk.red('[WA] Gagal connect awal:'),
    err?.stack || err?.message || err
  )

  process.exit(1)
}

let shuttingDown = false

async function shutdown(signal) {
  if (shuttingDown) return

  shuttingDown = true

  console.log(
    chalk.yellow(`\n[WA] Menerima ${signal}, menutup koneksi...`)
  )

  try {
    if (sock) {
      await sock.disconnect()
    }
  } catch (err) {
    console.error(
      chalk.red('[WA] Gagal menutup koneksi:'),
      err?.stack || err?.message || err
    )
  }

  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))