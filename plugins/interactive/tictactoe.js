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
// plugins/interactive/tictactoe.js

import { sendRichHtml } from '../../lib/richmessage.js'

export default async function tictactoe(m, { conn, args, text, command }) {
        const targetChat = m.chat;

        const html = `<style>
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700;800&display=swap');

  :root{
    --ink:#0F1220;
    --ink-2:#171B2E;
    --surface:#1D2238;
    --surface-2:#262C48;
    --line: rgba(232,230,240,0.10);
    --text:#E8E6F0;
    --text-dim:#9C9AB5;
    --gold:#F4C542;
    --gold-dim:#8A7530;
    --blue:#5B8AF0;
    --red:#F0554C;
    --green:#4FBE8C;
    --radius-lg: 22px;
    --radius-md: 14px;
    --radius-sm: 9px;
    --vh: 1vh;
  }

  *{ box-sizing:border-box; }
  html,body{ height:100%; }
  body{
    margin:0;
    font-family:'Manrope', sans-serif;
    background:
      radial-gradient(1100px 600px at 15% -10%, rgba(244,197,66,0.10), transparent 60%),
      radial-gradient(900px 700px at 110% 10%, rgba(91,138,240,0.12), transparent 55%),
      var(--ink);
    color:var(--text);
    min-height:100%;
    overflow-x:hidden;
    -webkit-text-size-adjust:100%;
    text-size-adjust:100%;
  }

  .app{
    max-width:920px;
    margin:0 auto;
    min-height:100vh;
    min-height:calc(var(--vh, 1vh) * 100);
    display:flex;
    flex-direction:column;
    padding:24px 16px 32px;
  }
  @media (min-width:480px){
    .app{ padding:28px 20px 40px; }
  }

  /* ---------- Floating marks backdrop (lightweight) ---------- */
  .letter-field{
    position:fixed;
    inset:0;
    overflow:hidden;
    pointer-events:none;
    z-index:0;
    contain:strict;
    will-change:transform;
    transform:translateZ(0);
  }
  .letter-field span{
    position:absolute;
    font-family:'Fraunces', serif;
    font-weight:700;
    color:rgba(244,197,66,0.045);
    font-size:110px;
    animation:drift linear infinite;
    animation-fill-mode:both;
    user-select:none;
    will-change:transform;
    transform:translate3d(0,0,0);
  }
  @keyframes drift{
    from{ transform:translate3d(0,0,0) rotate(0deg); }
    to{ transform:translate3d(0,-40px,0) rotate(3deg); }
  }
  @media (max-width:520px){
    .letter-field{ display:none; }
  }

  .stage{ position:relative; z-index:1; flex:1; display:flex; flex-direction:column; min-width:0; }

  /* ---------- Header ---------- */
  .brand{
    display:flex;
    align-items:baseline;
    gap:12px;
    margin-bottom:6px;
    flex-wrap:wrap;
  }
  .brand-mark{
    font-family:'Fraunces', serif;
    font-weight:900;
    font-size:14px;
    letter-spacing:0.04em;
    color:var(--gold);
    background:rgba(244,197,66,0.12);
    border:1px solid rgba(244,197,66,0.35);
    border-radius:8px;
    padding:4px 9px;
    flex-shrink:0;
  }
  .brand-sub{ color:var(--text-dim); font-size:13.5px; }

  h1.title{
    font-family:'Fraunces', serif;
    font-weight:600;
    font-size:clamp(28px, 8vw, 52px);
    line-height:1.08;
    margin:6px 0 8px;
    letter-spacing:-0.01em;
    word-break:break-word;
  }
  h1.title em{
    font-style:normal;
    color:var(--gold);
  }
  .lede{
    color:var(--text-dim);
    font-size:15px;
    line-height:1.55;
    max-width:52ch;
    margin:0 0 28px;
  }
  @media (min-width:480px){
    .lede{ font-size:16px; margin-bottom:34px; }
  }

  /* ---------- Panels (screens) ---------- */
  .screen{ display:none; flex:1; flex-direction:column; min-width:0; }
  .screen.active{ display:flex; }

  /* Menu screen */
  .menu-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:14px;
    margin-top:10px;
  }
  @media (max-width:640px){ .menu-grid{ grid-template-columns:1fr; gap:12px; } }

  .menu-card{
    background:linear-gradient(180deg, var(--surface), var(--ink-2));
    border:1px solid var(--line);
    border-radius:var(--radius-lg);
    padding:22px 20px;
    text-align:left;
    cursor:pointer;
    transition:transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
    position:relative;
    overflow:hidden;
    color:inherit;
    font-family:inherit;
    min-width:0;
    width:100%;
  }
  @media (min-width:480px){
    .menu-card{ padding:28px 26px; }
  }
  .menu-card::after{
    content:"";
    position:absolute;
    inset:0;
    background:radial-gradient(220px 140px at 90% -10%, rgba(244,197,66,0.14), transparent 70%);
    opacity:0;
    transition:opacity 0.2s ease;
  }
  @media (hover:hover){
    .menu-card:hover{
      transform:translateY(-3px);
      border-color:rgba(244,197,66,0.4);
      box-shadow:0 18px 40px -20px rgba(0,0,0,0.6);
    }
    .menu-card:hover::after{ opacity:1; }
  }
  .menu-card:active{ transform:translateY(-1px) scale(0.99); }

  .menu-card .glyph{
    font-family:'Fraunces', serif;
    font-weight:900;
    font-size:32px;
    color:var(--gold);
    display:block;
    margin-bottom:12px;
  }
  @media (min-width:480px){
    .menu-card .glyph{ font-size:38px; margin-bottom:14px; }
  }
  .menu-card.join .glyph{ color:var(--blue); }
  .menu-card h3{
    font-family:'Fraunces', serif;
    font-weight:600;
    font-size:20px;
    margin:0 0 6px;
  }
  .menu-card p{
    color:var(--text-dim);
    font-size:14px;
    line-height:1.5;
    margin:0;
  }

  .name-row{
    margin-top:22px;
    display:flex;
    flex-direction:column;
    gap:8px;
    max-width:340px;
    width:100%;
  }
  label.field-label{
    font-size:13px;
    color:var(--text-dim);
    font-weight:600;
  }
  input.text-input{
    background:var(--surface-2);
    border:1px solid var(--line);
    border-radius:var(--radius-sm);
    padding:12px 14px;
    color:var(--text);
    font-family:'Manrope', sans-serif;
    font-size:16px;
    outline:none;
    transition:border-color 0.15s ease;
    width:100%;
    min-width:0;
  }
  input.text-input:focus{ border-color:var(--gold); }
  input.text-input::placeholder{ color:var(--text-dim); opacity:0.7; }

  /* Buttons */
  .btn{
    font-family:'Manrope', sans-serif;
    font-weight:700;
    font-size:14.5px;
    border:none;
    border-radius:var(--radius-sm);
    padding:12px 18px;
    cursor:pointer;
    transition:transform 0.12s ease, filter 0.15s ease, opacity 0.15s ease;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    white-space:nowrap;
  }
  @media (min-width:480px){
    .btn{ font-size:15px; padding:13px 22px; }
  }
  .btn:active{ transform:scale(0.97); }
  .btn:disabled{ opacity:0.45; cursor:not-allowed; }
  .btn-gold{ background:var(--gold); color:#211A05; }
  @media (hover:hover){ .btn-gold:hover:not(:disabled){ filter:brightness(1.08); } }
  .btn-outline{ background:transparent; color:var(--text); border:1px solid var(--line); }
  @media (hover:hover){ .btn-outline:hover:not(:disabled){ border-color:rgba(232,230,240,0.35); } }
  .btn-ghost{ background:transparent; color:var(--text-dim); padding:10px 14px; }
  @media (hover:hover){ .btn-ghost:hover{ color:var(--text); } }

  /* Join panel (inline expandable) */
  .join-panel{
    margin-top:18px;
    background:var(--surface);
    border:1px solid var(--line);
    border-radius:var(--radius-lg);
    padding:20px;
    display:none;
    max-width:420px;
    width:100%;
  }
  .join-panel.open{ display:block; }
  .code-input{
    text-transform:uppercase;
    letter-spacing:0.3em;
    font-family:'Fraunces', serif;
    font-size:22px;
    text-align:center;
    font-weight:700;
  }
  .inline-error{
    color:var(--red);
    font-size:13.5px;
    margin-top:10px;
    min-height:18px;
    word-break:break-word;
  }

  /* ---------- Lobby screen ---------- */
  .room-code-banner{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    flex-wrap:wrap;
    background:var(--surface);
    border:1px solid rgba(244,197,66,0.3);
    border-radius:var(--radius-md);
    padding:14px 16px;
    margin-bottom:20px;
  }
  .room-code-banner .code{
    font-family:'Fraunces', serif;
    font-size:26px;
    font-weight:700;
    letter-spacing:0.12em;
    color:var(--gold);
    word-break:break-all;
  }
  .room-code-banner .hint{ font-size:12px; color:var(--text-dim); margin-top:2px; }

  .player-list{
    display:flex;
    flex-direction:column;
    gap:10px;
    margin:6px 0 22px;
  }
  .player-row{
    display:flex;
    align-items:center;
    gap:12px;
    background:var(--surface);
    border:1px solid var(--line);
    border-radius:var(--radius-md);
    padding:11px 14px;
    min-width:0;
  }
  .avatar{
    width:34px; height:34px;
    border-radius:50%;
    background:linear-gradient(135deg, var(--gold), var(--blue));
    display:flex; align-items:center; justify-content:center;
    font-weight:800; color:#171B2E; font-size:13px;
    flex-shrink:0;
  }
  .player-row .pname{
    font-weight:700;
    flex:1;
    min-width:0;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .player-row .tag{
    font-size:11px;
    color:var(--gold);
    background:rgba(244,197,66,0.12);
    border-radius:6px;
    padding:2px 8px;
    font-weight:700;
    flex-shrink:0;
  }
  .player-row.offline{ opacity:0.45; }

  .lobby-actions{ display:flex; gap:10px; flex-wrap:wrap; margin-top:6px; padding-top:18px; }

  /* ---------- Game screen ---------- */
  .hud{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:12px;
    margin-bottom:18px;
    flex-wrap:wrap;
  }
  .hud-players{
    display:flex;
    gap:8px;
    flex-wrap:wrap;
    min-width:0;
    flex:1 1 auto;
  }
  .hud-chip{
    display:flex;
    align-items:center;
    gap:7px;
    background:var(--surface);
    border:1px solid var(--line);
    border-radius:999px;
    padding:6px 12px 6px 6px;
    font-size:13px;
    font-weight:700;
    transition:border-color 0.2s ease, background 0.2s ease;
    max-width:100%;
  }
  .hud-chip .pname-txt{
    max-width:22vw;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  @media (min-width:480px){
    .hud-chip .pname-txt{ max-width:140px; }
  }
  .hud-chip.active-turn{
    border-color:var(--gold);
    background:rgba(244,197,66,0.10);
  }
  .hud-chip .mini-avatar{
    width:22px; height:22px;
    border-radius:50%;
    background:var(--surface-2);
    display:flex; align-items:center; justify-content:center;
    font-size:10.5px; font-weight:800;
    flex-shrink:0;
  }
  .hud-chip .mark-badge{
    font-family:'Fraunces', serif;
    font-weight:800;
    font-size:12px;
    flex-shrink:0;
  }
  .hud-chip .mark-badge.mark-x{ color:var(--blue); }
  .hud-chip .mark-badge.mark-o{ color:var(--gold); }
  .hud-chip .wins{ color:var(--text-dim); font-size:11px; flex-shrink:0; }
  .hud-chip.flash-ok{ animation:flashOk 0.65s ease; }
  .hud-chip.flash-bad{ animation:flashBad 0.65s ease; }
  @keyframes flashOk{
    0%{ box-shadow:0 0 0 0 rgba(79,190,140,0.6); border-color:var(--green); }
    100%{ box-shadow:0 0 0 10px rgba(79,190,140,0); }
  }
  @keyframes flashBad{
    0%{ box-shadow:0 0 0 0 rgba(240,85,76,0.6); border-color:var(--red); }
    20%,60%{ transform:translateX(-3px); }
    40%,80%{ transform:translateX(3px); }
    100%{ box-shadow:0 0 0 10px rgba(240,85,76,0); transform:translateX(0); }
  }

  /* Tic-tac-toe board */
  .board-stage{
    background:var(--surface);
    border:1px solid var(--line);
    border-radius:var(--radius-lg);
    padding:18px;
    display:flex;
    flex-direction:column;
    align-items:center;
    min-width:0;
  }
  @media (min-width:480px){
    .board-stage{ padding:26px; }
  }
  .board{
    display:grid;
    grid-template-columns:repeat(3, 1fr);
    grid-template-rows:repeat(3, 1fr);
    gap:8px;
    width:100%;
    max-width:340px;
    aspect-ratio:1/1;
  }
  @media (min-width:480px){
    .board{ gap:10px; max-width:360px; }
  }
  .cell{
    background:var(--surface-2);
    border:1px solid var(--line);
    border-radius:var(--radius-md);
    display:flex;
    align-items:center;
    justify-content:center;
    font-family:'Fraunces', serif;
    font-weight:800;
    font-size:clamp(32px, 9vw, 52px);
    cursor:pointer;
    transition:border-color 0.15s ease, background 0.15s ease, transform 0.1s ease;
    user-select:none;
    position:relative;
  }
  .cell:active{ transform:scale(0.96); }
  .cell.filled{ cursor:default; }
  .cell.mark-x{ color:var(--blue); }
  .cell.mark-o{ color:var(--gold); }
  .cell.pop-in{ animation:pop-in 0.22s ease; }
  @keyframes pop-in{ from{ transform:scale(0.6); opacity:0; } to{ transform:scale(1); opacity:1; } }
  .cell.win-line{
    border-color:var(--green);
    background:rgba(79,190,140,0.12);
  }
  .cell.disabled-cell{ cursor:not-allowed; opacity:0.55; }
  @media (hover:hover){
    .cell:not(.filled):not(.disabled-cell):hover{ border-color:rgba(244,197,66,0.4); }
  }

  .prompt-row{
    margin-top:18px;
    padding-top:16px;
    border-top:1px solid var(--line);
    width:100%;
    max-width:360px;
    text-align:center;
  }
  .prompt-label{ font-size:13.5px; color:var(--text-dim); word-break:break-word; }
  .prompt-label .mine{ color:var(--gold); font-weight:800; }

  .toast{
    position:fixed;
    top:16px; left:50%;
    transform:translate(-50%, -20px);
    max-width:calc(100vw - 32px);
    background:var(--surface-2);
    border:1px solid var(--line);
    border-radius:999px;
    padding:9px 18px;
    font-size:13.5px;
    font-weight:700;
    opacity:0;
    transition:opacity 0.25s ease, transform 0.25s ease;
    z-index:50;
    pointer-events:none;
    text-align:center;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
  }
  .toast.show{ opacity:1; transform:translate(-50%, 0); }
  .toast.ok{ border-color:rgba(79,190,140,0.5); color:var(--green); }
  .toast.bad{ border-color:rgba(240,85,76,0.5); color:var(--red); }

  /* ---------- End screen ---------- */
  .end-wrap{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; }
  .end-crown{ font-size:44px; margin-bottom:6px; }
  @media (min-width:480px){ .end-crown{ font-size:52px; } }
  .end-wrap h2{ font-family:'Fraunces', serif; font-size:28px; font-weight:700; margin:0 0 6px; word-break:break-word; }
  @media (min-width:480px){ .end-wrap h2{ font-size:34px; } }
  .end-wrap .sub{ color:var(--text-dim); margin-bottom:24px; }
  .scoreboard{ display:flex; flex-direction:column; gap:10px; width:100%; max-width:400px; margin-bottom:24px; }
  .score-row{
    display:flex; align-items:center; gap:12px;
    background:var(--surface); border:1px solid var(--line);
    border-radius:var(--radius-md); padding:11px 14px;
    min-width:0;
  }
  .score-row .rank{ font-family:'Fraunces', serif; font-weight:700; color:var(--gold); width:20px; flex-shrink:0; }
  .score-row .pname{ flex:1; text-align:left; font-weight:700; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .score-row .pscore{ font-weight:800; color:var(--text-dim); flex-shrink:0; }

  /* Mute toggle */
  .mute-btn{
    position:fixed;
    top:14px; right:14px;
    z-index:40;
    background:var(--surface);
    border:1px solid var(--line);
    color:var(--text-dim);
    width:38px; height:38px;
    border-radius:50%;
    cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    font-size:16px;
  }
  @media (min-width:480px){
    .mute-btn{ top:20px; right:20px; width:40px; height:40px; font-size:17px; }
  }
  @media (hover:hover){ .mute-btn:hover{ color:var(--text); } }

  .footer-note{ margin-top:24px; font-size:12px; color:var(--text-dim); opacity:0.7; }

  @media (prefers-reduced-motion: reduce){
    .letter-field span{ animation:none; }
    .menu-card{ transition:none; }
  }
</style>

<div class="letter-field" id="letterField"></div>
<button class="mute-btn" id="muteBtn" title="Bisukan suara">🔊</button>

<div class="app">
  <div class="stage">

    <!-- ============ MENU SCREEN ============ -->
    <section class="screen active" id="screen-menu">
      <div class="brand"><span class="brand-mark">XO</span><span class="brand-sub">papan XO realtime</span></div>
      <h1 class="title">Tic-Tac-<em>Toe</em></h1>
      <p class="lede">Berdua saja, satu papan 3x3, siapa cepat susun tiga sejajar dia menang. Ajak teman lewat kode room, atau buka papanmu sendiri.</p>

      <div class="menu-grid">
        <button class="menu-card create" id="btnShowCreate">
          <span class="glyph">＋</span>
          <h3>Buat Room</h3>
          <p>Buka papan baru dan bagikan kodenya ke temanmu.</p>
        </button>
        <button class="menu-card join" id="btnShowJoin">
          <span class="glyph">↵</span>
          <h3>Gabung Room</h3>
          <p>Sudah punya kode room? Masukkan di sini dan langsung masuk.</p>
        </button>
      </div>

      <div class="name-row">
        <label class="field-label" for="nameInput">Nama panggilanmu</label>
        <input type="text" id="nameInput" class="text-input" placeholder="mis. Bagas" maxlength="16">
      </div>

      <div class="join-panel" id="joinPanel">
        <label class="field-label" for="codeInput">Kode room</label>
        <input type="text" id="codeInput" class="text-input code-input" placeholder="ABCDE" maxlength="5" style="margin-top:8px;">
        <div class="inline-error" id="joinError"></div>
        <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
          <button class="btn btn-gold" id="btnDoJoin">Gabung Sekarang</button>
          <button class="btn btn-ghost" id="btnCancelJoin">Batal</button>
        </div>
      </div>

      <p class="footer-note">Membutuhkan koneksi internet aktif untuk mode multiplayer. Room hanya untuk 2 pemain.</p>
    </section>

    <!-- ============ LOBBY SCREEN ============ -->
    <section class="screen" id="screen-lobby">
      <div class="brand"><span class="brand-mark">XO</span><span class="brand-sub">ruang tunggu</span></div>
      <div class="room-code-banner">
        <div>
          <div class="code" id="lobbyCode">—</div>
          <div class="hint">Bagikan kode ini ke teman untuk bergabung</div>
        </div>
        <button class="btn btn-outline" id="btnCopyCode">Salin Kode</button>
      </div>

      <div class="player-list" id="lobbyPlayerList"></div>

      <div class="lobby-actions">
        <button class="btn btn-gold" id="btnStartGame">Mulai Permainan</button>
        <button class="btn btn-outline" id="btnLeaveLobby">Keluar Room</button>
      </div>
      <p class="footer-note" id="lobbyHostNote"></p>
    </section>

    <!-- ============ GAME SCREEN ============ -->
    <section class="screen" id="screen-game">
      <div class="hud">
        <div class="hud-players" id="hudPlayers"></div>
      </div>

      <div class="board-stage">
        <div class="board" id="board"></div>
        <div class="prompt-row">
          <div class="prompt-label" id="promptLabel">Menunggu giliran...</div>
        </div>
      </div>
    </section>

    <!-- ============ END SCREEN ============ -->
    <section class="screen" id="screen-end">
      <div class="end-wrap">
        <div class="end-crown">🏆</div>
        <h2 id="endTitle">Permainan Selesai</h2>
        <p class="sub" id="endSub"></p>
        <div class="scoreboard" id="scoreboard"></div>
        <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center;">
          <button class="btn btn-gold" id="btnRematch">Main Lagi</button>
          <button class="btn btn-outline" id="btnBackToMenu">Kembali ke Menu</button>
        </div>
      </div>
    </section>

  </div>
</div>

<div class="toast" id="toast"></div>

<script>
(function(){
  "use strict";

  /* ============================================================
     CONFIGURE THIS: point at your deployed Cloudflare Worker URL
     ============================================================ */
  const WORKER_URL = "https://api.justinelouise.workers.dev";

  const $ = (id) => document.getElementById(id);

  /* ---------------- Viewport height fix (mobile browser chrome) ---------------- */
  function setVh(){
    document.documentElement.style.setProperty("--vh", (window.innerHeight * 0.01) + "px");
  }
  setVh();
  let vhResizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(vhResizeTimer);
    vhResizeTimer = setTimeout(setVh, 120);
  }, { passive:true });

  /* ---------------- Floating mark background (lightweight, skipped on small/low-power screens) ---------------- */
  (function initLetterField(){
    const field = $("letterField");
    if (!field) return;
    const isSmallScreen = window.innerWidth <= 520;
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isSmallScreen || prefersReducedMotion) return;
    const letters = "XO".split("");
    const count = 8;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++){
      const el = document.createElement("span");
      el.textContent = letters[Math.floor(Math.random()*letters.length)];
      el.style.left = Math.random()*100 + "%";
      el.style.top = (100 + Math.random()*40) + "%";
      el.style.fontSize = (60 + Math.random()*90) + "px";
      el.style.animationDuration = (20 + Math.random()*20) + "s";
      el.style.animationDelay = (-Math.random()*20) + "s";
      frag.appendChild(el);
    }
    field.appendChild(frag);
  })();

  /* ---------------- SFX via WebAudio (no external files, single shared context) ---------------- */
  const SFX = (function(){
    let ctx = null;
    let muted = false;
    function ensureCtx(){
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    function tone(freq, dur, type, gainPeak, delay){
      if (muted) return;
      const c = ensureCtx();
      const t0 = c.currentTime + (delay||0);
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(gainPeak || 0.2, t0 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    }
    function noiseBurst(dur, gainPeak, delay){
      if (muted) return;
      const c = ensureCtx();
      const t0 = c.currentTime + (delay||0);
      const bufferSize = Math.max(1, Math.floor(c.sampleRate * dur));
      const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++){
        data[i] = (Math.random()*2 - 1) * (1 - i/bufferSize);
      }
      const src = c.createBufferSource();
      src.buffer = buffer;
      const gain = c.createGain();
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(gainPeak || 0.15, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      const filter = c.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 800;
      src.connect(filter).connect(gain).connect(c.destination);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    }
    return {
      setMuted(v){ muted = v; },
      isMuted(){ return muted; },
      click(){ tone(720, 0.08, "triangle", 0.12); },
      hover(){ tone(950, 0.045, "sine", 0.045); },
      toggle(){ tone(660, 0.06, "triangle", 0.1); },
      roomCreated(){ tone(587.33, 0.1, "sine", 0.16); tone(880, 0.16, "sine", 0.15, 0.09); },
      join(){ tone(600, 0.09, "sine", 0.14); tone(900, 0.12, "sine", 0.13, 0.07); },
      playerJoined(){ tone(700, 0.07, "sine", 0.11); tone(1000, 0.09, "sine", 0.1, 0.06); },
      leave(){ tone(500, 0.12, "sine", 0.1); tone(340, 0.16, "sine", 0.09, 0.08); },
      disconnected(){ tone(260, 0.2, "sawtooth", 0.12); tone(180, 0.26, "sawtooth", 0.1, 0.06); },
      connError(){ noiseBurst(0.18, 0.12); tone(150, 0.24, "sawtooth", 0.1, 0.02); },
      place(){ tone(523.25, 0.09, "sine", 0.16); },
      invalidMove(){ tone(180, 0.12, "sawtooth", 0.12); },
      hostStart(){ tone(523.25, 0.1, "triangle", 0.14); tone(659.25, 0.1, "triangle", 0.14, 0.08); tone(880, 0.16, "triangle", 0.15, 0.16); },
      win(){ tone(523.25,0.14,"sine",0.18); tone(659.25,0.14,"sine",0.18,0.12); tone(783.99,0.22,"sine",0.2,0.24); },
      lose(){ tone(300,0.3,"sawtooth",0.14); tone(200,0.35,"sawtooth",0.12,0.15); },
      draw(){ tone(440,0.16,"triangle",0.12); tone(440,0.16,"triangle",0.1,0.18); },
      rematch(){ tone(660, 0.09, "triangle", 0.12); tone(880, 0.11, "triangle", 0.12, 0.07); },
      copy(){ tone(1046.5, 0.06, "sine", 0.09); },
    };
  })();

  const muteBtn = $("muteBtn");
  muteBtn.addEventListener("click", () => {
    const next = !SFX.isMuted();
    SFX.setMuted(next);
    SFX.toggle();
    muteBtn.textContent = next ? "🔇" : "🔊";
  });

  /* ---------------- Toast ---------------- */
  let toastTimer = null;
  function showToast(text, kind){
    const t = $("toast");
    t.textContent = text;
    t.className = "toast show" + (kind ? " " + kind : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = "toast"; }, 4000);
  }

  /* ---------------- Screen switching ---------------- */
  let activeScreenId = "screen-menu";
  function showScreen(id){
    if (activeScreenId === id) return;
    const prev = $(activeScreenId);
    if (prev) prev.classList.remove("active");
    $(id).classList.add("active");
    activeScreenId = id;
  }

  /* ---------------- Client state ---------------- */
  let ws = null;
  let myPlayerId = null;
  let hostId = null;
  let roomCode = null;
  let lastPhase = "lobby";
  let lastState = null;
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let intentionalClose = false;

  /* Stable per-tab identity so a dropped-then-reconnected socket rejoins as
     the SAME player on the server (keeps host status / turn slot instead of
     silently becoming an unrecognized new player after a round ends). */
  function getClientId(){
    try{
      let id = sessionStorage.getItem("lunarielle_ttt_clientId");
      if (!id){
        id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
        sessionStorage.setItem("lunarielle_ttt_clientId", id);
      }
      return id;
    }catch{
      // sessionStorage unavailable (e.g. locked-down webview) — fall back to
      // an in-memory id that's at least stable for this page's lifetime.
      if (!getClientId._fallback){
        getClientId._fallback = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2));
      }
      return getClientId._fallback;
    }
  }

  function wsUrlFor(code, name){
    const httpBase = WORKER_URL.replace(/\\/$/, "");
    const wsBase = httpBase.replace(/^http/, "ws");
    return \`\${wsBase}/ws/ttt/\${encodeURIComponent(code)}?name=\${encodeURIComponent(name)}&clientId=\${encodeURIComponent(getClientId())}\`;
  }

  function initials(name){
    return (name || "?").trim().slice(0,2).toUpperCase();
  }

  /* ---------------- Menu interactions ---------------- */
  const nameInput = $("nameInput");
  const joinPanel = $("joinPanel");
  const codeInput = $("codeInput");
  const joinError = $("joinError");

  function randomRoomCode(){
    const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 5; i++) code += alphabet[Math.floor(Math.random()*alphabet.length)];
    return code;
  }

  $("btnShowCreate").addEventListener("click", async () => {
    SFX.click();
    const name = (nameInput.value || "Pemain").trim() || "Pemain";
    const btn = $("btnShowCreate");
    btn.disabled = true;
    try{
      const code = randomRoomCode();
      connectToRoom(code, name);
      SFX.roomCreated();
    }catch(err){
      showToast("DEBUG: " + (err && err.message ? err.message : String(err)), "bad");
      SFX.connError();
    }finally{
      btn.disabled = false;
    }
  });

  $("btnShowJoin").addEventListener("click", () => {
    SFX.click();
    joinPanel.classList.add("open");
    codeInput.focus();
  });
  $("btnCancelJoin").addEventListener("click", () => {
    joinPanel.classList.remove("open");
    joinError.textContent = "";
  });

  // Normalisasi kode undangan: menerima kode mentah, "Kode: ABCDE",
  // atau teks/URL undangan yang mengandung kode 5 karakter.
  function normalizeInviteCode(value){
    const raw = String(value || "").toUpperCase().trim();
    const compact = raw.replace(/[^A-Z0-9]/g, "");
    if (/^[A-Z0-9]{5}$/.test(compact)) return compact;

    // Jika pengguna paste teks lengkap, ambil kandidat kode room 5 karakter.
    const match = raw.match(/[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{5}/);
    return match ? match[0] : compact.slice(0, 5);
  }

  codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);
  });

  // WhatsApp/WebView kadang meneruskan paste sebagai teks panjang.
  // Tangani paste sebelum maxlength=5 memotong isi sehingga kode undangan
  // tetap bisa diekstrak.
  codeInput.addEventListener("paste", (e) => {
    try {
      const text = e.clipboardData?.getData("text") || "";
      const code = normalizeInviteCode(text);
      if (code) {
        e.preventDefault();
        codeInput.value = code;
        codeInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch {}
  });

  $("btnDoJoin").addEventListener("click", async () => {
    const code = normalizeInviteCode(codeInput.value);
    codeInput.value = code;
    const name = (nameInput.value || "Pemain").trim() || "Pemain";
    joinError.textContent = "";
    if (code.length < 4){
      joinError.textContent = "Masukkan kode room yang valid.";
      SFX.invalidMove();
      return;
    }
    SFX.click();
    const btn = $("btnDoJoin");
    btn.disabled = true;
    try{
      connectToRoom(code, name);
    }catch(err){
      joinError.textContent = "DEBUG: " + (err && err.message ? err.message : String(err));
      SFX.connError();
    }finally{
      btn.disabled = false;
    }
  });

  codeInput.addEventListener("keydown", (e) => { if (e.key === "Enter") $("btnDoJoin").click(); });
  nameInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && joinPanel.classList.contains("open")) $("btnDoJoin").click(); });

  /* ---------------- WebSocket connection ---------------- */
  let myName = null;
  let pendingSend = null;

  function connectToRoom(code, name){
    roomCode = code.toUpperCase();
    myName = name;
    clearTimeout(reconnectTimer);
    reconnectAttempts = 0;
    intentionalClose = false;
    openSocket(name);
  }

  function openSocket(name){
    ws = new WebSocket(wsUrlFor(roomCode, name));

    ws.addEventListener("open", () => {
      reconnectAttempts = 0;
      SFX.join();
      if (pendingSend){
        const toSend = pendingSend;
        pendingSend = null;
        try{ ws.send(JSON.stringify(toSend)); }catch{}
      }
    });

    ws.addEventListener("message", (evt) => {
      let msg;
      try{ msg = JSON.parse(evt.data); }catch{ return; }
      handleServerMessage(msg);
    });

    ws.addEventListener("close", () => {
      if (!intentionalClose){
        if (lastPhase !== "ended"){
          SFX.disconnected();
          showToast("Koneksi terputus, menyambungkan ulang...", "bad");
        }
        scheduleReconnect(name);
      }
    });

    ws.addEventListener("error", () => {
      SFX.connError();
    });
  }

  function scheduleReconnect(name){
    if (reconnectAttempts >= 5) {
      showToast("Gagal tersambung kembali. Coba muat ulang.", "bad");
      pendingSend = null;
      return;
    }
    reconnectAttempts++;
    const delay = Math.min(1000 * reconnectAttempts, 5000);
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      if (!intentionalClose) openSocket(name);
    }, delay);
  }

  /* Sends a message, reconnecting first if the socket has died (e.g. right
     after a round ends). Keeps "Main Lagi" / "Mulai Permainan" working
     without forcing the user back to the menu to rejoin. */
  function sendMessage(payload){
    if (ws && ws.readyState === WebSocket.OPEN){
      ws.send(JSON.stringify(payload));
      return;
    }
    if (!roomCode || !myName){
      showToast("Sesi room tidak ditemukan, kembali ke menu...", "bad");
      leaveRoom();
      return;
    }
    pendingSend = payload;
    showToast("Menyambungkan ulang...", "ok");
    intentionalClose = false;
    clearTimeout(reconnectTimer);
    reconnectAttempts = 0;
    if (!ws || ws.readyState === WebSocket.CLOSED){
      openSocket(myName);
    }
    // else: CONNECTING/CLOSING — the queued pendingSend will flush on the next "open".
  }

  function handleServerMessage(msg){
    switch(msg.type){
      case "welcome":
        myPlayerId = msg.playerId;
        hostId = msg.hostId;
        $("lobbyCode").textContent = roomCode;
        showScreen("screen-lobby");
        break;
      case "state":
        renderState(msg);
        break;
      case "move_made":
        handleMoveMade(msg);
        break;
      case "game_over":
        handleGameOver(msg);
        break;
      case "error":
        if (joinPanel.classList.contains("open")) {
          joinError.textContent = msg.message || "Kode room tidak ditemukan atau sudah tidak aktif.";
        }
        showToast(msg.message || "Kode room tidak ditemukan atau sudah tidak aktif.", "bad");
        SFX.invalidMove();
        break;
    }
  }

  /* ---------------- Rendering: lobby (incremental) ---------------- */
  let lobbyPlayerIds = [];
  function renderLobby(state){
    hostId = state.hostId;
    const list = $("lobbyPlayerList");
    const newIds = state.players.map(p => p.id);
    const changed = newIds.length !== lobbyPlayerIds.length ||
      newIds.some((id, i) => id !== lobbyPlayerIds[i]) ||
      state.players.some(p => {
        const row = list.querySelector(\`[data-pid="\${p.id}"]\`);
        return !row || row.dataset.connected !== String(!!p.connected);
      });

    if (changed){
      if (newIds.length > lobbyPlayerIds.length) SFX.playerJoined();
      const frag = document.createDocumentFragment();
      state.players.forEach(p => {
        const row = document.createElement("div");
        row.className = "player-row" + (p.connected ? "" : " offline");
        row.dataset.pid = p.id;
        row.dataset.connected = String(!!p.connected);
        row.innerHTML = \`
          <div class="avatar">\${initials(p.name)}</div>
          <div class="pname">\${escapeHtml(p.name)}\${p.id === myPlayerId ? " (kamu)" : ""}</div>
          \${p.id === state.hostId ? '<div class="tag">HOST</div>' : ""}
        \`;
        frag.appendChild(row);
      });
      list.innerHTML = "";
      list.appendChild(frag);
      lobbyPlayerIds = newIds;
    }

    const iAmHost = myPlayerId === state.hostId;
    $("btnStartGame").style.display = iAmHost ? "inline-flex" : "none";
    $("lobbyHostNote").textContent = iAmHost
      ? "Kamu adalah host. Tekan \\"Mulai Permainan\\" setelah lawan bergabung (tepat 2 pemain)."
      : "Menunggu host memulai permainan...";
  }

  $("btnStartGame").addEventListener("click", () => {
    SFX.click();
    SFX.hostStart();
    sendMessage({ type: "start_game" });
  });
  $("btnCopyCode").addEventListener("click", () => {
    navigator.clipboard && navigator.clipboard.writeText(roomCode).then(() => {
      SFX.copy();
      showToast("Kode disalin!", "ok");
    }).catch(() => {});
  });
  $("btnLeaveLobby").addEventListener("click", () => {
    SFX.leave();
    leaveRoom();
  });

  function leaveRoom(){
    intentionalClose = true;
    clearTimeout(reconnectTimer);
    if (ws){
      try{ ws.send(JSON.stringify({type:"leave"})); ws.close(); }catch{}
    }
    ws = null; myPlayerId = null; hostId = null; roomCode = null;
    lobbyPlayerIds = [];
    joinPanel.classList.remove("open");
    codeInput.value = "";
    showScreen("screen-menu");
  }

  /* ---------------- Rendering: board ---------------- */
  const boardEl = $("board");
  let boardCells = [];

  function ensureBoardCells(){
    if (boardCells.length) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 9; i++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.index = String(i);
      cell.addEventListener("click", () => onCellClick(i));
      frag.appendChild(cell);
      boardCells.push(cell);
    }
    boardEl.appendChild(frag);
  }

  function onCellClick(i){
    if (!lastState || lastState.phase !== "playing") return;
    const myMark = getMyMark(lastState);
    if (!myMark || lastState.currentMark !== myMark) { SFX.invalidMove(); return; }
    if (lastState.board[i] !== null) { SFX.invalidMove(); return; }
    ws && ws.send(JSON.stringify({ type: "make_move", index: i }));
  }

  function getMyMark(state){
    const me = state.players.find(p => p.id === myPlayerId);
    return me ? me.mark : null;
  }

  function renderBoard(state, highlightLine){
    ensureBoardCells();
    for (let i = 0; i < 9; i++){
      const cell = boardCells[i];
      const val = state.board[i];
      const hadVal = cell.classList.contains("mark-x") || cell.classList.contains("mark-o");
      cell.classList.remove("mark-x", "mark-o", "filled", "win-line", "pop-in", "disabled-cell");
      if (val){
        cell.textContent = val;
        cell.classList.add("filled", val === "X" ? "mark-x" : "mark-o");
        if (!hadVal) cell.classList.add("pop-in");
      } else {
        cell.textContent = "";
      }
      if (state.phase !== "playing") cell.classList.add("disabled-cell");
    }
    if (highlightLine && highlightLine.length){
      highlightLine.forEach(i => boardCells[i].classList.add("win-line"));
    }
  }

  /* ---------------- Rendering: game ---------------- */
  function renderState(state){
    const prevPhase = lastPhase;
    lastState = state;
    if (state.phase === "lobby"){
      lastPhase = "lobby";
      renderLobby(state);
      return;
    }
    if (state.phase === "playing"){
      lastPhase = "playing";
      showScreen("screen-game");
      renderHud(state);
      renderBoard(state, null);
      renderPrompt(state);
      return;
    }
    if (state.phase === "ended"){
      lastPhase = "ended";
      renderHud(state);
      renderBoard(state, state.winLine);
      renderEnd(state);
    }
  }

  /* HUD: update chips in place instead of rebuilding innerHTML every tick */
  function renderHud(state){
    const wrap = $("hudPlayers");
    const existing = new Map();
    wrap.querySelectorAll(".hud-chip").forEach(el => existing.set(el.dataset.playerId, el));

    state.players.forEach(p => {
      const isTurn = state.phase === "playing" && p.mark === state.currentMark;
      let chip = existing.get(String(p.id));

      if (!chip){
        chip = document.createElement("div");
        chip.dataset.playerId = p.id;
        chip.innerHTML = \`
          <div class="mini-avatar">\${initials(p.name)}</div>
          <span class="pname-txt">\${escapeHtml(p.name)}</span>
          <span class="mark-badge"></span>
          <span class="wins"></span>
        \`;
        wrap.appendChild(chip);
      }

      chip.className = "hud-chip" + (isTurn ? " active-turn" : "");
      const markEl = chip.querySelector(".mark-badge");
      if (markEl){
        markEl.textContent = p.mark || "";
        markEl.className = "mark-badge" + (p.mark === "X" ? " mark-x" : p.mark === "O" ? " mark-o" : "");
      }
      const winsEl = chip.querySelector(".wins");
      if (winsEl) winsEl.textContent = p.wins ? \`\${p.wins}W\` : "";
      existing.delete(String(p.id));
    });

    existing.forEach(el => el.remove());
  }

  const promptLabel = $("promptLabel");

  function renderPrompt(state){
    const myMark = getMyMark(state);
    const isMyTurn = myMark && state.currentMark === myMark;
    if (isMyTurn){
      promptLabel.innerHTML = \`Giliranmu — kamu bermain sebagai <span class="mine">\${myMark}</span>\`;
    } else {
      const currentPlayer = state.players.find(p => p.mark === state.currentMark);
      promptLabel.textContent = currentPlayer
        ? \`Menunggu giliran \${currentPlayer.name} (\${state.currentMark})...\`
        : "Menunggu...";
    }
  }

  function handleMoveMade(msg){
    const mine = msg.playerId === myPlayerId;
    SFX.place();
    const player = lastState && lastState.players.find(p => p.id === msg.playerId);
    const who = player ? player.name : "Pemain";
    if (!mine) showToast(\`\${who} menaruh \${msg.mark}\`, "ok");
    flashPlayerChip(msg.playerId, true);
  }

  function flashPlayerChip(playerId, ok){
    const chip = document.querySelector(\`.hud-chip[data-player-id="\${playerId}"]\`);
    if (!chip) return;
    const cls = ok ? "flash-ok" : "flash-bad";
    chip.classList.add(cls);
    setTimeout(() => chip.classList.remove(cls), 650);
  }

  /* ---------------- End screen ---------------- */
  function renderEnd(state){
    showScreen("screen-end");

    const winner = state.players.find(p => p.id === state.winnerId);

    if (state.draw){
      $("endTitle").textContent = "Seri!";
      $("endSub").textContent = "Papan penuh, tidak ada yang menang ronde ini.";
      SFX.draw();
    } else if (winner){
      $("endTitle").textContent = winner.id === myPlayerId ? "Kamu Menang! 🎉" : \`\${winner.name} Menang!\`;
      $("endSub").textContent = winner.id === myPlayerId
        ? \`Tiga \${winner.mark} sejajar, kemenangan telak.\`
        : "Sampai jumpa di ronde berikutnya.";
      if (winner.id === myPlayerId) SFX.win(); else SFX.lose();
    } else {
      $("endTitle").textContent = "Permainan Selesai";
      $("endSub").textContent = "";
    }

    const sorted = [...state.players].sort((a,b) => (b.wins||0) - (a.wins||0));
    const board = $("scoreboard");
    const frag = document.createDocumentFragment();
    sorted.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerHTML = \`
        <div class="rank">\${i+1}</div>
        <div class="pname">\${escapeHtml(p.name)}\${p.id===myPlayerId?" (kamu)":""}</div>
        <div class="pscore">\${p.wins || 0} menang</div>
      \`;
      frag.appendChild(row);
    });
    board.innerHTML = "";
    board.appendChild(frag);

    const iAmHost = myPlayerId === state.hostId;
    $("btnRematch").style.display = iAmHost ? "inline-flex" : "none";
  }

  function handleGameOver(msg){
    if (lastState) renderState(Object.assign({}, lastState, { phase: "ended" }, msg));
  }

  $("btnRematch").addEventListener("click", () => {
    SFX.click();
    SFX.rematch();
    sendMessage({ type:"rematch" });
  });
  $("btnBackToMenu").addEventListener("click", () => {
    leaveRoom();
  });

  /* ---------------- Utils ---------------- */
  const escapeDiv = document.createElement("div");
  function escapeHtml(str){
    escapeDiv.textContent = str == null ? "" : String(str);
    return escapeDiv.innerHTML;
  }

  /* ---------------- Cleanup on unload ---------------- */
  window.addEventListener("pagehide", () => {
    intentionalClose = true;
    if (ws) { try { ws.close(); } catch {} }
  });

})();
</script>
`;

        if (html.includes('YOUR-SUBDOMAIN')) {
            await conn.sendMessage(targetChat, {
                text: '⚠️ Tic-Tac-Toe belum dikonfigurasi. Buka plugins/interactive/tictactoe.js, cari baris "const WORKER_URL" di dalam variabel html, lalu ganti dengan URL Cloudflare Worker kamu.'
            });
            return;
        }

        const responseData = {
            response_id: "lunarielle-tictactoe-" + Date.now(),
            sections: [
                {
                    view_model: {
                        primitive: {
                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                            payload: html,
                            trusted_sources: ["api.justinelouise.workers.dev"]
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                }
            ]
        };

        const base64Data = Buffer.from(JSON.stringify(responseData)).toString('base64');

        try {
            await sendRichHtml(conn, targetChat, null, {
                title: 'LUNARIELLE • TIC-TAC-TOE',
                responseData,
                base64Data
            });
        } catch (err) {
            await conn.sendMessage(targetChat, {
                text: `❌ Gagal mengirim Tic-Tac-Toe: ${err?.message || err}`
            });
        }
    }

tictactoe.command = 'tictactoe'
tictactoe.alias = ['ttt', 'xo', 'sambungtictactoe']
tictactoe.category = 'interactive'
tictactoe.description = "⭕ Main Tic-Tac-Toe (XO) multiplayer bareng teman (realtime)"
