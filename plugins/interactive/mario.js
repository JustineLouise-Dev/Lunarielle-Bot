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
// plugins/game/mariobros.js

export default {
    command: 'mariobros',
    alias: ['mario', 'supermario'],
    category: 'interactive',
    description: '🍄 Main game platformer ala Mario Bros langsung di chat',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        const html = `<style>
*{ -webkit-tap-highlight-color:transparent; user-select:none; box-sizing:border-box; }
html,body{ margin:0; background:transparent; color:#e8ecf4; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:440px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:26px;
  overflow:hidden;
  background:
    radial-gradient(120% 140% at 15% -10%, rgba(255,120,90,.15), transparent 55%),
    radial-gradient(120% 140% at 100% 0%, rgba(121,192,255,.14), transparent 50%),
    linear-gradient(180deg,#1a1d30 0%,#131526 55%,#0e1020 100%);
  box-shadow:0 20px 50px rgba(0,0,0,.55), 0 2px 0 rgba(255,255,255,.05) inset, 0 0 0 1px rgba(255,255,255,.06) inset;
  border:1px solid rgba(255,255,255,.09);
  animation:cardIn .5s cubic-bezier(.2,.8,.2,1);
}
@keyframes cardIn{ from{ opacity:0; transform:translateY(10px) scale(.98);} to{ opacity:1; transform:none; } }

.sheen{
  position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,.05) 45%, transparent 60%);
  background-size:250% 250%;
  animation:sheenMove 6s ease-in-out infinite;
  mix-blend-mode:screen;
}
@keyframes sheenMove{ 0%{background-position:120% -20%;} 50%{background-position:-20% 120%;} 100%{background-position:120% -20%;} }

.header{
  position:relative;
  padding:16px 20px 12px;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
}

.brand{ display:flex; flex-direction:column; gap:3px; }
.eyebrow{ font-size:10px; letter-spacing:3px; color:rgba(232,236,244,.42); font-weight:800; display:flex; align-items:center; gap:5px; }
.eyebrow .dot{ width:5px; height:5px; border-radius:50%; background:linear-gradient(135deg,#ff7b5c,#ffd166); box-shadow:0 0 8px rgba(255,123,92,.8); }
.title{ font-size:20px; font-weight:900; letter-spacing:-.3px; background:linear-gradient(135deg,#ffffff,#ffd7c9 60%,#ff7b5c); -webkit-background-clip:text; background-clip:text; color:transparent; }

.stats{ display:flex; gap:14px; }
.statBox{ text-align:right; }
.statLabel{ font-size:9px; letter-spacing:1.8px; color:rgba(232,236,244,.42); font-weight:800; }
.statVal{ font-size:17px; font-weight:900; color:#ffd166; font-variant-numeric:tabular-nums; text-shadow:0 0 14px rgba(255,209,102,.35); transition:transform .16s cubic-bezier(.34,1.56,.64,1); }
.statVal.pop{ transform:scale(1.28); }
.statVal.lives{ color:#ff7b7b; text-shadow:0 0 14px rgba(255,123,123,.35); }
.statVal.world{ color:#7ee787; text-shadow:0 0 14px rgba(126,231,135,.35); }

.body{
  position:relative;
  padding:0 14px 12px;
}

.stage{
  position:relative;
  border-radius:12px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.1);
  box-shadow:0 8px 20px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.05);
}
canvas{ display:block; width:100%; height:auto; }

.comboFx{
  position:absolute; left:50%; top:34%; transform:translate(-50%,-50%) scale(.7);
  font-weight:900; font-size:18px; letter-spacing:.5px; text-align:center;
  background:linear-gradient(135deg,#ffe17d,#ff9f7d 55%,#ff7bd0);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  text-shadow:0 0 22px rgba(255,180,120,.35);
  opacity:0; pointer-events:none; white-space:nowrap;
}
.comboFx.show{ animation:comboPop .8s cubic-bezier(.2,.9,.25,1); }
@keyframes comboPop{
  0%{ opacity:0; transform:translate(-50%,-50%) scale(.5); }
  18%{ opacity:1; transform:translate(-50%,-58%) scale(1.12); }
  38%{ transform:translate(-50%,-58%) scale(1); }
  100%{ opacity:0; transform:translate(-50%,-78%) scale(1.05); }
}

.footer{
  padding:0 18px 12px;
  text-align:center;
}
.status{ font-size:12px; font-weight:700; color:rgba(232,236,244,.55); letter-spacing:.3px; transition:color .2s ease; }
.status.over{ color:#ff7b7b; }
.status.good{ color:#8ff0b0; }
.status.win{ color:#ffd166; }

.shake{ animation:shakeFx .32s ease; }
@keyframes shakeFx{
  10%,90%{ transform:translateX(-1px); }
  20%,80%{ transform:translateX(2px); }
  30%,50%,70%{ transform:translateX(-4px); }
  40%,60%{ transform:translateX(4px); }
}

.controls{
  padding:0 14px 16px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:10px;
}
.dpad{
  display:grid;
  grid-template-columns:44px 44px;
  gap:7px;
}
.actionPad{
  display:flex;
  gap:8px;
}
.padBtn{
  height:44px;
  min-width:44px;
  border:none;
  border-radius:12px;
  background:linear-gradient(160deg, rgba(255,255,255,.1), rgba(255,255,255,.03));
  color:#e8ecf4;
  font-size:16px;
  font-weight:800;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:0 14px;
  box-shadow:0 3px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1);
  transition:transform .03s linear, box-shadow .03s linear, background .06s linear;
  touch-action:none;
}
.padBtn.pressed{ transform:translateY(3px); box-shadow:0 0 0 rgba(0,0,0,.35); background:linear-gradient(160deg, rgba(255,209,102,.28), rgba(255,209,102,.09)); }
.padBtn:active{ transform:translateY(3px); box-shadow:0 0 0 rgba(0,0,0,.35); background:linear-gradient(160deg, rgba(255,209,102,.28), rgba(255,209,102,.09)); }
.jumpBtn{
  background:linear-gradient(160deg, rgba(255,123,92,.35), rgba(255,123,92,.1));
  font-size:13px;
  letter-spacing:.5px;
}
.jumpBtn:active{ background:linear-gradient(160deg, rgba(255,123,92,.55), rgba(255,123,92,.2)); }
</style>

<div class="wrap">
  <div class="card" id="card">
    <div class="sheen"></div>

    <div class="header">
      <div class="brand">
        <div class="eyebrow"><span class="dot"></span>LUNARIELLE ARCADE</div>
        <div class="title">🍄 Mario Bros</div>
      </div>
      <div class="stats">
        <div class="statBox">
          <div class="statLabel">KOIN</div>
          <div class="statVal" id="coins">0</div>
        </div>
        <div class="statBox">
          <div class="statLabel">SKOR</div>
          <div class="statVal world" id="score">0</div>
        </div>
        <div class="statBox">
          <div class="statLabel">NYAWA</div>
          <div class="statVal lives" id="lives">3</div>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="stage" id="stage">
        <canvas id="game" width="320" height="180"></canvas>
        <div class="comboFx" id="comboFx"></div>
      </div>
    </div>

    <div class="footer">
      <span class="status" id="status">Tekan tombol untuk mulai</span>
    </div>

    <div class="controls">
      <div class="dpad">
        <button class="padBtn" id="btnLeft">◀</button>
        <button class="padBtn" id="btnRight">▶</button>
      </div>
      <div class="actionPad">
        <button class="padBtn jumpBtn" id="btnJump">LOMPAT</button>
      </div>
    </div>

  </div>
</div>

<script>
(function(){
"use strict";
var canvas=document.getElementById('game');
var ctx=canvas.getContext('2d');
var coinsEl=document.getElementById('coins');
var scoreEl=document.getElementById('score');
var livesEl=document.getElementById('lives');
var statusEl=document.getElementById('status');
var comboFxEl=document.getElementById('comboFx');
var cardEl=document.getElementById('card');

var VW=canvas.width, VH=canvas.height;
var TILE=16;
var GRAVITY=0.22;
var MOVE_ACCEL=0.32;
var MOVE_FRICTION=0.86;
var MAX_SPEED_RUN=1.5;
var JUMP_VELOCITY=-7.4;
var GROUND_Y_ROWS=10;

/* ---------------- Level layout ----------------
   # ground/block, ? question block (coin), = brick, ^ spike hazard,
   C coin (floating), E enemy spawn, F flag (goal), space empty
   Level is wider than the viewport -> camera scrolls horizontally.
------------------------------------------------- */
var LEVEL=[
"                                                                                                                   ",
"                                                                                                                   ",
"                       C  C  C                                            ?                                        ",
"                                              ==                        ======                                     ",
"                 ?                                          C  C  C                                                ",
"            ==                E                    ==                                E            C                ",
"                                                                                                       ==          ",
"                                          E                                                E                       ",
"##########      ##########      #####          ##########      ####          ##########        ##########F#######  ",
"##########      ##########      #####          ##########      ####          ##########        ##########F#######  "
];

var ROWS=LEVEL.length, COLS=LEVEL[0].length;
var LEVEL_PIXEL_W=COLS*TILE;

var solids=[]; // 2d grid: 0 empty,1 ground,2 brick,3 question(has coin),4 question(empty)
var coinsList=[];
var enemies=[];
var flagX=0;
var groundTopRow=8;

function buildLevel(){
  solids=[];
  coinsList=[];
  enemies=[];
  flagX=LEVEL_PIXEL_W-TILE*2;
  for(var y=0;y<ROWS;y++){
    var row=[];
    for(var x=0;x<COLS;x++){
      var ch=LEVEL[y][x];
      if(ch==='#'){ row.push(1); }
      else if(ch==='='){ row.push(2); }
      else if(ch==='?'){ row.push(3); }
      else if(ch==='F'){ row.push(0); flagX=x*TILE; }
      else { row.push(0); }
      if(ch==='C'){ coinsList.push({ x:x*TILE+TILE/2, y:y*TILE+TILE/2, taken:false, bob:Math.random()*Math.PI*2 }); }
      if(ch==='E'){ enemies.push({ x:x*TILE, y:y*TILE, vx:-0.55, alive:true, squashT:0 }); }
    }
    solids.push(row);
  }
}

/* ---------------- SFX (Web Audio synth, no external files) ---------------- */
var AudioCtx = window.AudioContext || window.webkitAudioContext;
var actx = null;
function ensureAudio(){
  if(!AudioCtx) return null;
  if(!actx){ try{ actx=new AudioCtx(); }catch(e){ actx=null; } }
  if(actx && actx.state==='suspended'){ actx.resume().catch(function(){}); }
  return actx;
}
function beep(freq, dur, opts){
  var ctx2=ensureAudio();
  if(!ctx2) return;
  opts=opts||{};
  var t0=ctx2.currentTime+(opts.delay||0);
  var osc=ctx2.createOscillator();
  var gain=ctx2.createGain();
  osc.type=opts.type||'sine';
  osc.frequency.setValueAtTime(freq,t0);
  if(opts.slideTo){ osc.frequency.exponentialRampToValueAtTime(Math.max(1,opts.slideTo), t0+dur); }
  var peak=opts.vol!=null?opts.vol:0.16;
  gain.gain.setValueAtTime(0.0001,t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0+0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  osc.connect(gain); gain.connect(ctx2.destination);
  osc.start(t0); osc.stop(t0+dur+0.02);
}
var noiseBuffer=null;
function getNoiseBuffer(ctx2){
  if(noiseBuffer && noiseBuffer._ctx===ctx2) return noiseBuffer;
  var len=ctx2.sampleRate*1;
  var buf=ctx2.createBuffer(1,len,ctx2.sampleRate);
  var data=buf.getChannelData(0);
  for(var i=0;i<len;i++) data[i]=Math.random()*2-1;
  buf._ctx=ctx2;
  noiseBuffer=buf;
  return buf;
}
function noiseBurst(dur, opts){
  var ctx2=ensureAudio();
  if(!ctx2) return;
  opts=opts||{};
  var t0=ctx2.currentTime+(opts.delay||0);
  var src=ctx2.createBufferSource();
  src.buffer=getNoiseBuffer(ctx2);
  var filt=ctx2.createBiquadFilter();
  filt.type=opts.filterType||'bandpass';
  filt.frequency.setValueAtTime(opts.freq||1200,t0);
  if(opts.freqTo){ filt.frequency.exponentialRampToValueAtTime(Math.max(1,opts.freqTo), t0+dur); }
  filt.Q.value=opts.q!=null?opts.q:1;
  var gain=ctx2.createGain();
  var peak=opts.vol!=null?opts.vol:0.14;
  gain.gain.setValueAtTime(0.0001,t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0+0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  src.connect(filt); filt.connect(gain); gain.connect(ctx2.destination);
  src.start(t0); src.stop(t0+dur+0.02);
}
var sfx={
  jump:function(){ beep(320,0.14,{type:'square',vol:0.1,slideTo:640}); },
  coin:function(){ beep(880,0.06,{type:'square',vol:0.09}); setTimeout(function(){ beep(1320,0.09,{type:'square',vol:0.08}); },50); },
  stomp:function(){ noiseBurst(0.08,{freq:900,freqTo:200,vol:0.12,q:1}); beep(180,0.08,{type:'sine',vol:0.1,slideTo:80}); },
  bump:function(){ beep(220,0.06,{type:'square',vol:0.08,slideTo:140}); },
  hurt:function(){
    beep(300,0.2,{type:'sawtooth',vol:0.12,slideTo:80});
    noiseBurst(0.25,{freq:500,freqTo:100,vol:0.08,filterType:'lowpass'});
  },
  win:function(){
    var notes=[523,659,784,1047,1319];
    for(var i=0;i<notes.length;i++){
      (function(i){ setTimeout(function(){ beep(notes[i],0.16,{type:'sine',vol:0.13}); },i*110); })(i);
    }
  },
  gameover:function(){
    beep(300,0.2,{type:'sawtooth',vol:0.12,slideTo:80});
    noiseBurst(0.3,{freq:600,freqTo:120,vol:0.08,filterType:'lowpass'});
    setTimeout(function(){ beep(220,0.24,{type:'sawtooth',vol:0.1,slideTo:60}); },140);
  },
  start:function(){ beep(440,0.05,{type:'sine',vol:0.09}); setTimeout(function(){ beep(660,0.08,{type:'sine',vol:0.1}); },70); }
};

var coins=0, score=0, lives=3;
var gameOver=false, started=false, win=false;
var camX=0;
var player, moveDir=0, particles=[];
var safeTimer=0, SAFE_DURATION=1200;
var animPhase=0;

function spawnPlayer(){
  return { x:TILE*2, y:TILE*(groundTopRow-1), w:11, h:14, vx:0, vy:0, onGround:false, facing:1, running:false, dead:false, invuln:0 };
}

function reset(){
  buildLevel();
  player=spawnPlayer();
  moveDir=0;
  coins=0; score=0; lives=3;
  gameOver=false; win=false; started=true;
  camX=0; particles=[];
  safeTimer=SAFE_DURATION;
  coinsEl.textContent='0';
  scoreEl.textContent='0';
  livesEl.textContent='3';
  statusEl.textContent='Bermain...';
  statusEl.className='status';
  sfx.start();
}

function bumpStat(el){
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
  setTimeout(function(){ el.classList.remove('pop'); },220);
}

function showCombo(text){
  comboFxEl.textContent=text;
  comboFxEl.classList.remove('show');
  void comboFxEl.offsetWidth;
  comboFxEl.classList.add('show');
}

function spawnParticles(px,py,color,n){
  n=n||8;
  for(var i=0;i<n;i++){
    var ang=Math.random()*Math.PI*2;
    var spd=0.8+Math.random()*2.0;
    particles.push({
      x:px, y:py,
      vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd-1,
      life:1, decay:0.025+Math.random()*0.02,
      size:1.6+Math.random()*2,
      color:color
    });
  }
}

function tileAt(px,py){
  var tx=Math.floor(px/TILE), ty=Math.floor(py/TILE);
  if(ty<0||ty>=ROWS||tx<0||tx>=COLS) return 0;
  return solids[ty][tx];
}

function isSolidTile(v){ return v===1||v===2||v===3||v===4; }

function rectVsTiles(x,y,w,h){
  var out=[];
  var left=Math.floor(x/TILE), right=Math.floor((x+w-1)/TILE);
  var top=Math.floor(y/TILE), bottom=Math.floor((y+h-1)/TILE);
  for(var ty=top;ty<=bottom;ty++){
    for(var tx=left;tx<=right;tx++){
      if(ty<0||ty>=ROWS||tx<0||tx>=COLS){ out.push({tx:tx,ty:ty,solid:tx<0||tx>=COLS}); continue; }
      var v=solids[ty][tx];
      if(isSolidTile(v)) out.push({tx:tx,ty:ty,solid:true,v:v});
    }
  }
  return out;
}

function hitQuestionBlock(tx,ty){
  if(solids[ty][tx]===3){
    solids[ty][tx]=4;
    coins++;
    score+=50;
    coinsEl.textContent=String(coins);
    scoreEl.textContent=String(score);
    bumpStat(coinsEl);
    spawnParticles(tx*TILE+TILE/2, ty*TILE, '#ffd166', 10);
    showCombo('+50');
    sfx.coin();
  } else {
    sfx.bump();
  }
}

function updatePlayer(dt){
  if(moveDir!==0){ player.vx+=MOVE_ACCEL*moveDir; player.facing=moveDir; player.running=true; }
  else { player.running=false; }

  player.vx*=MOVE_FRICTION;
  if(player.vx>MAX_SPEED_RUN) player.vx=MAX_SPEED_RUN;
  if(player.vx<-MAX_SPEED_RUN) player.vx=-MAX_SPEED_RUN;
  if(Math.abs(player.vx)<0.02) player.vx=0;

  player.vy+=GRAVITY;
  if(player.vy>10) player.vy=10;

  // horizontal move + collision
  var nx=player.x+player.vx;
  if(nx<0) nx=0;
  if(nx>LEVEL_PIXEL_W-player.w) nx=LEVEL_PIXEL_W-player.w;
  var hits=rectVsTiles(nx, player.y, player.w, player.h);
  var blockedX=false;
  for(var i=0;i<hits.length;i++){
    if(hits[i].solid){
      blockedX=true;
      if(player.vx>0){ nx=hits[i].tx*TILE-player.w; }
      else if(player.vx<0){ nx=(hits[i].tx+1)*TILE; }
    }
  }
  player.x=nx;
  if(blockedX) player.vx=0;

  // vertical move + collision
  var ny=player.y+player.vy;
  var wasOnGround=player.onGround;
  player.onGround=false;
  var hitsY=rectVsTiles(player.x, ny, player.w, player.h);
  for(var j=0;j<hitsY.length;j++){
    var h=hitsY[j];
    if(!h.solid) continue;
    if(player.vy>0){
      ny=h.ty*TILE-player.h;
      player.onGround=true;
      player.vy=0;
    } else if(player.vy<0){
      ny=(h.ty+1)*TILE;
      player.vy=0;
      if(h.v===3||h.v===4){ hitQuestionBlock(h.tx,h.ty); }
      else { sfx.bump(); }
    }
  }
  player.y=ny;

  if(player.y>ROWS*TILE+40){
    loseLife();
    return;
  }

  if(player.x+player.w>=flagX){
    winGame();
  }

  if(player.invuln>0) player.invuln-=dt;

  camX = player.x - VW/2 + player.w/2;
  if(camX<0) camX=0;
  var maxCam=LEVEL_PIXEL_W-VW;
  if(camX>maxCam) camX=maxCam;
}

function updateCoins(){
  for(var i=0;i<coinsList.length;i++){
    var c=coinsList[i];
    if(c.taken) continue;
    c.bob+=0.08;
    var dx=(player.x+player.w/2)-c.x, dy=(player.y+player.h/2)-c.y;
    if(Math.abs(dx)<10 && Math.abs(dy)<10){
      c.taken=true;
      coins++;
      score+=100;
      coinsEl.textContent=String(coins);
      scoreEl.textContent=String(score);
      bumpStat(coinsEl);
      spawnParticles(c.x,c.y,'#ffd166',10);
      sfx.coin();
    }
  }
}

function updateEnemies(dt){
  for(var i=0;i<enemies.length;i++){
    var e=enemies[i];
    if(!e.alive){
      if(e.squashT>0){ e.squashT-=dt; }
      continue;
    }
    var nx=e.x+e.vx;
    var footY=e.y+TILE-1;
    var aheadX = e.vx<0 ? nx : nx+TILE-1;
    var groundV=tileAt(aheadX, footY+2);
    var wallV=tileAt(aheadX, e.y+TILE/2);
    if(!isSolidTile(groundV) || isSolidTile(wallV)){
      e.vx*=-1;
    } else {
      e.x=nx;
    }

    if(player.invuln<=0 && safeTimer<=0){
      var overlapX = player.x < e.x+TILE && player.x+player.w > e.x;
      var overlapY = player.y < e.y+TILE && player.y+player.h > e.y;
      if(overlapX && overlapY){
        var stomp = player.vy>0 && (player.y+player.h) - e.y < TILE*0.6;
        if(stomp){
          e.alive=false;
          e.squashT=300;
          player.vy=JUMP_VELOCITY*0.55;
          score+=200;
          scoreEl.textContent=String(score);
          bumpStat(scoreEl);
          spawnParticles(e.x+TILE/2,e.y+TILE/2,'#c792ea',10);
          showCombo('+200');
          sfx.stomp();
        } else {
          loseLife();
          return;
        }
      }
    }
  }
}

function jump(){
  if(!started||gameOver) return;
  if(player.onGround){
    player.vy=JUMP_VELOCITY;
    player.onGround=false;
    sfx.jump();
  }
}

function loseLife(){
  if(gameOver) return;
  lives--;
  livesEl.textContent=String(lives);
  bumpStat(livesEl);
  spawnParticles(player.x+player.w/2, player.y+player.h/2, '#ff7b7b', 12);
  sfx.hurt();
  cardEl.classList.remove('shake');
  void cardEl.offsetWidth;
  cardEl.classList.add('shake');
  if(lives<=0){
    endGame();
  } else {
    player.x=TILE*2; player.y=TILE*(groundTopRow-1);
    player.vx=0; player.vy=0;
    moveDir=0;
    player.invuln=1500;
    safeTimer=SAFE_DURATION;
    statusEl.textContent='Nyawa berkurang!';
    statusEl.className='status over';
    setTimeout(function(){
      if(!gameOver){ statusEl.textContent='Bermain...'; statusEl.className='status'; }
    },700);
  }
}

function winGame(){
  if(gameOver) return;
  win=true;
  gameOver=true;
  score+=500;
  scoreEl.textContent=String(score);
  statusEl.textContent='LEVEL SELESAI! +500';
  statusEl.className='status win';
  sfx.win();
}

function endGame(){
  gameOver=true;
  statusEl.textContent='Game Over - tekan tombol untuk ulang';
  statusEl.className='status over';
  sfx.gameover();
}

function roundRect(c,x,y,w,h,r){
  c.beginPath();
  c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r);
  c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);
  c.arcTo(x,y,x+w,y,r);
  c.closePath();
}

function drawBackground(){
  var bg=ctx.createLinearGradient(0,0,0,VH);
  bg.addColorStop(0,'#1a2a52');
  bg.addColorStop(0.65,'#284a7a');
  bg.addColorStop(1,'#3f6ea3');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,VW,VH);

  // parallax hills
  ctx.fillStyle='rgba(255,255,255,.06)';
  for(var i=0;i<4;i++){
    var hx=((i*140) - camX*0.3) % (VW+160) - 80;
    ctx.beginPath();
    ctx.arc(hx, VH*0.62, 46, Math.PI, 0);
    ctx.fill();
  }
  // clouds
  ctx.fillStyle='rgba(255,255,255,.5)';
  for(var c=0;c<3;c++){
    var cx=((c*160)+40 - camX*0.5) % (VW+200) - 100;
    var cy=24+c*14;
    drawCloud(cx,cy);
  }
}

function drawCloud(x,y){
  ctx.beginPath();
  ctx.arc(x,y,9,0,Math.PI*2);
  ctx.arc(x+10,y-4,11,0,Math.PI*2);
  ctx.arc(x+22,y,9,0,Math.PI*2);
  ctx.fill();
}

function drawTiles(){
  var startCol=Math.floor(camX/TILE);
  var endCol=Math.ceil((camX+VW)/TILE);
  for(var ty=0;ty<ROWS;ty++){
    for(var tx=Math.max(0,startCol);tx<=Math.min(COLS-1,endCol);tx++){
      var v=solids[ty][tx];
      if(v===0) continue;
      var px=tx*TILE-camX, py=ty*TILE;
      if(v===1){
        var g=ctx.createLinearGradient(px,py,px,py+TILE);
        g.addColorStop(0,'#8a5a3a');
        g.addColorStop(1,'#5c3a22');
        ctx.fillStyle=g;
        ctx.fillRect(px,py,TILE,TILE);
        ctx.fillStyle='rgba(255,255,255,.12)';
        ctx.fillRect(px,py,TILE,2);
        ctx.strokeStyle='rgba(0,0,0,.25)';
        ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      } else if(v===2){
        ctx.fillStyle='#b5502e';
        ctx.fillRect(px,py,TILE,TILE);
        ctx.strokeStyle='rgba(0,0,0,.3)';
        ctx.lineWidth=1;
        ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
        ctx.beginPath(); ctx.moveTo(px,py+TILE/2); ctx.lineTo(px+TILE,py+TILE/2); ctx.stroke();
      } else if(v===3){
        var pulse=0.85+0.15*Math.sin(Date.now()/180);
        ctx.fillStyle='#ffcc4d';
        ctx.globalAlpha=pulse;
        ctx.fillRect(px,py,TILE,TILE);
        ctx.globalAlpha=1;
        ctx.strokeStyle='rgba(0,0,0,.35)';
        ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
        ctx.fillStyle='#7a4a1a';
        ctx.font='bold 10px monospace';
        ctx.textAlign='center';
        ctx.fillText('?',px+TILE/2,py+TILE-4);
        ctx.textAlign='left';
      } else if(v===4){
        ctx.fillStyle='#6b4a35';
        ctx.fillRect(px,py,TILE,TILE);
        ctx.strokeStyle='rgba(0,0,0,.3)';
        ctx.strokeRect(px+0.5,py+0.5,TILE-1,TILE-1);
      }
    }
  }
}

function drawFlag(){
  var px=flagX-camX;
  if(px<-TILE||px>VW+TILE) return;
  var poleTop=(groundTopRow-6)*TILE;
  var poleBottom=groundTopRow*TILE;
  ctx.strokeStyle='#d8d8d8';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(px+TILE/2, poleTop);
  ctx.lineTo(px+TILE/2, poleBottom);
  ctx.stroke();
  var flagBob=Math.sin(Date.now()/300)*2;
  ctx.fillStyle='#7ee787';
  ctx.beginPath();
  ctx.moveTo(px+TILE/2, poleTop+4);
  ctx.lineTo(px+TILE/2+14+flagBob, poleTop+9);
  ctx.lineTo(px+TILE/2, poleTop+14);
  ctx.closePath();
  ctx.fill();
}

function drawCoins(){
  for(var i=0;i<coinsList.length;i++){
    var c=coinsList[i];
    if(c.taken) continue;
    var px=c.x-camX;
    if(px<-20||px>VW+20) continue;
    var py=c.y+Math.sin(c.bob)*2;
    var squish=Math.abs(Math.cos(c.bob*1.3))*0.6+0.4;
    ctx.save();
    ctx.translate(px,py);
    ctx.scale(squish,1);
    var g=ctx.createRadialGradient(0,0,0,0,0,5);
    g.addColorStop(0,'#fff3c4');
    g.addColorStop(1,'#ffcc4d');
    ctx.fillStyle=g;
    ctx.beginPath();
    ctx.arc(0,0,5,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

function drawEnemies(){
  for(var i=0;i<enemies.length;i++){
    var e=enemies[i];
    var px=e.x-camX;
    if(px<-24||px>VW+24) continue;
    if(!e.alive && e.squashT<=0) continue;
    ctx.save();
    if(!e.alive){
      ctx.translate(px+TILE/2, e.y+TILE-2);
      ctx.scale(1,0.25);
      ctx.translate(-(px+TILE/2), -(e.y+TILE-2));
    }
    var by=e.y+TILE-2;
    ctx.fillStyle='#8a4a2e';
    roundRect(ctx,px+2,e.y+4,TILE-4,TILE-6,3);
    ctx.fill();
    ctx.fillStyle='#e8ecf4';
    ctx.beginPath(); ctx.arc(px+5,e.y+9,1.6,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px+TILE-5,e.y+9,1.6,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#2a1810';
    ctx.beginPath(); ctx.arc(px+5,e.y+9,0.8,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px+TILE-5,e.y+9,0.8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#5c3320';
    ctx.fillRect(px+2,e.y+TILE-4,3,4);
    ctx.fillRect(px+TILE-5,e.y+TILE-4,3,4);
    ctx.restore();
  }
}

function drawPlayer(){
  var px=player.x-camX, py=player.y;
  if(player.invuln>0 && Math.floor(player.invuln/100)%2===0) return;
  ctx.save();
  ctx.translate(px+player.w/2, py+player.h/2);
  ctx.scale(player.facing,1);
  ctx.translate(-(player.w/2), -(player.h/2));

  // cap
  ctx.fillStyle='#ff5b4d';
  roundRect(ctx,0,0,player.w,5,2);
  ctx.fill();
  ctx.fillRect(player.w-3,3,5,3);
  // face
  ctx.fillStyle='#ffcf9e';
  ctx.fillRect(1,4,player.w-2,4);
  // overalls
  ctx.fillStyle='#3a6cd9';
  ctx.fillRect(0,8,player.w,player.h-8);
  // shirt sleeves
  ctx.fillStyle='#ff5b4d';
  ctx.fillRect(0,8,player.w,2.4);
  // legs/feet animation
  var walkCycle = player.running && player.onGround ? Math.sin(animPhase) : 0;
  ctx.fillStyle='#6b3a20';
  var legOffset=walkCycle*2;
  ctx.fillRect(1,player.h-3, player.w/2-1, 3+ (player.onGround?0:legOffset*0));
  ctx.fillRect(player.w/2, player.h-3, player.w/2-1, 3);

  ctx.restore();
}

function draw(){
  drawBackground();
  ctx.save();
  drawTiles();
  drawFlag();
  drawCoins();
  drawEnemies();
  drawPlayer();
  ctx.restore();

  for(var p=0;p<particles.length;p++){
    var pt=particles[p];
    ctx.save();
    ctx.globalAlpha=Math.max(0,pt.life);
    ctx.fillStyle=pt.color;
    ctx.beginPath();
    ctx.arc(pt.x-camX,pt.y,pt.size,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  if(!started){
    ctx.fillStyle='rgba(10,15,30,.55)';
    ctx.fillRect(0,0,VW,VH);
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.font='700 13px -apple-system,Arial,sans-serif';
    ctx.fillText('Tekan tombol',VW/2,VH/2);
    ctx.fillText('untuk mulai',VW/2,VH/2+16);
    ctx.textAlign='left';
  }

  if(gameOver){
    ctx.fillStyle='rgba(10,10,20,.72)';
    ctx.fillRect(0,0,VW,VH);
    var grad2=ctx.createLinearGradient(0,VH/2-24,0,VH/2+10);
    if(win){ grad2.addColorStop(0,'#ffffff'); grad2.addColorStop(1,'#ffd166'); }
    else { grad2.addColorStop(0,'#ffffff'); grad2.addColorStop(1,'#ff7b7b'); }
    ctx.fillStyle=grad2;
    ctx.textAlign='center';
    ctx.font='800 17px -apple-system,Arial,sans-serif';
    ctx.fillText(win?'LEVEL SELESAI!':'GAME OVER',VW/2,VH/2-10);
    ctx.fillStyle='rgba(232,236,244,.85)';
    ctx.font='600 11px -apple-system,Arial,sans-serif';
    ctx.fillText('Tekan tombol untuk ulang',VW/2,VH/2+10);
    ctx.textAlign='left';
  }
}

function stepAnim(dt){
  animPhase+=dt*0.012;
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx; p.y+=p.vy;
    p.vy+=0.08;
    p.vx*=0.96;
    p.life-=p.decay;
    if(p.life<=0) particles.splice(i,1);
  }
  if(safeTimer>0){
    safeTimer-=dt;
    if(safeTimer<0) safeTimer=0;
  }
}

var rafId=null;
var FALLBACK_MS=50;
var last=0;

function tick(dt){
  updatePlayer(dt);
  if(!gameOver){
    updateCoins();
    updateEnemies(dt);
  }
  stepAnim(dt);
}

function loop(t){
  if(!last) last=t;
  var dt=t-last;
  last=t;
  if(dt>34) dt=34;

  if(started && !gameOver){
    tick(dt);
  } else if(started && gameOver){
    stepAnim(dt);
  }

  draw();
  rafId=requestAnimationFrame(loop);
}

// Some embedded WebViews throttle or pause requestAnimationFrame when
// the surface is not considered visible like a normal browser tab.
// To keep the game ticking, and to make sure the screen reflects the
// current state right after a button press, we force an immediate
// redraw inside every input handler and also run a setInterval as a
// fallback driver alongside rAF.
setInterval(function(){
  var now = (typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
  if(!last){ last=now; return; }
  var dt=now-last;
  if(dt>=FALLBACK_MS){
    if(dt>34) dt=34;
    last=now;
    if(started && !gameOver){
      tick(dt);
    } else if(started && gameOver){
      stepAnim(dt);
    }
    draw();
  }
},FALLBACK_MS);

function forceRedraw(){ draw(); }

function startOrAction(fn){
  if(!started||gameOver){ reset(); forceRedraw(); return; }
  fn();
  forceRedraw();
  ensureAudio();
}

var btnLeft=document.getElementById('btnLeft');
var btnRight=document.getElementById('btnRight');
var btnJump=document.getElementById('btnJump');

function toggleDir(d){
  ensureAudio();
  if(!started||gameOver){ reset(); forceRedraw(); return; }
  moveDir = (moveDir===d) ? 0 : d;
  forceRedraw();
}

function toggleDir(d){
  if(!started||gameOver){ reset(); forceRedraw(); return; }
  moveDir = (moveDir===d) ? 0 : d;
  forceRedraw();
  ensureAudio();
}

var lastInputT=0;
function bindFastTap(el, handler){
  function press(){ el.classList.add('pressed'); }
  function release(){ el.classList.remove('pressed'); }
  function fire(e){
    e.preventDefault();
    var now=(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
    press();
    setTimeout(release,90);
    if(now-lastInputT<40) return; // debounce duplicate pointerdown+touchstart firing
    lastInputT=now;
    handler();
  }
  el.addEventListener('touchstart', fire, {passive:false});
  el.addEventListener('pointerdown', fire);
  el.addEventListener('mousedown', fire);
}

bindFastTap(btnLeft, function(){ toggleDir(-1); });
bindFastTap(btnRight, function(){ toggleDir(1); });
bindFastTap(btnJump, function(){ startOrAction(jump); });

document.addEventListener('keydown',function(e){
  if(e.code==='ArrowLeft'){ e.preventDefault(); toggleDir(-1); }
  else if(e.code==='ArrowRight'){ e.preventDefault(); toggleDir(1); }
  else if(e.code==='Space'||e.code==='ArrowUp'){ e.preventDefault(); startOrAction(jump); }
});

buildLevel();
player=spawnPlayer();
moveDir=0;
draw();
rafId=requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-mariobros-" + Date.now(),
            sections: [
                {
                    view_model: {
                        primitive: {
                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                            payload: html,
                            trusted_sources: ["justinelouise-dev.github.io"]
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
                                    messageText: "LUNARIELLE • MARIO BROS"
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
                text: `❌ Gagal mengirim Mario Bros: ${err?.message || err}`
            });
        }
    }
};