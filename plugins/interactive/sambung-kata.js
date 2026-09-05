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
// plugins/interactive/sambungkata.js

export default {
    command: 'sambungkata',
    alias: ['sambung', 'wordchain'],
    category: 'interactive',
    description: '🔤 Main Sambung Kata multiplayer bareng teman (realtime)',
    execute: async (m, { sock }) => {
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

  /* ---------- Floating letters backdrop (lightweight) ---------- */
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
  /* On small / low-power screens, cut the decorative field entirely to save cycles */
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
    font-size:16px; /* 16px avoids iOS auto-zoom on focus */
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
  .hud-chip .lives{ color:var(--red); font-size:11px; letter-spacing:1px; flex-shrink:0; }
  .hud-chip.eliminated{ opacity:0.35; text-decoration:line-through; }
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

  .timer-ring-wrap{ position:relative; width:56px; height:56px; flex-shrink:0; }
  @media (min-width:480px){
    .timer-ring-wrap{ width:64px; height:64px; }
  }
  .timer-ring-wrap svg{ transform:rotate(-90deg); width:100%; height:100%; display:block; }
  .timer-ring-wrap .ring-bg{ stroke:var(--surface-2); }
  .timer-ring-wrap .ring-fg{ stroke:var(--gold); transition:stroke-dashoffset 0.2s linear, stroke 0.2s ease; }
  .timer-ring-wrap .ring-fg.urgent{ stroke:var(--red); }
  .timer-ring-wrap .ring-num{
    position:absolute; inset:0;
    display:flex; align-items:center; justify-content:center;
    font-family:'Fraunces', serif; font-weight:700; font-size:18px;
  }
  @media (min-width:480px){
    .timer-ring-wrap .ring-num{ font-size:20px; }
  }

  .chain-stage{
    background:var(--surface);
    border:1px solid var(--line);
    border-radius:var(--radius-lg);
    padding:18px;
    display:flex;
    flex-direction:column;
    min-width:0;
  }
  @media (min-width:480px){
    .chain-stage{ padding:26px; }
  }
  .chain-scroll{
    display:flex;
    flex-wrap:wrap;
    align-content:flex-start;
    gap:8px;
    overflow-y:auto;
    max-height:180px;
    min-height:40px;
    padding-bottom:6px;
    -webkit-overflow-scrolling:touch;
  }
  @media (min-width:480px){
    .chain-scroll{ gap:10px; max-height:200px; }
  }
  .word-pill{
    font-family:'Fraunces', serif;
    font-size:15.5px;
    font-weight:600;
    background:var(--surface-2);
    border:1px solid var(--line);
    border-radius:999px;
    padding:7px 14px;
    display:flex;
    align-items:center;
    gap:7px;
    max-width:100%;
    word-break:break-word;
  }
  .word-pill.pop-in{ animation:pop-in 0.25s ease; }
  @media (min-width:480px){
    .word-pill{ font-size:17px; padding:8px 16px; }
  }
  .word-pill .who{ font-size:10.5px; color:var(--text-dim); font-family:'Manrope',sans-serif; font-weight:700; white-space:nowrap; }
  @keyframes pop-in{ from{ transform:scale(0.7); opacity:0; } to{ transform:scale(1); opacity:1; } }

  .prompt-row{
    margin-top:16px;
    padding-top:16px;
    border-top:1px solid var(--line);
  }
  @media (min-width:480px){
    .prompt-row{ margin-top:18px; padding-top:18px; }
  }
  .prompt-label{ font-size:12.5px; color:var(--text-dim); margin-bottom:9px; word-break:break-word; }
  @media (min-width:480px){
    .prompt-label{ font-size:13px; margin-bottom:10px; }
  }
  .prompt-label .req-letter{
    color:var(--gold);
    font-weight:800;
    font-family:'Fraunces', serif;
    font-size:15px;
  }
  @media (min-width:480px){
    .prompt-label .req-letter{ font-size:16px; }
  }
  .input-row{ display:flex; gap:8px; flex-wrap:wrap; }
  .input-row input{ flex:1 1 140px; min-width:0; }
  .input-row .btn{ flex-shrink:0; }
  .input-row input.shake{ animation:shake 0.4s ease; border-color:var(--red) !important; }
  @keyframes shake{
    10%,90%{ transform:translateX(-2px); }
    20%,80%{ transform:translateX(4px); }
    30%,50%,70%{ transform:translateX(-8px); }
    40%,60%{ transform:translateX(8px); }
  }
  .waiting-note{
    font-size:14px;
    color:var(--text-dim);
    padding:14px 0;
    text-align:center;
  }

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
      <div class="brand"><span class="brand-mark">SK</span><span class="brand-sub">panggung kata realtime</span></div>
      <h1 class="title">Sambung <em>Kata</em></h1>
      <p class="lede">Satu kata, satu giliran, satu huruf terakhir jadi awal berikutnya. Ajak teman lewat kode room, atau buat panggungmu sendiri.</p>

      <div class="menu-grid">
        <button class="menu-card create" id="btnShowCreate">
          <span class="glyph">＋</span>
          <h3>Buat Room</h3>
          <p>Buka panggung baru dan bagikan kodenya ke teman-temanmu.</p>
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

      <p class="footer-note">Membutuhkan koneksi internet aktif untuk mode multiplayer.</p>
    </section>

    <!-- ============ LOBBY SCREEN ============ -->
    <section class="screen" id="screen-lobby">
      <div class="brand"><span class="brand-mark">SK</span><span class="brand-sub">ruang tunggu</span></div>
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
        <div class="timer-ring-wrap">
          <svg viewBox="0 0 64 64">
            <circle class="ring-bg" cx="32" cy="32" r="27" fill="none" stroke-width="6"></circle>
            <circle class="ring-fg" id="ringFg" cx="32" cy="32" r="27" fill="none" stroke-width="6" stroke-linecap="round"></circle>
          </svg>
          <div class="ring-num" id="ringNum">15</div>
        </div>
      </div>

      <div class="chain-stage">
        <div class="chain-scroll" id="chainScroll"></div>

        <div class="prompt-row" id="promptRow">
          <div class="prompt-label" id="promptLabel">Menunggu giliran...</div>
          <div class="input-row">
            <input type="text" id="wordInput" class="text-input" placeholder="Ketik kata..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <button class="btn btn-gold" id="btnSubmitWord">Kirim</button>
          </div>
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

  /* ---------------- Floating letter background (lightweight, skipped on small/low-power screens) ---------------- */
  (function initLetterField(){
    const field = $("letterField");
    if (!field) return;
    const isSmallScreen = window.innerWidth <= 520;
    const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isSmallScreen || prefersReducedMotion) return; // CSS also hides it; skip DOM work entirely
    const letters = "SAMBUNGKATA".split("");
    const count = 8; // reduced from 14 to cut paint/layout cost
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
      // UI feedback
      click(){ tone(720, 0.08, "triangle", 0.12); },
      hover(){ tone(950, 0.045, "sine", 0.045); },
      toggle(){ tone(660, 0.06, "triangle", 0.1); },
      // Room / connection lifecycle
      roomCreated(){ tone(587.33, 0.1, "sine", 0.16); tone(880, 0.16, "sine", 0.15, 0.09); },
      join(){ tone(600, 0.09, "sine", 0.14); tone(900, 0.12, "sine", 0.13, 0.07); },
      playerJoined(){ tone(700, 0.07, "sine", 0.11); tone(1000, 0.09, "sine", 0.1, 0.06); },
      leave(){ tone(500, 0.12, "sine", 0.1); tone(340, 0.16, "sine", 0.09, 0.08); },
      disconnected(){ tone(260, 0.2, "sawtooth", 0.12); tone(180, 0.26, "sawtooth", 0.1, 0.06); },
      connError(){ noiseBurst(0.18, 0.12); tone(150, 0.24, "sawtooth", 0.1, 0.02); },
      // Gameplay
      turnStart(){ tone(440, 0.1, "sine", 0.12); },
      correct(){ tone(523.25, 0.12, "sine", 0.18); tone(783.99, 0.16, "sine", 0.16, 0.09); },
      wrong(){ tone(180, 0.22, "sawtooth", 0.15); tone(120, 0.28, "sawtooth", 0.12, 0.05); },
      tick(){ tone(880, 0.045, "square", 0.05); },
      tickCritical(){ tone(1046.5, 0.06, "square", 0.08); },
      timeUp(){ noiseBurst(0.16, 0.13); tone(140, 0.22, "sawtooth", 0.1, 0.02); },
      elimination(){ tone(392, 0.14, "sawtooth", 0.13); tone(261.63, 0.24, "sawtooth", 0.12, 0.1); },
      hostStart(){ tone(523.25, 0.1, "triangle", 0.14); tone(659.25, 0.1, "triangle", 0.14, 0.08); tone(880, 0.16, "triangle", 0.15, 0.16); },
      countdown3(){ tone(494, 0.09, "square", 0.09); },
      // End of game
      win(){ tone(523.25,0.14,"sine",0.18); tone(659.25,0.14,"sine",0.18,0.12); tone(783.99,0.22,"sine",0.2,0.24); },
      lose(){ tone(300,0.3,"sawtooth",0.14); tone(200,0.35,"sawtooth",0.12,0.15); },
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
  let countdownInterval = null;
  let countdownRaf = null;
  let lastChainLen = 0;
  let lastState = null;
  let tickedThisSecond = -1;
  let reconnectAttempts = 0;
  let reconnectTimer = null;
  let intentionalClose = false;

  function wsUrlFor(code, name){
    const httpBase = WORKER_URL.replace(/\\/$/, "");
    const wsBase = httpBase.replace(/^http/, "ws");
    return \`\${wsBase}/ws/\${encodeURIComponent(code)}?name=\${encodeURIComponent(name)}\`;
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
      connectToRoom(code, name, true);
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

  codeInput.addEventListener("input", () => {
    codeInput.value = codeInput.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,5);
  });

  $("btnDoJoin").addEventListener("click", async () => {
    const code = codeInput.value.trim();
    const name = (nameInput.value || "Pemain").trim() || "Pemain";
    joinError.textContent = "";
    if (code.length < 4){
      joinError.textContent = "Masukkan kode room yang valid.";
      SFX.wrong();
      return;
    }
    SFX.click();
    const btn = $("btnDoJoin");
    btn.disabled = true;
    try{
      connectToRoom(code, name, false);
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
  function connectToRoom(code, name, isCreator){
    roomCode = code.toUpperCase();
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
    });

    ws.addEventListener("message", (evt) => {
      let msg;
      try{ msg = JSON.parse(evt.data); }catch{ return; }
      handleServerMessage(msg);
    });

    ws.addEventListener("close", (evt) => {
      if (lastPhase !== "ended" && !intentionalClose){
        SFX.disconnected();
        showToast("Koneksi terputus, menyambungkan ulang...", "bad");
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
      return;
    }
    reconnectAttempts++;
    const delay = Math.min(1000 * reconnectAttempts, 5000);
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      if (!intentionalClose) openSocket(name);
    }, delay);
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
      case "turn_result":
        handleTurnResult(msg);
        break;
      case "game_over":
        handleGameOver(msg);
        break;
      case "error":
        showToast(msg.message, "bad");
        SFX.wrong();
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
      ? "Kamu adalah host. Tekan \\"Mulai Permainan\\" setelah semua teman bergabung (minimal 2 pemain)."
      : "Menunggu host memulai permainan...";
  }

  $("btnStartGame").addEventListener("click", () => {
    SFX.click();
    SFX.hostStart();
    ws && ws.send(JSON.stringify({ type: "start_game" }));
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

  /* ---------------- Rendering: game ---------------- */
  let currentDeadline = null;
  let currentTurnSeconds = 15;

  function renderState(state){
    const prevPhase = lastPhase;
    lastState = state;
    if (state.phase === "lobby"){
      lastPhase = "lobby";
      renderLobby(state);
      return;
    }
    if (state.phase === "playing"){
      if (prevPhase !== "playing") { lastChainLen = 0; }
      lastPhase = "playing";
      showScreen("screen-game");
      renderHud(state);
      renderChain(state);
      renderPrompt(state);
      startCountdown(state.turnDeadline, state.turnSeconds);
      return;
    }
    if (state.phase === "ended"){
      lastPhase = "ended";
      renderEnd(state);
    }
  }

  /* HUD: update chips in place instead of rebuilding innerHTML every tick */
  function renderHud(state){
    const wrap = $("hudPlayers");
    const existing = new Map();
    wrap.querySelectorAll(".hud-chip").forEach(el => existing.set(el.dataset.playerId, el));

    state.players.forEach(p => {
      const isTurn = p.id === state.currentPlayerId;
      const eliminated = p.lives <= 0;
      let chip = existing.get(String(p.id));
      const livesStr = "♥".repeat(Math.max(0,p.lives)) + "♡".repeat(Math.max(0,3-p.lives));

      if (!chip){
        chip = document.createElement("div");
        chip.dataset.playerId = p.id;
        chip.innerHTML = \`
          <div class="mini-avatar">\${initials(p.name)}</div>
          <span class="pname-txt">\${escapeHtml(p.name)}</span>
          <span class="lives"></span>
        \`;
        wrap.appendChild(chip);
      }

      chip.className = "hud-chip" + (isTurn ? " active-turn" : "") + (eliminated ? " eliminated" : "");
      const livesEl = chip.querySelector(".lives");
      if (livesEl && livesEl.textContent !== livesStr) livesEl.textContent = livesStr;
      existing.delete(String(p.id));
    });

    // Remove chips for players no longer present
    existing.forEach(el => el.remove());
  }

  /* Chain: append only new pills instead of rebuilding whole list */
  function renderChain(state){
    const scroll = $("chainScroll");
    if (state.chain.length < lastChainLen){
      // chain shrank (e.g. new round) — full rebuild
      scroll.innerHTML = "";
      lastChainLen = 0;
    }
    if (state.chain.length > lastChainLen){
      const frag = document.createDocumentFragment();
      for (let i = lastChainLen; i < state.chain.length; i++){
        const entry = state.chain[i];
        const p = state.players.find(pl => pl.id === entry.playerId);
        const pill = document.createElement("div");
        pill.className = "word-pill pop-in";
        pill.innerHTML = \`\${escapeHtml(entry.word)}<span class="who">\${p ? escapeHtml(p.name) : ""}</span>\`;
        frag.appendChild(pill);
      }
      scroll.appendChild(frag);
      scroll.scrollTop = scroll.scrollHeight;
      lastChainLen = state.chain.length;
    }
  }

  const promptLabel = $("promptLabel");
  const wordInput = $("wordInput");
  const btnSubmitWord = $("btnSubmitWord");
  let wasMyTurn = false;

  function renderPrompt(state){
    const isMyTurn = state.currentPlayerId === myPlayerId;
    const last = state.chain[state.chain.length - 1];
    const reqLetter = last ? last.word[last.word.length-1].toUpperCase() : null;

    if (isMyTurn){
      promptLabel.innerHTML = reqLetter
        ? \`Giliranmu — kata harus diawali huruf <span class="req-letter">\${reqLetter}</span>\`
        : \`Giliranmu — mulai dengan kata apa saja\`;
      wordInput.disabled = false;
      btnSubmitWord.disabled = false;
      if (!wasMyTurn) { SFX.turnStart(); wordInput.focus(); }
    } else {
      const currentPlayer = state.players.find(p => p.id === state.currentPlayerId);
      promptLabel.textContent = currentPlayer
        ? \`Menunggu giliran \${currentPlayer.name}...\`
        : "Menunggu...";
      wordInput.disabled = true;
      btnSubmitWord.disabled = true;
    }
    wasMyTurn = isMyTurn;
  }

  function submitWord(){
    const val = wordInput.value.trim();
    if (!val || wordInput.disabled) return;
    ws && ws.send(JSON.stringify({ type:"submit_word", word: val }));
    wordInput.value = "";
  }
  btnSubmitWord.addEventListener("click", submitWord);
  wordInput.addEventListener("keydown", (e) => { if (e.key === "Enter") submitWord(); });

  function handleTurnResult(msg){
    const mine = msg.playerId === myPlayerId;
    const player = lastState && lastState.players.find(p => p.id === msg.playerId);
    const who = player ? player.name : "Pemain";
    const wasEliminated = player && player.lives <= 0;

    if (msg.ok){
      SFX.correct();
      showToast(mine ? \`"\${msg.word}" diterima!\` : \`\${who}: "\${msg.word}" ✓\`, "ok");
    } else {
      const reasonText = describeReason(msg.reason);
      if (msg.reason === "waktu_habis") SFX.timeUp(); else SFX.wrong();
      showToast(mine ? reasonText : \`\${who} salah — \${reasonText}\`, "bad");
      if (mine){
        wordInput.classList.add("shake");
        setTimeout(() => wordInput.classList.remove("shake"), 400);
      }
      if (wasEliminated) SFX.elimination();
    }

    flashPlayerChip(msg.playerId, msg.ok);
  }

  function flashPlayerChip(playerId, ok){
    const chip = document.querySelector(\`.hud-chip[data-player-id="\${playerId}"]\`);
    if (!chip) return;
    const cls = ok ? "flash-ok" : "flash-bad";
    chip.classList.add(cls);
    setTimeout(() => chip.classList.remove(cls), 650);
  }

  function describeReason(reason){
    if (!reason) return "Kata tidak diterima.";
    if (reason === "waktu_habis") return "Waktu habis!";
    if (reason === "kata_sudah_dipakai") return "Kata sudah pernah dipakai.";
    if (reason === "kata_tidak_dikenal") return "Kata tidak dikenali kamus.";
    if (reason === "format_tidak_valid") return "Format kata tidak valid.";
    if (reason.startsWith("harus_diawali_huruf_")){
      const letter = reason.split("_").pop().toUpperCase();
      return \`Kata harus diawali huruf \${letter}.\`;
    }
    return "Kata tidak diterima.";
  }

  /* ---------------- Countdown ring (rAF-driven, single DOM write per frame) ---------------- */
  const ringFg = $("ringFg");
  const ringNum = $("ringNum");
  const RING_CIRC = 2 * Math.PI * 27;
  ringFg.style.strokeDasharray = \`\${RING_CIRC}\`;
  let lastRenderedSec = null;

  function startCountdown(deadline, totalSeconds){
    stopCountdown();
    currentDeadline = deadline;
    currentTurnSeconds = totalSeconds || 15;
    tickedThisSecond = -1;
    lastRenderedSec = null;
    countdownRaf = requestAnimationFrame(tickCountdown);
  }

  function stopCountdown(){
    if (countdownRaf) cancelAnimationFrame(countdownRaf);
    countdownRaf = null;
    clearInterval(countdownInterval); // legacy cleanup safeguard
    countdownInterval = null;
  }

  function tickCountdown(){
    if (!currentDeadline){ countdownRaf = null; return; }
    const remainingMs = Math.max(0, currentDeadline - Date.now());
    const remainingSec = Math.ceil(remainingMs / 1000);
    const frac = Math.max(0, Math.min(1, remainingMs / (currentTurnSeconds*1000)));
    ringFg.style.strokeDashoffset = \`\${RING_CIRC * (1 - frac)}\`;

    if (remainingSec !== lastRenderedSec){
      ringNum.textContent = remainingSec;
      lastRenderedSec = remainingSec;
      const urgent = remainingSec <= 5;
      ringFg.classList.toggle("urgent", urgent);
      if (urgent && remainingSec !== tickedThisSecond && remainingSec > 0){
        if (remainingSec <= 3) SFX.tickCritical(); else SFX.tick();
        tickedThisSecond = remainingSec;
      }
    }

    if (remainingMs > 0){
      countdownRaf = requestAnimationFrame(tickCountdown);
    } else {
      countdownRaf = null;
    }
  }

  /* ---------------- End screen ---------------- */
  function renderEnd(state){
    stopCountdown();
    showScreen("screen-end");
    const sorted = [...state.players].sort((a,b) => b.score - a.score);

    const survivor = state.players.find(p => p.lives > 0);

    if (survivor){
      $("endTitle").textContent = survivor.id === myPlayerId ? "Kamu Menang! 🎉" : \`\${survivor.name} Menang!\`;
      $("endSub").textContent = survivor.id === myPlayerId
        ? "Kosakatamu paling tahan banting malam ini."
        : \`Sampai jumpa di ronde berikutnya.\`;
    } else {
      $("endTitle").textContent = "Permainan Selesai";
      $("endSub").textContent = "Semua pemain kehabisan nyawa.";
    }

    if (survivor && survivor.id === myPlayerId) SFX.win(); else SFX.lose();

    const board = $("scoreboard");
    const frag = document.createDocumentFragment();
    sorted.forEach((p, i) => {
      const row = document.createElement("div");
      row.className = "score-row";
      row.innerHTML = \`
        <div class="rank">\${i+1}</div>
        <div class="pname">\${escapeHtml(p.name)}\${p.id===myPlayerId?" (kamu)":""}</div>
        <div class="pscore">\${p.score} pts</div>
      \`;
      frag.appendChild(row);
    });
    board.innerHTML = "";
    board.appendChild(frag);

    const iAmHost = myPlayerId === state.hostId;
    $("btnRematch").style.display = iAmHost ? "inline-flex" : "none";
  }

  function handleGameOver(msg){
    // Some backends send a dedicated game_over event in addition to state phase "ended".
    // Guard against double-handling by relying on renderEnd's idempotent DOM writes.
    if (lastState) renderEnd(Object.assign({}, lastState, msg));
  }

  $("btnRematch").addEventListener("click", () => {
    SFX.click();
    SFX.rematch();
    ws && ws.send(JSON.stringify({ type:"rematch" }));
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
    stopCountdown();
    if (ws) { try { ws.close(); } catch {} }
  });

})();
</script>
`;

        if (html.includes('YOUR-SUBDOMAIN')) {
            await sock.message.send(targetChat, {
                text: '⚠️ Sambung Kata belum dikonfigurasi. Buka plugins/interactive/sambungkata.js, cari baris "const WORKER_URL" di dalam variabel html, lalu ganti dengan URL Cloudflare Worker kamu.'
            });
            return;
        }

        const responseData = {
            response_id: "lunarielle-sambungkata-" + Date.now(),
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
            await sock.message.send(targetChat, {
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            submessages: [
                                {
                                    messageType: 0,
                                    messageText: "LUNARIELLE • SAMBUNG KATA"
                                }
                            ],
                            messageType: 0,
                            unifiedResponse: {
                                data: base64Data
                            },
                            contextInfo: {
                                mentionedJid: [],
                                groupMentions: [],
                                statusAttributions: [],
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: {
                                    botJid: "867051314767696@bot"
                                },
                                forwardOrigin: 0
                            }
                        }
                    }
                }
            }, {
                additionalAttributes: { "type": "text" }
            });
        } catch (err) {
            await sock.message.send(targetChat, {
                text: `❌ Gagal mengirim Sambung Kata: ${err?.message || err}`
            });
        }
    }
};