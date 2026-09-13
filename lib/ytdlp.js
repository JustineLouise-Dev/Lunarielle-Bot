import fs from 'fs'
import os from 'os'
import path from 'path'
import { spawn, execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)
let cachedYtDlpPath
let cachedFfmpegPath
let cachedNodePath

async function resolveYtDlpPath() {
    if (cachedYtDlpPath) return cachedYtDlpPath

    if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
        cachedYtDlpPath = process.env.YTDLP_PATH
        return cachedYtDlpPath
    }

    try {
        await execFileAsync('yt-dlp', ['--version'])
        cachedYtDlpPath = 'yt-dlp'
        return cachedYtDlpPath
    } catch {
        throw new Error(
            'yt-dlp tidak ditemukan. Install yt-dlp di sistem, misalnya:\n' +
            '  Termux : pkg install yt-dlp   (atau: pip install -U yt-dlp)\n' +
            '  Debian/Ubuntu : sudo apt install yt-dlp   (atau: pip install -U yt-dlp)\n' +
            '  macOS : brew install yt-dlp\n' +
            'atau set YTDLP_PATH ke lokasi binary yt-dlp.'
        )
    }
}

async function resolveFfmpegPath() {
    if (cachedFfmpegPath) return cachedFfmpegPath

    if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
        cachedFfmpegPath = process.env.FFMPEG_PATH
        return cachedFfmpegPath
    }

    try {
        const mod = await import('ffmpeg-static')
        const staticPath = mod.default
        if (staticPath && fs.existsSync(staticPath)) {
            cachedFfmpegPath = staticPath
            return cachedFfmpegPath
        }
    } catch {}

    try {
        await execFileAsync('ffmpeg', ['-version'])
        cachedFfmpegPath = 'ffmpeg'
        return cachedFfmpegPath
    } catch {
        return null
    }
}

async function resolveNodePath() {
    if (cachedNodePath !== undefined) return cachedNodePath

    if (process.env.NODE_PATH_BIN && fs.existsSync(process.env.NODE_PATH_BIN)) {
        cachedNodePath = process.env.NODE_PATH_BIN
        return cachedNodePath
    }

    try {
        const { stdout } = await execFileAsync(process.platform === 'win32' ? 'where' : 'which', ['node'])
        cachedNodePath = stdout.split('\n')[0].trim() || null
        return cachedNodePath
    } catch {
        cachedNodePath = null
        return cachedNodePath
    }
}

async function buildYoutubeChallengeArgs(url) {
    if (!isYoutubeUrl(url)) return []

    const nodePath = await resolveNodePath()
    const args = []
    if (nodePath) args.push('--js-runtimes', `node:${nodePath}`)
    args.push('--extractor-args', 'youtube:player_client=tv,web,mweb,web_embedded')
    return args
}

export function isYoutubeUrl(str) {
    return /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\/.+/i.test(String(str || '').trim())
}

export function isTiktokUrl(str) {
    return /^(https?:\/\/)?(www\.|vt\.|vm\.|m\.)?tiktok\.com\/.+/i.test(String(str || '').trim())
}

function runYtDlpJson(args) {
    return new Promise(async (resolve, reject) => {
        const ytDlpPath = await resolveYtDlpPath().catch(reject)
        if (!ytDlpPath) return

        const proc = spawn(ytDlpPath, args)
        const chunks = []
        const stderrChunks = []

        proc.stdout.on('data', d => chunks.push(d))
        proc.stderr.on('data', d => stderrChunks.push(d))

        proc.on('error', reject)
        proc.on('close', code => {
            const stdout = Buffer.concat(chunks).toString('utf-8').trim()
            if (code !== 0 || !stdout) {
                const stderrText = Buffer.concat(stderrChunks).toString('utf-8').slice(-800)
                reject(new Error(`yt-dlp keluar dengan kode ${code}. ${stderrText || 'Tidak ada output.'}`))
                return
            }
            resolve(stdout)
        })
    })
}

function normalizeMeta(info) {
    const thumbnail =
        info.thumbnail ||
        (Array.isArray(info.thumbnails) && info.thumbnails.length
            ? info.thumbnails[info.thumbnails.length - 1].url
            : null)

    return {
        id: info.id,
        url: info.webpage_url || info.original_url || info.url,
        title: info.title || info.description || '-',
        channel: info.uploader || info.channel || info.creator || 'Tidak diketahui',
        subscriberCount: info.channel_follower_count ?? null,
        likes: info.like_count ?? null,
        comments: info.comment_count ?? null,
        shares: info.repost_count ?? null,
        views: info.view_count ?? null,
        description: (info.description || '').trim(),
        thumbnail,
        durationSeconds: Number(info.duration || 0)
    }
}

export async function searchOnline(query, limit = 1) {
    const args = [
        `ytsearch${limit}:${query}`,
        '--dump-json',
        '--no-playlist',
        '--skip-download',
        '--no-warnings'
    ]

    const stdout = await runYtDlpJson([...args])
    const lines = stdout.split('\n').filter(Boolean)
    if (!lines.length) return limit === 1 ? null : []

    const results = lines.map(line => normalizeMeta(JSON.parse(line)))
    return limit === 1 ? results[0] : results
}

export async function getMetadata(url) {
    const challengeArgs = await buildYoutubeChallengeArgs(url)
    const stdout = await runYtDlpJson([
        url,
        '--dump-json',
        '--no-playlist',
        '--skip-download',
        '--no-warnings',
        ...challengeArgs
    ])

    const firstLine = stdout.split('\n').find(Boolean)
    if (!firstLine) throw new Error('yt-dlp tidak mengembalikan metadata.')
    return normalizeMeta(JSON.parse(firstLine))
}

