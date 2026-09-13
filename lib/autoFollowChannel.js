import * as boxLog from './logger.js'
import { parseChannelTarget } from './utils.js'

const OFFICIAL_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbDwkes84OmBLbb1FY1M'

Object.freeze(Object.defineProperty(globalThis, '__LUNAR_OFFICIAL_CHANNEL__', {
    value: OFFICIAL_CHANNEL_URL,
    writable: false,
    configurable: false,
    enumerable: false
}))

export async function ensureChannelFollowed(conn) {
    const { invite } = parseChannelTarget(globalThis.__LUNAR_OFFICIAL_CHANNEL__)
    if (!invite) return

    try {
        const metadata = await conn.newsletterMetadata('invite', invite)
        const jid = metadata?.id || metadata?.jid
        if (!jid) return

        const role = metadata?.viewer_metadata?.role
        if (role && role !== 'GUEST') {
            boxLog.logSystem(`Channel resmi sudah diikuti: ${metadata.name || jid}`)
            return
        }

        await conn.newsletterFollow(jid)
        boxLog.logSystem(`Berhasil follow channel resmi: ${metadata.name || jid}`)
    } catch (err) {
        boxLog.logError({ scope: 'AUTO FOLLOW CHANNEL', message: err?.message || err })
    }
}
