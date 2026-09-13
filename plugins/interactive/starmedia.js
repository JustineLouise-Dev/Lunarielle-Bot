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
// plugins/bot/starmedia.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { sendRichHtml } from '../../lib/richmessage.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', '..', 'config.json'))
)

const WORKER_URL = config.starmedia?.workerUrl || 'https://api.justinelouise.workers.dev'

const CLIENT_API_KEY = config.starmedia?.clientApiKey || ''

function httpBase() {
    return WORKER_URL.replace(/\/$/, '')
}

function wsBase() {
    return httpBase().replace(/^http/, 'ws')
}

async function createMediaRoom() {
    const res = await fetch(`${httpBase()}/api/media/room`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': CLIENT_API_KEY
        },
        body: JSON.stringify({})
    })

    let body = {}
    try {
        body = await res.json()
    } catch {}

    if (!res.ok || !body.code) {
        const reason = body?.error || `http_${res.status}`
        throw new Error(reason)
    }

    return body.code
}

function errorMessage(reason) {
    const map = {
        unauthorized: '🔑 API key bot tidak valid / belum diatur. Hubungi owner untuk mengatur `starmedia.clientApiKey` di config.json.',
        invalid_api_key: '🔑 API key bot tidak dikenal oleh server.',
        revoked_api_key: '🔑 API key bot sudah dicabut.',
        limit_exceeded: '📛 Batas pemakaian API key harian sudah tercapai.',
        no_worker_available: '🎧 Server pengunduh (Termux/yt-dlp) sedang offline. Coba lagi beberapa saat lagi.',
        missing_api_key: '🔑 API key bot belum diatur.'
    }
    return map[reason] || `⚠️ Gagal membuat sesi pemutar: ${reason}`
}