export async function downloadAudioBuffer(url, bitrate = '192K') {
    const ytDlpPath = await resolveYtDlpPath()
    const ffmpegPath = await resolveFfmpegPath()
    const challengeArgs = await buildYoutubeChallengeArgs(url)

    return new Promise((resolve, reject) => {
        const args = [
            url,
            '-f', 'bestaudio/best',
            '--extract-audio',
            '--audio-format', 'mp3',
            '--audio-quality', bitrate,
            '--no-playlist',
            '--no-part',
            '--no-warnings',
            ...challengeArgs,
            '-o', '-'
        ]
        if (ffmpegPath && ffmpegPath !== 'ffmpeg') args.push('--ffmpeg-location', ffmpegPath)

        const proc = spawn(ytDlpPath, args)
        const chunks = []
        const stderrChunks = []

        proc.stdout.on('data', d => chunks.push(d))
        proc.stderr.on('data', d => stderrChunks.push(d))

        proc.on('error', reject)
        proc.on('close', code => {
            if (code !== 0 || chunks.length === 0) {
                const stderrText = Buffer.concat(stderrChunks).toString('utf-8').slice(-800)
                reject(new Error(`yt-dlp keluar dengan kode ${code}. ${stderrText}`))
                return
            }
            resolve(Buffer.concat(chunks))
        })
    })
}

export async function downloadVideoBuffer(url, maxHeight = 1080) {
    const ytDlpPath = await resolveYtDlpPath()
    const ffmpegPath = await resolveFfmpegPath()
    const challengeArgs = await buildYoutubeChallengeArgs(url)

    const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ytdlp-'))
    const outputTemplate = path.join(tmpDir, 'video.%(ext)s')

    try {
        await new Promise((resolve, reject) => {
            const args = [
                url,
                '-f',
                `bestvideo[height<=${maxHeight}][vcodec^=avc1]+bestaudio[acodec^=mp4a]/` +
                `best[height<=${maxHeight}][vcodec^=avc1][acodec^=mp4a]/` +
                `best[height<=${maxHeight}][ext=mp4]/best[height<=${maxHeight}]`,
                '--merge-output-format', 'mp4',
                '--remux-video', 'mp4',
                '--no-playlist',
                '--no-part',
                '--no-warnings',
                ...challengeArgs,
                '-o', outputTemplate
            ]
            if (ffmpegPath && ffmpegPath !== 'ffmpeg') args.push('--ffmpeg-location', ffmpegPath)

            const proc = spawn(ytDlpPath, args)
            const stderrChunks = []

            proc.stderr.on('data', d => stderrChunks.push(d))
            proc.on('error', reject)
            proc.on('close', code => {
                if (code !== 0) {
                    const stderrText = Buffer.concat(stderrChunks).toString('utf-8').slice(-800)
                    reject(new Error(`yt-dlp keluar dengan kode ${code}. ${stderrText}`))
                    return
                }
                resolve()
            })
        })

        const files = await fs.promises.readdir(tmpDir)
        const outputFile = files.find(f => f.startsWith('video.'))
        if (!outputFile) throw new Error('yt-dlp selesai tanpa error tapi file output tidak ditemukan.')

        const fullPath = path.join(tmpDir, outputFile)
        const stat = await fs.promises.stat(fullPath)
        if (stat.size === 0) throw new Error('File video hasil download berukuran 0 byte.')

        if (!ffmpegPath) return await fs.promises.readFile(fullPath)

        const faststartPath = path.join(tmpDir, 'video_faststart.mp4')
        try {
            await execFileAsync(ffmpegPath, [
                '-i', fullPath,
                '-c', 'copy',
                '-movflags', '+faststart',
                faststartPath
            ])
            return await fs.promises.readFile(faststartPath)
        } catch {
            return await fs.promises.readFile(fullPath)
        }
    } finally {
        await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {})
    }
}

async function selfUpdateYtDlpOnce() {
    try {
        const ytDlpPath = await resolveYtDlpPath()
        await execFileAsync(ytDlpPath, ['-U'], { timeout: 30_000 })
    } catch {}
}

async function cleanupStaleTempDirs() {
    try {
        const tmpRoot = os.tmpdir()
        const entries = await fs.promises.readdir(tmpRoot, { withFileTypes: true }).catch(() => [])
        const staleDirs = entries.filter(e => e.isDirectory() && e.name.startsWith('ytdlp-'))
        for (const dir of staleDirs) {
            await fs.promises.rm(path.join(tmpRoot, dir.name), { recursive: true, force: true }).catch(() => {})
        }
    } catch {}
}

cleanupStaleTempDirs()
selfUpdateYtDlpOnce()

export function formatCount(n) {
    if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) {
        return typeof n === 'string' && n.trim() ? n.trim() : 'Tidak tersedia'
    }
    const num = Number(n)
    if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}rb`
    return String(num)
}

export function formatDuration(seconds) {
    const total = Math.max(0, Number(seconds || 0))
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = Math.floor(total % 60)
    const pad = x => String(x).padStart(2, '0')
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}

export function truncate(str, max = 250) {
    if (!str) return '-'
    const clean = String(str).replace(/\s+/g, ' ').trim()
    if (!clean) return '-'
    return clean.length > max ? `${clean.slice(0, max).trim()}...` : clean
}
