/*
 * Copyright (c) 2026 Justine Louise & MioDev.
 * Created by Justine Louise & MioDev.
 *
 * This software is provided for personal and educational use only.
 * Commercial use, resale, or distribution for profit is strictly prohibited
 * without prior written permission from the author.
 *
 * Please respect the developer's work.
 * Do not remove or modify this copyright notice or claim this project as your own.
 *
 * © 2026 Justine Louise. All Rights Reserved.
 * ® Powered By Zapo-js
 * lib/youtube.js
 */

import fs from 'fs';
import https from 'https';
import path from 'path';
import os from 'os';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';
import ytdl from '@distube/ytdl-core';

const execFileAsync = promisify(execFile);
let cachedFfmpegPath;
let cachedYtDlpPath;

async function resolveYtDlpPath() {
  if (cachedYtDlpPath) return cachedYtDlpPath;

  if (process.env.YTDLP_PATH && fs.existsSync(process.env.YTDLP_PATH)) {
    cachedYtDlpPath = process.env.YTDLP_PATH;
    return cachedYtDlpPath;
  }

  try {
    await execFileAsync('yt-dlp', ['--version']);
    cachedYtDlpPath = 'yt-dlp';
    return cachedYtDlpPath;
  } catch {
    throw new Error(
      'yt-dlp tidak ditemukan. Install yt-dlp di sistem, misalnya:\n' +
        '  Termux : pkg install yt-dlp   (atau: pip install -U yt-dlp)\n' +
        '  Debian/Ubuntu : sudo apt install yt-dlp   (atau: pip install -U yt-dlp)\n' +
        '  macOS : brew install yt-dlp\n' +
        'atau set YTDLP_PATH ke lokasi binary yt-dlp.'
    );
  }
}

async function selfUpdateYtDlpOnce() {
  try {
    const ytDlpPath = await resolveYtDlpPath();
    const { stdout } = await execFileAsync(ytDlpPath, ['-U'], { timeout: 30_000 });
    const summary = stdout.split('\n').find((l) => l.trim()) || stdout.trim();
    if (summary && !/already up to date|is up to date/i.test(summary)) {
      console.log(`[YOUTUBE LIB] yt-dlp self-update: ${summary.trim()}`);
    }
  } catch (e) {
    console.log(
      '[YOUTUBE LIB] Gagal auto-update yt-dlp (dilewati, bot tetap lanjut jalan):',
      e.message || e
    );
  }
}

let cachedNodePath;

async function resolveNodePath() {
  if (cachedNodePath !== undefined) return cachedNodePath;

  if (process.env.NODE_PATH_BIN && fs.existsSync(process.env.NODE_PATH_BIN)) {
    cachedNodePath = process.env.NODE_PATH_BIN;
    return cachedNodePath;
  }

  try {
    const { stdout } = await execFileAsync(process.platform === 'win32' ? 'where' : 'which', ['node']);
    const resolved = stdout.split('\n')[0].trim();
    cachedNodePath = resolved || null;
    return cachedNodePath;
  } catch {
    cachedNodePath = null;
    return cachedNodePath;
  }
}

async function buildYoutubeChallengeArgs() {
  const nodePath = await resolveNodePath();
  const args = [];
  if (nodePath) {
    args.push('--js-runtimes', `node:${nodePath}`);
  }
  args.push('--extractor-args', 'youtube:player_client=tv,web,mweb,web_embedded');
  return args;
}

async function resolveFfmpegPath() {
  if (cachedFfmpegPath) return cachedFfmpegPath;

  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    cachedFfmpegPath = process.env.FFMPEG_PATH;
    return cachedFfmpegPath;
  }

  try {
    const mod = await import('ffmpeg-static');
    const staticPath = mod.default;
    if (staticPath && fs.existsSync(staticPath)) {
      cachedFfmpegPath = staticPath;
      return cachedFfmpegPath;
    }
  } catch {
    
  }

  try {
    await execFileAsync('ffmpeg', ['-version']);
    cachedFfmpegPath = 'ffmpeg';
    return cachedFfmpegPath;
  } catch {
    throw new Error(
      'ffmpeg tidak ditemukan. Install ffmpeg di sistem, misalnya:\n' +
        '  Termux : pkg install ffmpeg\n' +
        '  Debian/Ubuntu : sudo apt install ffmpeg\n' +
        '  macOS : brew install ffmpeg\n' +
        'atau set FFMPEG_PATH ke lokasi binary ffmpeg.'
    );
  }
}

