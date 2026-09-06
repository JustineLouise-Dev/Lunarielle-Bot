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
// plugins/owner/stats.js

import os from 'os'
import { formatUptime } from '../../lib/messageStyle.js'

function formatBytes(bytes) {
  if (bytes <= 0) return '0 MB'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`
  return `${mb.toFixed(1)} MB`
}

export default {
  command: 'stats',
  alias: ['statistic', 'sysinfo'],
  category: 'owner',
  description: 'Statistik sistem lengkap: speed bot, RAM, CPU, dan info runtime (khusus owner)',
  onlyOwner: true,

  async execute(m) {
    const start = performance.now()
    await m.reply('🔄 Mengambil statistik sistem...')
    const pingMs = (performance.now() - start).toFixed(0)

    const cpus = os.cpus()
    const cpuModel = cpus[0]?.model?.trim() || 'Tidak diketahui'
    const cpuCount = cpus.length
    const cpuSpeed = cpus[0]?.speed ? `${(cpus[0].speed / 1000).toFixed(2)} GHz` : '-'
    const loadAvg = os.loadavg().map((n) => n.toFixed(2)).join(' / ')

    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem
    const memPercent = ((usedMem / totalMem) * 100).toFixed(1)
    const procMem = process.memoryUsage()

    const platform = `${os.type()} ${os.release()} (${os.arch()})`
    const nodeVersion = process.version
    const uptimeBot = formatUptime(process.uptime())
    const uptimeSystem = formatUptime(os.uptime())
    const hostname = os.hostname()

    let text = ''
    text += `👑 *OWNER STATISTICS*\n`
    text += `┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n\n`

    text += `⚡ *Kecepatan Bot*\n`
    text += `   ↳ Response  : ${pingMs} ms\n`
    text += `   ↳ Uptime    : ${uptimeBot}\n\n`

    text += `🧠 *CPU*\n`
    text += `   ↳ Model     : ${cpuModel}\n`
    text += `   ↳ Jumlah    : ${cpuCount} core\n`
    text += `   ↳ Clock     : ${cpuSpeed}\n`
    text += `   ↳ Load Avg  : ${loadAvg} (1m/5m/15m)\n\n`

    text += `💾 *RAM*\n`
    text += `   ↳ Terpakai  : ${formatBytes(usedMem)} / ${formatBytes(totalMem)} (${memPercent}%)\n`
    text += `   ↳ Tersedia  : ${formatBytes(freeMem)}\n`
    text += `   ↳ Proses Bot: ${formatBytes(procMem.rss)} (heap: ${formatBytes(procMem.heapUsed)})\n\n`

    text += `🖥️ *Sistem*\n`
    text += `   ↳ Platform  : ${platform}\n`
    text += `   ↳ Hostname  : ${hostname}\n`
    text += `   ↳ Node.js   : ${nodeVersion}\n`
    text += `   ↳ Uptime OS : ${uptimeSystem}\n`

    text += `\n┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈┈\n`
    text += `✦ Khusus Owner ✦`

    return m.reply(text)
  }
}
