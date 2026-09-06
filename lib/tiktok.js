/*
 * Copyright (c) 2026 Justine Louise.
 * Created by Justine Louise.
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
 * lib/tiktok.js
 */

import https from 'https';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
let cachedFfmpegPath;
let cachedFfprobePath;

export function isTiktokUrl(str) {
  return /^(https?:\/\/)?(www\.|vt\.|vm\.|m\.)?tiktok\.com\/.+/i.test(String(str || '').trim());
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
    return null;
  }
}

async function resolveFfprobePath() {
  if (cachedFfprobePath) return cachedFfprobePath;

  if (process.env.FFPROBE_PATH && fs.existsSync(process.env.FFPROBE_PATH)) {
    cachedFfprobePath = process.env.FFPROBE_PATH;
    return cachedFfprobePath;
  }

  try {
    const mod = await import('ffprobe-static');
    const staticPath = mod.default?.path || mod.path;
    if (staticPath && fs.existsSync(staticPath)) {
      cachedFfprobePath = staticPath;
      return cachedFfprobePath;
    }
  } catch {

  }

  try {
    await execFileAsync('ffprobe', ['-version']);
    cachedFfprobePath = 'ffprobe';
    return cachedFfprobePath;
  } catch {
    return null;
  }
}

async function probeVideoHeight(buffer) {
  const ffprobePath = await resolveFfprobePath();
  if (!ffprobePath) return null;

  const tmpFile = path.join(os.tmpdir(), `ttmp4-probe-${Date.now()}-${Math.random().toString(36).slice(2)}.mp4`);
  await fs.promises.writeFile(tmpFile, buffer);

  try {
    const { stdout } = await execFileAsync(ffprobePath, [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=height',
      '-of', 'csv=p=0',
      tmpFile,
    ]);
    const height = parseInt(String(stdout).trim(), 10);
    return Number.isFinite(height) ? height : null;
  } catch {
    return null;
  } finally {
    await fs.promises.unlink(tmpFile).catch(() => {});
  }
}

export async function capVideoResolution(buffer, maxHeight = 1080) {
  const height = await probeVideoHeight(buffer);
  if (!height || height <= maxHeight) return buffer;

  const ffmpegPath = await resolveFfmpegPath();
  if (!ffmpegPath) return buffer;

  return new Promise((resolve, reject) => {
    const chunks = [];
    const stderrChunks = [];

    const ff = spawn(ffmpegPath, [
      '-i', 'pipe:0',

      '-vf', `scale=-2:min(ih\\,${maxHeight})`,
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '20',
      '-c:a', 'copy',
      '-movflags', 'faststart',
      '-f', 'mp4',
      'pipe:1',
    ]);

    ff.stdout.on('data', (d) => chunks.push(d));
    ff.stderr.on('data', (d) => stderrChunks.push(d));

    ff.on('error', reject);
    ff.on('close', (code) => {
      if (code !== 0 || chunks.length === 0) {
        const stderrText = Buffer.concat(stderrChunks).toString('utf-8').slice(-500);
        console.error(`[TTMP4] Gagal downscale video ke ${maxHeight}p (kode ${code}), kirim buffer asli. ${stderrText}`);
        resolve(buffer);
        return;
      }
      resolve(Buffer.concat(chunks));
    });

    ff.stdin.on('error', () => {});
    ff.stdin.end(buffer);
  });
}

function postForm(targetUrl, formData) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(formData).toString();
    const u = new URL(targetUrl);

    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString('utf-8')));
          } catch (e) {
            reject(new Error('Gagal parse respons API TikTok (bukan JSON valid).'));
          }
        });
        res.on('error', reject);
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function getTiktokData(url) {
  const res = await postForm('https://www.tikwm.com/api/', { url, hd: 1 });

  if (!res || res.code !== 0 || !res.data) {
    throw new Error(res?.msg || 'Gagal mengambil data dari TikTok (link mungkin private/dihapus/salah).');
  }

  const d = res.data;

  return {
    title: (d.title || '-').trim(),
    author: d.author?.nickname || d.author?.unique_id || 'Tidak diketahui',
    authorUsername: d.author?.unique_id ? `@${d.author.unique_id}` : '',
    likes: d.digg_count ?? null,
    comments: d.comment_count ?? null,
    shares: d.share_count ?? null,
    views: d.play_count ?? null,
    durationSeconds: Number(d.duration || 0),
    cover: d.cover || d.origin_cover || d.ai_dynamic_cover || '',

    videoUrl: d.hdplay || d.play || '',

    audioUrl: d.music || '',
  };
}

export function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } },
        (res) => {

          if (res.statusCode && [301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
            res.resume();
            fetchBuffer(res.headers.location).then(resolve).catch(reject);
            return;
          }
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode} saat mengunduh file TikTok`));
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
