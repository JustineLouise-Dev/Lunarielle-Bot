import os from 'os'
import chalk from 'chalk'

const WIDTH = 78

export const state = {
    botName: 'LUNAR BOT',
    startTime: Date.now(),

    whatsapp: 'CONNECTING',
    botId: null,

    counters: {
        text: 0,
        image: 0,
        video: 0,
        audio: 0,
        voice: 0,
        sticker: 0,
        document: 0,
        contact: 0,
        location: 0,
        reaction: 0,
        other: 0
    },

    messagesReceived: 0,
    messagesSent: 0,
    commandsExecuted: 0,
    errors: 0,

    activeUsers: new Set(),
    activeGroups: new Set(),

    pluginStats: new Map()
}

function bumpPlugin(file, isError = false) {
    if (!file) return
    const entry = state.pluginStats.get(file) || { calls: 0, errors: 0 }
    if (isError) entry.errors++
    else entry.calls++
    state.pluginStats.set(file, entry)
}

export function trackIncoming({ type, sender, chat, isGroup }) {
    state.messagesReceived++

    const key = state.counters.hasOwnProperty(type) ? type : 'other'
    state.counters[key]++

    if (sender) state.activeUsers.add(sender)
    if (isGroup && chat) state.activeGroups.add(chat)
}

export function trackCommand(file) {
    state.commandsExecuted++
    bumpPlugin(file, false)
}

export function trackError(file) {
    state.errors++
    if (file) bumpPlugin(file, true)
}

function visualWidth(str) {
    let width = 0
    for (const ch of str) {
        const code = ch.codePointAt(0)

        if (code > 0x1100 && (
            code <= 0x115f ||
            (code >= 0x2600 && code <= 0x27bf) ||
            (code >= 0x1f300 && code <= 0x1faff) ||
            (code >= 0x2190 && code <= 0x21ff) ||
            (code >= 0x2300 && code <= 0x23ff)
        )) {
            width += 2
        } else {
            width += 1
        }
    }
    return width
}

function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '')
}

function pad(str, width = WIDTH) {
    const visible = visualWidth(stripAnsi(str))
    const fill = Math.max(0, width - visible)
    return str + ' '.repeat(fill)
}

const TL = '╭', TR = '╮', BL = '╰', BR = '╯', H = '─', V = '│'

function top() {
    return chalk.gray(TL + H.repeat(WIDTH + 2) + TR)
}

function bottom() {
    return chalk.gray(BL + H.repeat(WIDTH + 2) + BR)
}

function divider() {
    return chalk.gray('├' + H.repeat(WIDTH + 2) + '┤')
}

function line(content = '') {
    return chalk.gray(V) + ' ' + pad(content) + ' ' + chalk.gray(V)
}

function blank() {
    return line('')
}

function sectionTitle(icon, title) {
    const text = `${icon} ${title}`
    const totalPad = WIDTH - visualWidth(text)
    const left = Math.floor(totalPad / 2)
    const centered = ' '.repeat(Math.max(0, left)) + text
    return line(chalk.bold.cyan(centered))
}

function row(label, value) {
    return line(`  ${chalk.gray(label)}${' '.repeat(Math.max(1, 14 - label.length))}: ${value}`)
}

function formatUptime(ms) {
    const totalSec = Math.floor(ms / 1000)
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
    const s = String(totalSec % 60).padStart(2, '0')
    return `${h}h ${m}m ${s}s`
}

function formatMB(bytes) {
    return (bytes / 1024 / 1024).toFixed(0) + 'MB'
}

function bar(pct, width = 20) {
    const filled = Math.round((pct / 100) * width)
    return '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled))
}

function timestamp() {
    return new Date().toLocaleTimeString('id-ID', { hour12: false })
}

function truncate(str, max) {
    if (str.length <= max) return str
    return str.slice(0, max - 1) + '…'
}

function ts() {
    return chalk.gray(`[${timestamp()}]`)
}

function tag(icon, label, color = chalk.white) {
    return color.bold(`${icon} ${label.padEnd(9)}`)
}

function kv(label, value) {
    return `${chalk.gray(label)}${chalk.white(value)}`
}

export function printBanner() {
    const uptime = formatUptime(Date.now() - state.startTime)
    const mem = process.memoryUsage()
    const totalMemBytes = os.totalmem()

    const waColor = state.whatsapp === 'CONNECTED' ? chalk.green : chalk.yellow
    const waDot = state.whatsapp === 'CONNECTED' ? chalk.green('●') : chalk.yellow('●')

    const lines = []
    lines.push(top())
    lines.push(sectionTitle('🤖', `${state.botName}`))
    lines.push(line(chalk.dim('           Advanced Logger')))
    lines.push(divider())
    lines.push(blank())
    lines.push(line(
        `  ${waDot} WHATSAPP   ${waColor(state.whatsapp.padEnd(12))}` +
        `⚡ UPTIME     ${chalk.white(uptime)}`
    ))
    lines.push(line(
        `  💾 RAM       ${chalk.white(formatMB(mem.rss) + ' / ' + formatMB(totalMemBytes))}`
    ))
    lines.push(blank())
    lines.push(bottom())

    console.log(lines.join('\n'))
}