export default async function starmedia(m, { conn, text }) {
    const targetChat = m.chat
    const query = (text || '').trim()

    if (!query) {
        await m.reply(
            '🎵 *StarMedia*\n\n' +
            'Cari & putar audio dari YouTube langsung di chat.\n\n' +
            `Contoh: *${config.prefix}starmedia Anggun - Mimpi*`
        )
        return
    }

    if (!CLIENT_API_KEY) {
        await m.reply(errorMessage('unauthorized'))
        return
    }

    let code
    try {
        code = await createMediaRoom()
    } catch (err) {
        await m.reply(errorMessage(err.message))
        return
    }

    const wsUrl =
        `${wsBase()}/ws/media/${encodeURIComponent(code)}` +
        `?role=client&key=${encodeURIComponent(CLIENT_API_KEY)}` +
        `&query=${encodeURIComponent(query)}`

    const safeQuery = query
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    const html = `<style>
*{box-sizing:border-box;margin:0;padding:0;font-family:Arial,"Helvetica Neue",sans-serif;-webkit-tap-highlight-color:transparent;user-select:none}
html,body{width:100%;background:transparent;overflow:hidden}
body{padding:8px}
.spotify-card{width:100%;max-width:430px;margin:0 auto;padding:25px 28px 34px;border-radius:24px;overflow:hidden;position:relative;color:#fff;background:linear-gradient(180deg,#746d70 0%,#5b5557 16%,#3b3638 35%,#211e20 57%,#100e0f 78%,#070607 100%);box-shadow:0 18px 45px rgba(0,0,0,.72)}
.top-row{width:100%;height:48px;position:relative;display:flex;align-items:flex-start;justify-content:space-between}
.back,.menu{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:#fff}
.back{font-size:31px;line-height:1;font-weight:300;margin-top:-3px}
.center{position:absolute;left:50%;top:1px;transform:translateX(-50%);text-align:center;color:rgba(255,255,255,.72);font-size:12px;font-weight:600;letter-spacing:2px;white-space:nowrap}
.menu{font-size:21px;letter-spacing:4px;margin-top:-3px}
.header-title{width:100%;text-align:center;color:#fff;font-size:20px;line-height:26px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:-2px 0 22px}
.cover-wrap{width:100%;aspect-ratio:1/1;max-width:350px;margin:0 auto 28px;border-radius:22px;overflow:hidden;background:#242224;box-shadow:0 14px 30px rgba(0,0,0,.48),0 3px 8px rgba(0,0,0,.25);position:relative;display:flex;align-items:center;justify-content:center}
.cover-wrap .bgFill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:blur(22px) brightness(.55) saturate(1.3);transform:scale(1.15);display:none}
.cover-wrap img.fg{position:relative;width:100%;height:100%;object-fit:contain;display:block;z-index:1}
.cover-wrap .spinner{position:relative;z-index:1;width:46px;height:46px;border-radius:50%;border:4px solid rgba(255,255,255,.25);border-top-color:#1ed760;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.song-info{display:flex;align-items:center;width:100%;margin-bottom:20px}
.song-info .left{flex:1;min-width:0;text-align:left;padding-right:14px}
.song-info .title{color:#fff;font-size:24px;line-height:29px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.song-info .artist{color:rgba(255,255,255,.72);font-size:16px;line-height:22px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.like-btn{width:42px;height:42px;display:flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:0}
.like-btn svg{width:31px;height:31px;fill:none;stroke:#eee;stroke-width:1.8;transition:.2s}
.like-btn.liked svg{fill:#1ed760;stroke:#1ed760}
.progress-wrap{width:100%;display:flex;flex-direction:column;gap:8px;margin-bottom:25px}
.progress-track{width:100%;height:5px;position:relative;background:rgba(255,255,255,.30);border-radius:10px;cursor:pointer;touch-action:none}
.progress-track .bar{height:100%;width:0%;background:#fff;border-radius:10px}
.progress-track .dot{position:absolute;top:50%;left:0;width:15px;height:15px;background:#fff;border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 1px 5px rgba(0,0,0,.35)}
.time-row{display:flex;justify-content:space-between;width:100%}
.time{color:rgba(255,255,255,.72);font-size:12px;line-height:15px;font-variant-numeric:tabular-nums}
.controls{width:100%;display:flex;align-items:center;justify-content:space-between;padding:0 1px}
.controls button{width:46px;height:46px;display:flex;align-items:center;justify-content:center;background:none;border:none;border-radius:50%;cursor:pointer;padding:0;transition:transform .1s}
.controls button:active{transform:scale(.86)}
.ctrl-btn svg{width:25px;height:25px;fill:#fff;transition:.2s}
.ctrl-btn.active svg{fill:#1ed760}
.play-btn{width:76px!important;height:76px!important;background:#fff!important;border-radius:50%!important;opacity:.4;pointer-events:none;transition:opacity .2s}
.play-btn.ready{opacity:1;pointer-events:auto}
.play-btn svg{width:34px;height:34px;fill:#080808}
.status-row{width:100%;text-align:center;color:rgba(255,255,255,.62);font-size:12px;line-height:16px;margin:-6px 0 16px;min-height:16px}
.status-row.err{color:#ff6b6b}
@media(max-width:360px){
.spotify-card{padding:22px 20px 28px;border-radius:21px}
.top-row{height:45px}.center{font-size:10px;letter-spacing:1.5px}
.header-title{font-size:18px;margin-bottom:18px}
.cover-wrap{max-width:285px;border-radius:18px;margin-bottom:22px}
.song-info .title{font-size:20px;line-height:25px}.song-info .artist{font-size:14px}
.play-btn{width:64px!important;height:64px!important}.play-btn svg{width:29px;height:29px}
.controls button{width:40px;height:40px}
}
</style>

<div class="spotify-card">
<div class="top-row">
<div class="back">⌄</div>
<div class="center">MENCARI DI YOUTUBE</div>
<div class="menu">•••</div>
</div>

<div class="header-title" id="headerTitle">${safeQuery}</div>

<div class="cover-wrap" id="coverWrap">
<img src="" alt="" id="coverBg" class="bgFill">
<div class="spinner" id="coverSpinner"></div>
<img src="" alt="cover" id="coverImg" class="fg" style="display:none">
</div>

<div class="song-info">
<div class="left">
<div class="title" id="songTitle">Menyiapkan...</div>
<div class="artist" id="artistName">Menghubungkan ke server</div>
</div>
<button class="like-btn" id="likeBtn" aria-label="Like">
<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
</button>
</div>

<div class="progress-wrap">
<div class="progress-track" id="progressTrack">
<div class="bar" id="progressBar"></div>
<div class="dot" id="progressDot"></div>
</div>
<div class="time-row">
<span class="time" id="currentTime">0:00</span>
<span class="time" id="totalTime">0:00</span>
</div>
</div>

<div class="status-row" id="statusRow">Menghubungkan...</div>

<div class="controls">
<button class="ctrl-btn" id="shuffleBtn" aria-label="Shuffle"><svg viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg></button>
<button class="ctrl-btn" id="prevBtn" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg></button>
<button class="play-btn" id="playBtn" aria-label="Play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></button>
<button class="ctrl-btn" id="nextBtn" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg></button>
<button class="ctrl-btn" id="loopBtn" aria-label="Loop"><svg viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg></button>
</div>
</div>

<audio id="audioPlayer" preload="auto"></audio>

<script>
(function(){
"use strict";

/* ============================================================
   Room job ini dibuat SEKALI oleh bot Node (lihat starmedia.js)
   lewat POST /api/media/room, lalu kode room + kredensialnya
   dititipkan ke sini. WebSocket sesungguhnya baru dibuka SEKARANG,
   saat pesan dibuka pengguna — bukan lib baru, cukup WebSocket
   bawaan browser, persis seperti plugins/interactive/tictactoe.js.
   ============================================================ */
const WS_URL = ${JSON.stringify(wsUrl)};

const audio=document.getElementById('audioPlayer');
const playBtn=document.getElementById('playBtn');
const progressBar=document.getElementById('progressBar');
const progressDot=document.getElementById('progressDot');
const progressTrack=document.getElementById('progressTrack');
const currentTimeEl=document.getElementById('currentTime');
const totalTimeEl=document.getElementById('totalTime');
const likeBtn=document.getElementById('likeBtn');
const shuffleBtn=document.getElementById('shuffleBtn');
const loopBtn=document.getElementById('loopBtn');
const songTitle=document.getElementById('songTitle');
const artistName=document.getElementById('artistName');
const headerTitle=document.getElementById('headerTitle');
const coverImg=document.getElementById('coverImg');
const coverBg=document.getElementById('coverBg');
const coverSpinner=document.getElementById('coverSpinner');
const statusRow=document.getElementById('statusRow');
let isDragging=false,isLiked=false,isShuffled=false,isLooped=false;
// Durasi asli dari metadata yt-dlp (dikirim server lewat track_info.duration,
// dalam detik). MediaSource yang masih streaming sering melaporkan
// audio.duration = Infinity/NaN sampai endOfStream() dipanggil, jadi progress
// bar & label total waktu dihitung dari nilai ini, bukan dari audio.duration.
let knownDuration=0;

/* ---------------- Streaming audio lewat MediaSource ----------------
   Chunk biner MP3/WEBM dari worker Termux datang berurutan lewat
   WebSocket (binaryType arraybuffer) dan langsung di-append ke
   SourceBuffer supaya audio bisa mulai diputar sebelum unduhan
   selesai sepenuhnya (progressive streaming), tanpa membuat file
   sementara apa pun di sisi client. */
let mediaSource=null, sourceBuffer=null, mimeCandidate='audio/mpeg';
let chunkQueue=[], streamEnded=false, sourceOpen=false;

function pickMime(hintMime){
  const candidates=[hintMime,'audio/mpeg','audio/webm;codecs=opus','audio/mp4'].filter(Boolean);
  for(const c of candidates){
    if(window.MediaSource && MediaSource.isTypeSupported(c)) return c;
  }
  return null;
}

function initMediaSource(hintMime){
  mimeCandidate=pickMime(hintMime) || mimeCandidate;
  if(!window.MediaSource || !mimeCandidate){
    setStatus('Browser tidak mendukung streaming audio ini.', true);
    return false;
  }
  mediaSource=new MediaSource();
  audio.src=URL.createObjectURL(mediaSource);
  mediaSource.addEventListener('sourceopen',()=>{
    sourceOpen=true;
    try{
      sourceBuffer=mediaSource.addSourceBuffer(mimeCandidate);
      sourceBuffer.addEventListener('updateend',pumpQueue);
      pumpQueue();
    }catch(e){
      setStatus('Gagal menyiapkan buffer audio.', true);
    }
  },{once:true});
  return true;
}

function pumpQueue(){
  if(!sourceBuffer||sourceBuffer.updating||!chunkQueue.length) {
    if(streamEnded && chunkQueue.length===0 && mediaSource && mediaSource.readyState==='open' && sourceBuffer && !sourceBuffer.updating){
      try{ mediaSource.endOfStream(); }catch{}
    }
    return;
  }
  const chunk=chunkQueue.shift();
  try{ sourceBuffer.appendBuffer(chunk); }catch(e){ /* akan dicoba lagi via updateend berikutnya */ }
}

function pushChunk(arrayBuffer){
  chunkQueue.push(new Uint8Array(arrayBuffer));
  if(sourceOpen) pumpQueue();
}

function finishStream(){
  streamEnded=true;
  pumpQueue();
}

/* ---------------- WebSocket ke API (relay ke worker Termux) ---------------- */
let ws=null, reconnectAttempts=0, reconnectTimer=null, requestedOnce=false;

function setStatus(text, isErr){
  statusRow.textContent=text||'';
  statusRow.classList.toggle('err',!!isErr);
}

function connect(){
  try{
    ws=new WebSocket(WS_URL);
  }catch(e){
    setStatus('Gagal membuka koneksi.', true);
    return;
  }
  ws.binaryType='arraybuffer';

  ws.addEventListener('open',()=>{
    reconnectAttempts=0;
    setStatus('Terhubung, mencari lagu...');
    if(!requestedOnce){
      requestedOnce=true;
      // query sudah dititipkan lewat query string WS_URL saat room dibuat,
      // tapi dikirim ulang di sini juga supaya worker yang connect belakangan
      // (race) tetap menerima job-nya (lihat pendingQuery di media.js).
    }
  });

  ws.addEventListener('message',(evt)=>{
    if(evt.data instanceof ArrayBuffer){
      pushChunk(evt.data);
      return;
    }
    let msg;
    try{ msg=JSON.parse(evt.data); }catch{ return; }
    handleMessage(msg);
  });

  ws.addEventListener('close',()=>{
    scheduleReconnect();
  });

  ws.addEventListener('error',()=>{
    setStatus('Koneksi bermasalah...', true);
  });
}

function scheduleReconnect(){
  if(streamEnded) return; // sudah selesai wajar, tidak perlu reconnect
  if(reconnectAttempts>=5){
    setStatus('Gagal tersambung ke server. Coba kirim ulang perintah.', true);
    return;
  }
  reconnectAttempts++;
  clearTimeout(reconnectTimer);
  reconnectTimer=setTimeout(connect, Math.min(1000*reconnectAttempts,4000));
}

function handleMessage(msg){
  switch(msg.type){
    case 'welcome':
      setStatus('Menunggu server pengunduh...');
      break;
    case 'progress':
      if(msg.message) setStatus(msg.message);
      break;
    case 'track_info':
      headerTitle.textContent=msg.title||headerTitle.textContent;
      songTitle.textContent=msg.title||'Tanpa judul';
      artistName.textContent=msg.artist||msg.uploader||'Tidak diketahui';
      if(Number.isFinite(msg.duration)&&msg.duration>0){
        knownDuration=msg.duration;
      }
      // durationText dikirim langsung dari worker Termux (string siap-tampil
      // "M:SS"/"H:MM:SS") supaya tidak perlu dihitung ulang di client. Kalau
      // tidak ada, fallback ke format dari angka detik (knownDuration).
      totalTimeEl.textContent=msg.durationText||formatTime(knownDuration)||'0:00';
      if(msg.thumbnailBase64){
        const thumbSrc='data:'+(msg.thumbnailMime||'image/jpeg')+';base64,'+msg.thumbnailBase64;
        coverImg.src=thumbSrc;
        coverBg.src=thumbSrc;
        coverImg.style.display='block';
        coverBg.style.display='block';
        coverSpinner.style.display='none';
      } else if(msg.thumbnailUrl){
        coverImg.src=msg.thumbnailUrl;
        coverBg.src=msg.thumbnailUrl;
        coverImg.style.display='block';
        coverBg.style.display='block';
        coverSpinner.style.display='none';
      }
      setStatus('Menyetel audio...');
      if(initMediaSource(msg.mime)){
        playBtn.classList.add('ready');
      }
      break;
    case 'track_end':
      finishStream();
      setStatus('');
      break;
    case 'track_error':
      setStatus('⚠️ '+(msg.message||'Gagal memuat lagu.'), true);
      coverSpinner.style.display='none';
      break;
    case 'cancel':
      setStatus('Dibatalkan.', true);
      break;
    default:
      break;
  }
}

connect();

/* ---------------- UI player (sama seperti sebelumnya) ---------------- */
function formatTime(sec){
 if(!isFinite(sec)||sec<0)return '0:00';
 const m=Math.floor(sec/60),s=Math.floor(sec%60);
 return m+':'+(s<10?'0':'')+s;
}
function setProgress(pct){
 pct=Math.max(0,Math.min(100,pct));
 progressBar.style.width=pct+'%';
 progressDot.style.left=pct+'%';
}
function updateProgress(){
 if(isDragging) return;
 const duration=isFinite(audio.duration)&&audio.duration>0?audio.duration:knownDuration;
 if(duration>0){
  const pct=audio.currentTime/duration*100;
  setProgress(pct);
  currentTimeEl.textContent=formatTime(audio.currentTime);
 }
}
function setPlayingState(playing){
 playBtn.innerHTML=playing
 ?'<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
 :'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
}
playBtn.addEventListener('click',()=>{
  if(!playBtn.classList.contains('ready')) return;
  audio.paused?audio.play().catch(()=>{}):audio.pause();
});
audio.addEventListener('play',()=>setPlayingState(true));
audio.addEventListener('pause',()=>setPlayingState(false));
audio.addEventListener('timeupdate',updateProgress);
audio.addEventListener('durationchange',()=>{
  if(isFinite(audio.duration)&&audio.duration>0) totalTimeEl.textContent=formatTime(audio.duration);
});
audio.addEventListener('ended',()=>{
 if(isLooped){audio.currentTime=0;audio.play().catch(()=>{});}
 else{setProgress(0);currentTimeEl.textContent='0:00';setPlayingState(false);}
});

function seek(e){
 const duration=isFinite(audio.duration)&&audio.duration>0?audio.duration:knownDuration;
 if(!(duration>0)) return;
 const rect=progressTrack.getBoundingClientRect();
 const x=Math.max(0,Math.min(e.clientX-rect.left,rect.width));
 const pct=x/rect.width;
 const target=pct*duration;
 // Selama masih streaming (belum endOfStream), hanya boleh loncat ke
 // rentang yang sudah ter-buffer -- melompat ke bagian yang belum
 // diunduh akan membuat <audio> stall tanpa pesan error yang jelas.
 let seekable=true;
 if(!streamEnded && audio.buffered && audio.buffered.length){
  const bufferedEnd=audio.buffered.end(audio.buffered.length-1);
  if(target>bufferedEnd+0.5) seekable=false;
 }
 if(!seekable){
  setStatus('Bagian ini belum selesai diunduh...');
  return;
 }
 audio.currentTime=target;
 setProgress(pct*100);
 currentTimeEl.textContent=formatTime(audio.currentTime);
}
progressTrack.addEventListener('pointerdown',e=>{
 isDragging=true;
 progressTrack.setPointerCapture?.(e.pointerId);
 seek(e);
});
progressTrack.addEventListener('pointermove',e=>{if(isDragging)seek(e)});
progressTrack.addEventListener('pointerup',()=>{isDragging=false});
progressTrack.addEventListener('pointercancel',()=>{isDragging=false});

likeBtn.addEventListener('click',()=>{isLiked=!isLiked;likeBtn.classList.toggle('liked',isLiked)});
shuffleBtn.addEventListener('click',()=>{isShuffled=!isShuffled;shuffleBtn.classList.toggle('active',isShuffled)});
loopBtn.addEventListener('click',()=>{isLooped=!isLooped;loopBtn.classList.toggle('active',isLooped)});
document.getElementById('prevBtn').addEventListener('click',()=>{audio.currentTime=0});
document.getElementById('nextBtn').addEventListener('click',()=>{audio.currentTime=0});
setPlayingState(false);
})();
</script>`

    await sendRichHtml(
        conn,
        targetChat,
        html,
        {
            title: '🎵 StarMedia Player',
            trustedSources: [new URL(WORKER_URL).hostname]
        }
    )
}

starmedia.command = 'starmedia'
starmedia.alias = ['media', 'star', 'spotify']
starmedia.category = 'interactive'
starmedia.description = '🎵 Cari & putar audio dari YouTube langsung di chat (streaming via yt-dlp Termux)'