export function isYoutubeUrl(str) {
  return /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com|youtu\.be)\/.+/i.test(String(str || '').trim());
}

async function cleanupStaleYtmp4TempDirs() {
  try {
    const tmpRoot = os.tmpdir();
    const entries = await fs.promises.readdir(tmpRoot, { withFileTypes: true }).catch(() => []);
    const staleDirs = entries.filter((e) => e.isDirectory() && e.name.startsWith('ytmp4-'));
    if (staleDirs.length === 0) return;

    let cleaned = 0;
    for (const dir of staleDirs) {
      const fullPath = path.join(tmpRoot, dir.name);
      const ok = await fs.promises
        .rm(fullPath, { recursive: true, force: true })
        .then(() => true)
        .catch(() => false);
      if (ok) cleaned++;
    }
    if (cleaned > 0) {
      console.log(
        `[YOUTUBE LIB] Membersihkan ${cleaned} folder temp sisa (kemungkinan dari sesi bot yang crash saat download video).`
      );
    }
  } catch {
  }
}

cleanupStaleYtmp4TempDirs();

selfUpdateYtDlpOnce();

function httpsGetText(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        },
        (res) => {
          if (
            res.statusCode &&
            [301, 302, 303, 307, 308].includes(res.statusCode) &&
            res.headers.location &&
            redirectsLeft > 0
          ) {
            res.resume();
            httpsGetText(res.headers.location, redirectsLeft - 1).then(resolve).catch(reject);
            return;
          }
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} saat mengambil halaman pencarian YouTube`));
            return;
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
          res.on('error', reject);
        }
      )
      .on('error', reject);
  });
}

function extractJsonAfterMarker(html, marker) {
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const start = html.indexOf('{', idx);
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < html.length; i++) {
    const ch = html[i];

    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return html.slice(start, i + 1);
    }
  }
  return null;
}

function extractTitleText(titleField) {
  if (!titleField) return '-';
  if (typeof titleField.simpleText === 'string') return titleField.simpleText;
  if (Array.isArray(titleField.runs)) return titleField.runs.map((r) => r.text || '').join('');
  return '-';
}

export async function searchYoutube(query) {
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const html = await httpsGetText(searchUrl);

  const jsonText =
    extractJsonAfterMarker(html, 'var ytInitialData = ') ||
    extractJsonAfterMarker(html, 'window["ytInitialData"] = ') ||
    extractJsonAfterMarker(html, 'ytInitialData = ');

  if (!jsonText) {
    throw new Error('Gagal membaca data pencarian YouTube (struktur halaman berubah).');
  }

  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error('Gagal parse data pencarian YouTube.');
  }

  const sections =
    data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || [];

  for (const section of sections) {
    const items = section?.itemSectionRenderer?.contents || [];
    for (const item of items) {
      const vr = item?.videoRenderer;
      if (vr?.videoId) {
        return {
          url: `https://www.youtube.com/watch?v=${vr.videoId}`,
          title: extractTitleText(vr.title),
        };
      }
    }
  }

  return null;
}

export async function getYoutubeMeta(url, info) {
  const data = info || (await ytdl.getBasicInfo(url));
  const d = data.videoDetails || {};

  const likes = d.likes ?? d.videoDetails?.likes ?? null;
  const subscriberCount =
    d.author?.subscriber_count ?? d.author?.subscriberCount ?? d.author?.subscribers ?? null;

  const thumbnails = d.thumbnails || [];
  const thumbnail =
    thumbnails.length > 0
      ? thumbnails[thumbnails.length - 1].url
      : `https://i.ytimg.com/vi/${d.videoId}/hqdefault.jpg`;

  return {
    videoId: d.videoId,
    url: d.video_url || url,
    title: d.title || '-',
    channel: d.author?.name || d.ownerChannelName || 'Tidak diketahui',
    subscriberCount,
    likes,
    views: d.viewCount ? Number(d.viewCount) : null,
    description: (d.description || d.shortDescription || '').trim(),
    thumbnail,
    durationSeconds: Number(d.lengthSeconds || 0),
  };
}