export function printStats() {
    const c = state.counters
    const lines = []

    lines.push(top())
    lines.push(sectionTitle('📊', 'MESSAGE STATISTICS'))
    lines.push(divider())
    lines.push(blank())
    lines.push(line(`  📝 TEXT ${String(c.text).padStart(6)}   🖼️ IMAGE ${String(c.image).padStart(6)}   🎥 VIDEO ${String(c.video).padStart(6)}`))
    lines.push(line(`  🎵 AUDIO ${String(c.audio).padStart(5)}   🏷️ STICKER ${String(c.sticker).padStart(4)}   📄 DOC ${String(c.document).padStart(6)}`))
    lines.push(blank())
    lines.push(divider())
    lines.push(sectionTitle('📈', 'BOT STATISTICS'))
    lines.push(divider())
    lines.push(blank())
    lines.push(row('Received', chalk.white(state.messagesReceived)))
    lines.push(row('Sent', chalk.white(state.messagesSent)))
    lines.push(row('Commands', chalk.white(state.commandsExecuted)))
    lines.push(row('Active Users', chalk.white(state.activeUsers.size)))
    lines.push(row('Active Groups', chalk.white(state.activeGroups.size)))
    lines.push(row('Errors', state.errors > 0 ? chalk.red(state.errors) : chalk.green(0)))
    lines.push(blank())

    const total = state.commandsExecuted
    const successPct = total > 0
        ? (((total - state.errors) / total) * 100).toFixed(1)
        : '100.0'
    lines.push(line(`  ${chalk.dim('SUCCESS RATE')}`))
    lines.push(line(`  ${chalk.green(bar(Number(successPct)))} ${successPct}%`))
    lines.push(blank())
    lines.push(bottom())

    console.log(lines.join('\n'))
}

export function logIncomingMessage({ senderName, number, chat, isGroup, id, type, text, command, pluginFile }) {
    const who = number ? `${senderName} (${number})` : senderName || '-'
    const room = isGroup ? chalk.magenta('GROUP') : chalk.blue('DM')
    const parts = [ts(), tag('💬', 'MESSAGE', chalk.cyan), kv('from ', who), chalk.gray('·'), room]

    if (command) parts.push(chalk.gray('·'), kv('cmd ', chalk.yellow(command)))
    else if (type && type !== 'text') parts.push(chalk.gray('·'), kv('type ', type))

    console.log(parts.join(' '))

    if (text && command) {
        console.log(chalk.gray(`           ↳ ${truncate(text, 80)}`))
    }
    if (pluginFile) {
        console.log(chalk.gray(`           ↳ ${chat} · ${id || '-'} · ${pluginFile}`))
    }
}

export function logCommandStart(command) {
    console.log(`${ts()} ${tag('⚡', 'COMMAND', chalk.yellow)} ${chalk.yellow.bold(command)}`)
}

export function logCommandDone(command, startedAt) {
    const secs = ((Date.now() - startedAt) / 1000).toFixed(2)
    console.log(`${ts()} ${tag('✓', 'DONE', chalk.green)} ${chalk.green(command)} ${chalk.dim(`(${secs}s)`)}`)
}

export function logGroupEvent(kind, info = {}) {
    if (kind === 'message') {
        console.log(`${ts()} ${tag('👥', 'GROUP', chalk.magenta)} ${kv('', info.groupName || '-')} ${chalk.gray('·')} ${kv('', info.sender || '-')} ${chalk.gray('·')} ${info.type || '-'}`)
    } else if (kind === 'join') {
        console.log(`${ts()} ${tag('👤', 'JOIN', chalk.green)} ${chalk.white(info.user || '-')} ${chalk.gray('→')} ${info.groupName || '-'}`)
    } else if (kind === 'leave') {
        console.log(`${ts()} ${tag('👤', 'LEFT', chalk.red)} ${chalk.white(info.user || '-')} ${chalk.gray('→')} ${info.groupName || '-'}`)
    }
}

export function logPluginActivity() {
    const lines = []

    lines.push(top())
    lines.push(sectionTitle('🔌', 'PLUGIN ACTIVITY'))
    lines.push(divider())
    lines.push(blank())

    if (state.pluginStats.size === 0) {
        lines.push(line(chalk.dim('  Belum ada plugin yang dipanggil.')))
    } else {
        for (const [file, stat] of state.pluginStats.entries()) {
            const mark = stat.errors > 0 ? chalk.yellow('!') : chalk.green('✓')
            const name = file.padEnd(24)
            lines.push(line(`  ${mark} ${chalk.white(name)} ${String(stat.calls).padStart(4)} calls   ${stat.errors > 0 ? chalk.red(stat.errors + ' errors') : chalk.dim('0 errors')}`))
        }
    }

    lines.push(blank())
    lines.push(bottom())

    console.log(lines.join('\n'))
}

export function logError({ scope, message, detail }) {
    const errText = truncate(String(message || detail || 'unknown'), 90)
    const scopeText = scope ? chalk.dim(`[${scope}] `) : ''
    console.log(`${ts()} ${tag('⚠️', 'ERROR', chalk.red)} ${scopeText}${chalk.red(errText)}`)
}

export function logSystem(text) {
    console.log(`${ts()} ${tag('●', 'SYSTEM', chalk.cyan)} ${chalk.white(text)}`)
}

export function logConnection(status, detail = '') {
    state.whatsapp = status
    const color = status === 'CONNECTED' ? chalk.green : status === 'DISCONNECTED' ? chalk.red : chalk.yellow
    console.log(color.bold(`● WHATSAPP ${status}`) + (detail ? chalk.dim('  ' + detail) : ''))
}

export default {
    state,
    trackIncoming,
    trackCommand,
    trackError,
    printBanner,
    printStats,
    logIncomingMessage,
    logCommandStart,
    logCommandDone,
    logGroupEvent,
    logPluginActivity,
    logError,
    logSystem,
    logConnection
}