export async function downloadAudioBuffer(url, bitrate = '192K') {
  const ytDlpPath = await resolveYtDlpPath();
  const ffmpegPath = await resolveFfmpegPath().catch(() => null);
  const challengeArgs = await buildYoutubeChallengeArgs();

  return new Promise((resolve, reject) => {
    const args = [
      url,
      '-f', 'bestaudio/best',
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', bitrate,
      '--no-playlist',
      '--no-part',
      ...challengeArgs,
      '-o', '-',
    ];
    if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
      args.push('--ffmpeg-location', ffmpegPath);
    }

    const proc = spawn(ytDlpPath, args);
    const chunks = [];
    const stderrChunks = [];

    proc.stdout.on('data', (d) => chunks.push(d));
    proc.stderr.on('data', (d) => stderrChunks.push(d));

    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code !== 0 || chunks.length === 0) {
        const stderrText = Buffer.concat(stderrChunks).toString('utf-8').slice(-800);
        reject(new Error(`yt-dlp keluar dengan kode ${code}. ${stderrText}`));
        return;
      }
      resolve(Buffer.concat(chunks));
    });
  });
}

export async function downloadVideoBuffer(url, maxHeight = 720) {
  const ytDlpPath = await resolveYtDlpPath();
  const ffmpegPath = await resolveFfmpegPath().catch(() => null);
  const challengeArgs = await buildYoutubeChallengeArgs();

  const tmpDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'ytmp4-'));
  const outputTemplate = path.join(tmpDir, 'video.%(ext)s');

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
        ...challengeArgs,
        '-o', outputTemplate,
      ];
      if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
        args.push('--ffmpeg-location', ffmpegPath);
      }

      const proc = spawn(ytDlpPath, args);
      const stderrChunks = [];

      proc.stderr.on('data', (d) => stderrChunks.push(d));
      proc.on('error', reject);
      proc.on('close', (code) => {
        if (code !== 0) {
          const stderrText = Buffer.concat(stderrChunks).toString('utf-8').slice(-800);
          reject(new Error(`yt-dlp keluar dengan kode ${code}. ${stderrText}`));
          return;
        }
        resolve();
      });
    });

    const files = await fs.promises.readdir(tmpDir);
    const outputFile = files.find((f) => f.startsWith('video.'));
    if (!outputFile) {
      throw new Error('yt-dlp selesai tanpa error tapi file output tidak ditemukan.');
    }

    const fullPath = path.join(tmpDir, outputFile);
    const stat = await fs.promises.stat(fullPath);
    if (stat.size === 0) {
      throw new Error('File video hasil download berukuran 0 byte (kemungkinan format expired/403).');
    }

    const faststartPath = path.join(tmpDir, 'video_faststart.mp4');
    try {
      await execFileAsync(ffmpegPath || 'ffmpeg', [
        '-i', fullPath,
        '-c', 'copy',
        '-movflags', '+faststart',
        faststartPath,
      ]);
      return await fs.promises.readFile(faststartPath);
    } catch (e) {
      
      console.error('[YOUTUBE LIB] Gagal remux faststart, kirim file asli:', e.message || e);
      return await fs.promises.readFile(fullPath);
    }
  } finally {
    await fs.promises.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

export function fetchThumbnailBuffer(url, redirectsLeft = 5) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
            'Referer': 'https://www.youtube.com/',
          },
        },
        (res) => {
          if (
            res.statusCode &&
            [301, 302, 303, 307, 308].includes(res.statusCode) &&
            res.headers.location &&
            redirectsLeft > 0
          ) {
            res.resume();
            fetchThumbnailBuffer(res.headers.location, redirectsLeft - 1).then(resolve).catch(reject);
            return;
          }
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} saat ambil thumbnail`));
            return;
          }
          const chunks = [];
          res.on('data', (c) => chunks.push(c));
          res.on('end', () => resolve(Buffer.concat(chunks)));
          res.on('error', reject);
        }
      )
      .on('error', reject);
  });
}

export function formatCount(n) {
  if (n === null || n === undefined || n === '' || Number.isNaN(Number(n))) {
    return typeof n === 'string' && n.trim() ? n.trim() : 'Tidak tersedia';
  }
  const num = Number(n);
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}jt`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}rb`;
  return String(num);
}

export function formatDuration(seconds) {
  const total = Math.max(0, Number(seconds || 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.floor(total % 60);
  const pad = (x) => String(x).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function truncate(str, max = 250) {
  if (!str) return '-';
  const clean = String(str).replace(/\s+/g, ' ').trim();
  if (!clean) return '-';
  return clean.length > max ? `${clean.slice(0, max).trim()}...` : clean;
}
