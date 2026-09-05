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
// plugins/game/pacman.js

export default {
    command: 'pacman',
    alias: ['pac', 'pacmangame'],
    category: 'interactive',
    description: '👻 Main game Pacman klasik langsung di chat',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        const html = `<style>
*{ -webkit-tap-highlight-color:transparent; user-select:none; box-sizing:border-box; }
html,body{ margin:0; background:transparent; color:#e8ecf4; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:26px;
  overflow:hidden;
  background:
    radial-gradient(120% 140% at 15% -10%, rgba(255,209,102,.13), transparent 55%),
    radial-gradient(120% 140% at 100% 0%, rgba(121,192,255,.12), transparent 50%),
    linear-gradient(180deg,#14162a 0%,#0f1122 55%,#0a0c1a 100%);
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
.eyebrow .dot{ width:5px; height:5px; border-radius:50%; background:linear-gradient(135deg,#ffd166,#ff7bd0); box-shadow:0 0 8px rgba(255,209,102,.8); }
.title{ font-size:20px; font-weight:900; letter-spacing:-.3px; background:linear-gradient(135deg,#ffffff,#ffe9b0 60%,#ffd166); -webkit-background-clip:text; background-clip:text; color:transparent; }

.stats{ display:flex; gap:16px; }
.statBox{ text-align:right; }
.statLabel{ font-size:9px; letter-spacing:1.8px; color:rgba(232,236,244,.42); font-weight:800; }
.statVal{ font-size:17px; font-weight:900; color:#ffd166; font-variant-numeric:tabular-nums; text-shadow:0 0 14px rgba(255,209,102,.35); transition:transform .16s cubic-bezier(.34,1.56,.64,1); }
.statVal.pop{ transform:scale(1.28); }
.statVal.lives{ color:#ff7b7b; text-shadow:0 0 14px rgba(255,123,123,.35); }

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
  position:absolute; left:50%; top:38%; transform:translate(-50%,-50%) scale(.7);
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

.padGrid{
  padding:0 14px 16px;
  display:grid;
  grid-template-columns:44px 44px 44px;
  grid-template-rows:42px 42px 42px;
  gap:7px;
  justify-content:center;
}
.padBtn{
  border:none;
  border-radius:11px;
  background:linear-gradient(160deg, rgba(255,255,255,.1), rgba(255,255,255,.03));
  color:#e8ecf4;
  font-size:16px;
  font-weight:800;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 3px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1);
  transition:transform .08s ease, box-shadow .08s ease, background .12s ease;
}
.padBtn:active{ transform:translateY(3px); box-shadow:0 0 0 rgba(0,0,0,.35); background:linear-gradient(160deg, rgba(255,209,102,.28), rgba(255,209,102,.09)); }
.padEmpty{ visibility:hidden; }
#btnUp{ grid-column:2; grid-row:1; }
#btnLeft{ grid-column:1; grid-row:2; }
#btnRotateSpacer{ grid-column:2; grid-row:2; }
#btnRight{ grid-column:3; grid-row:2; }
#btnDown{ grid-column:2; grid-row:3; }
</style>

<div class="wrap">
  <div class="card" id="card">
    <div class="sheen"></div>

    <div class="header">
      <div class="brand">
        <div class="eyebrow"><span class="dot"></span>LUNARIELLE ARCADE</div>
        <div class="title">👻 Pacman</div>
      </div>
      <div class="stats">
        <div class="statBox">
          <div class="statLabel">SKOR</div>
          <div class="statVal" id="score">0</div>
        </div>
        <div class="statBox">
          <div class="statLabel">NYAWA</div>
          <div class="statVal lives" id="lives">3</div>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="stage" id="stage">
        <canvas id="game" width="266" height="304"></canvas>
        <div class="comboFx" id="comboFx"></div>
      </div>
    </div>

    <div class="footer">
      <span class="status" id="status">Tekan tombol untuk mulai</span>
    </div>

    <div class="padGrid">
      <button class="padBtn" id="btnUp">▲</button>
      <div class="padEmpty"></div>
      <button class="padBtn" id="btnLeft">◀</button>
      <button class="padBtn padEmpty" id="btnRotateSpacer">•</button>
      <button class="padBtn" id="btnRight">▶</button>
      <button class="padBtn" id="btnDown">▼</button>
    </div>

  </div>
</div>

<script>
(function(){
"use strict";
var canvas=document.getElementById('game');
var ctx=canvas.getContext('2d');
var scoreEl=document.getElementById('score');
var livesEl=document.getElementById('lives');
var statusEl=document.getElementById('status');
var comboFxEl=document.getElementById('comboFx');
var cardEl=document.getElementById('card');

/* ---------------- Maze layout ----------------
   # wall, . pellet, o power pellet, space empty (corridor, no pellet),
   G ghost spawn (treated as empty), P pacman spawn (treated as empty)
------------------------------------------------- */
var MAP=[
"###########",
"#.........#",
"#.##.#.##.#",
"#o##.#.##o#",
"#.........#",
"#.##.#.##.#",
"#.#.....#.#",
"#.#.GGG.#.#",
"#.........#",
"#.#.....#.#",
"#....P....#",
"###########"
];

var ROWS=MAP.length, COLS=MAP[0].length;
var CELL=Math.floor(canvas.width/COLS);
canvas.height=CELL*ROWS;

var grid=[]; // 0 empty, 1 wall, 2 pellet, 3 power pellet
var totalPellets=0;

function buildGrid(){
  grid=[];
  totalPellets=0;
  var pacStart=null, ghostStarts=[];
  for(var y=0;y<ROWS;y++){
    var row=[];
    for(var x=0;x<COLS;x++){
      var ch=MAP[y][x];
      if(ch==='#'){ row.push(1); }
      else if(ch==='.'){ row.push(2); totalPellets++; }
      else if(ch==='o'){ row.push(3); totalPellets++; }
      else if(ch==='P'){ row.push(2); totalPellets++; pacStart={x:x,y:y}; }
      else if(ch==='G'){ row.push(0); ghostStarts.push({x:x,y:y}); }
      else { row.push(0); }
    }
    grid.push(row);
  }
  return { pacStart:pacStart, ghostStarts:ghostStarts };
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
  chomp:function(){ beep(280,0.04,{type:'square',vol:0.06,slideTo:180}); },
  power:function(){
    beep(220,0.12,{type:'sawtooth',vol:0.12,slideTo:440});
    setTimeout(function(){ beep(440,0.12,{type:'sawtooth',vol:0.1,slideTo:660}); },90);
  },
  eatGhost:function(){
    beep(600,0.08,{type:'triangle',vol:0.15,slideTo:1200});
    setTimeout(function(){ beep(900,0.1,{type:'triangle',vol:0.12,slideTo:1600}); },60);
  },
  hit:function(){
    beep(300,0.2,{type:'sawtooth',vol:0.12,slideTo:80});
    noiseBurst(0.25,{freq:500,freqTo:100,vol:0.08,filterType:'lowpass'});
  },
  win:function(){
    var notes=[523,659,784,1047];
    for(var i=0;i<notes.length;i++){
      (function(i){ setTimeout(function(){ beep(notes[i],0.16,{type:'sine',vol:0.13}); },i*120); })(i);
    }
  },
  gameover:function(){
    beep(300,0.2,{type:'sawtooth',vol:0.12,slideTo:80});
    noiseBurst(0.3,{freq:600,freqTo:120,vol:0.08,filterType:'lowpass'});
    setTimeout(function(){ beep(220,0.24,{type:'sawtooth',vol:0.1,slideTo:60}); },140);
  },
  start:function(){ beep(440,0.05,{type:'sine',vol:0.09}); setTimeout(function(){ beep(660,0.08,{type:'sine',vol:0.1}); },70); }
};

var score=0, lives=3, pelletsLeft=0;
var gameOver=false, started=false, win=false;
var pac, ghosts, dir, nextDir;
var powerTimer=0, POWER_DURATION=6000;
var safeTimer=0, SAFE_DURATION=1500;
var moveAcc=0, MOVE_TIME=260, GHOST_MOVE_TIME=340;
var ghostAcc=0;
var particles=[];
var mouthPhase=0;

function isWall(gx,gy){
  if(gy<0||gy>=ROWS) return true;
  if(gx<0) gx=COLS-1;
  if(gx>=COLS) gx=0;
  return grid[gy][gx]===1;
}

function wrapX(gx){
  if(gx<0) return COLS-1;
  if(gx>=COLS) return 0;
  return gx;
}

function reset(){
  var spawns=buildGrid();
  pac={ x:spawns.pacStart.x, y:spawns.pacStart.y };
  dir={x:0,y:0};
  nextDir={x:0,y:0};
  var gsList=spawns.ghostStarts && spawns.ghostStarts.length===3 ? spawns.ghostStarts : [{x:4,y:7},{x:5,y:7},{x:6,y:7}];
  ghosts=[
    { x:gsList[0].x, y:gsList[0].y, color:'#ff7b7b', dir:{x:0,y:1}, scared:false, home:{x:gsList[0].x,y:gsList[0].y} },
    { x:gsList[1].x, y:gsList[1].y, color:'#79c0ff', dir:{x:0,y:1}, scared:false, home:{x:gsList[1].x,y:gsList[1].y} },
    { x:gsList[2].x, y:gsList[2].y, color:'#c792ea', dir:{x:0,y:1}, scared:false, home:{x:gsList[2].x,y:gsList[2].y} }
  ];
  score=0; lives=3; pelletsLeft=totalPellets;
  gameOver=false; win=false; started=true;
  powerTimer=0; moveAcc=0; ghostAcc=0;
  safeTimer=SAFE_DURATION;
  particles=[];
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

function spawnParticles(gx,gy,color){
  for(var i=0;i<8;i++){
    var ang=Math.random()*Math.PI*2;
    var spd=1.2+Math.random()*2.2;
    particles.push({
      x:gx*CELL+CELL/2, y:gy*CELL+CELL/2,
      vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
      life:1, decay:0.03+Math.random()*0.02,
      size:2+Math.random()*2.5,
      color:color
    });
  }
}

function setDirection(dx,dy){
  if(!started||gameOver) return;
  nextDir={x:dx,y:dy};
}

function tryMovePac(){
  if(!isWall(wrapX(pac.x+nextDir.x), pac.y+nextDir.y) && (nextDir.x!==0||nextDir.y!==0)){
    dir=nextDir;
  }
  var nx=wrapX(pac.x+dir.x), ny=pac.y+dir.y;
  if(!isWall(nx,ny)){
    pac.x=nx; pac.y=ny;
  }
  var cell=grid[pac.y][pac.x];
  if(cell===2){
    grid[pac.y][pac.x]=0;
    score+=10;
    pelletsLeft--;
    scoreEl.textContent=String(score);
    bumpStat(scoreEl);
    sfx.chomp();
  } else if(cell===3){
    grid[pac.y][pac.x]=0;
    score+=50;
    pelletsLeft--;
    scoreEl.textContent=String(score);
    bumpStat(scoreEl);
    powerTimer=POWER_DURATION;
    for(var i=0;i<ghosts.length;i++){ ghosts[i].scared=true; }
    showCombo('POWER UP!');
    sfx.power();
  }
  if(pelletsLeft<=0){
    winGame();
  }
}

function ghostDirOptions(g){
  var opts=[{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  var valid=[];
  for(var i=0;i<opts.length;i++){
    var o=opts[i];
    if(o.x===-g.dir.x && o.y===-g.dir.y) continue; // avoid instant reverse
    var nx=wrapX(g.x+o.x), ny=g.y+o.y;
    if(!isWall(nx,ny)) valid.push(o);
  }
  if(valid.length===0){
    var back={x:-g.dir.x,y:-g.dir.y};
    var nx2=wrapX(g.x+back.x), ny2=g.y+back.y;
    if(!isWall(nx2,ny2)) valid.push(back);
  }
  return valid;
}

function moveGhosts(){
  for(var i=0;i<ghosts.length;i++){
    var g=ghosts[i];
    var valid=ghostDirOptions(g);
    if(valid.length>0){
      var best=null, bestDist=Infinity;
      for(var j=0;j<valid.length;j++){
        var o=valid[j];
        var nx=wrapX(g.x+o.x), ny=g.y+o.y;
        var dist=(nx-pac.x)*(nx-pac.x)+(ny-pac.y)*(ny-pac.y);
        if(g.scared) dist=-dist; // run away when scared
        if(Math.random()<0.18){ dist=Math.random(); } // slight randomness
        if(dist<bestDist){ bestDist=dist; best=o; }
      }
      g.dir=best;
      g.x=wrapX(g.x+best.x);
      g.y=g.y+best.y;
    }
  }
  checkGhostCollisions();
}

function checkGhostCollisions(){
  for(var i=0;i<ghosts.length;i++){
    var g=ghosts[i];
    if(g.x===pac.x && g.y===pac.y){
      if(g.scared){
        score+=200;
        scoreEl.textContent=String(score);
        bumpStat(scoreEl);
        spawnParticles(g.x,g.y,g.color);
        showCombo('+200');
        sfx.eatGhost();
        g.x=g.home.x; g.y=g.home.y; g.scared=false;
      } else {
        if(safeTimer>0) continue;
        loseLife();
        return;
      }
    }
  }
}

function loseLife(){
  lives--;
  livesEl.textContent=String(lives);
  bumpStat(livesEl);
  spawnParticles(pac.x,pac.y,'#ffd166');
  sfx.hit();
  cardEl.classList.remove('shake');
  void cardEl.offsetWidth;
  cardEl.classList.add('shake');
  if(lives<=0){
    endGame();
  } else {
    pac.x=lastPacStart.x; pac.y=lastPacStart.y;
    dir={x:0,y:0}; nextDir={x:0,y:0};
    for(var i=0;i<ghosts.length;i++){
      ghosts[i].x=ghosts[i].home.x;
      ghosts[i].y=ghosts[i].home.y;
      ghosts[i].scared=false;
    }
    safeTimer=SAFE_DURATION;
    statusEl.textContent='Nyawa berkurang!';
    statusEl.className='status over';
    setTimeout(function(){
      if(!gameOver){ statusEl.textContent='Bermain...'; statusEl.className='status'; }
    },700);
  }
}

var lastPacStart={x:5,y:10};

function winGame(){
  win=true;
  gameOver=true;
  statusEl.textContent='MENANG! Semua pellet habis';
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

function drawMaze(){
  for(var y=0;y<ROWS;y++){
    for(var x=0;x<COLS;x++){
      var cell=grid[y][x];
      var px=x*CELL, py=y*CELL;
      if(cell===1){
        ctx.fillStyle='#2a3a6b';
        roundRect(ctx,px+1,py+1,CELL-2,CELL-2,3);
        ctx.fill();
        ctx.strokeStyle='rgba(121,192,255,.3)';
        ctx.lineWidth=1;
        roundRect(ctx,px+1,py+1,CELL-2,CELL-2,3);
        ctx.stroke();
      } else if(cell===2){
        ctx.fillStyle='#ffe9b0';
        ctx.beginPath();
        ctx.arc(px+CELL/2,py+CELL/2,Math.max(1.4,CELL*0.09),0,Math.PI*2);
        ctx.fill();
      } else if(cell===3){
        var pulse=0.7+0.3*Math.sin(Date.now()/150);
        ctx.fillStyle='#ffd166';
        ctx.globalAlpha=pulse;
        ctx.beginPath();
        ctx.arc(px+CELL/2,py+CELL/2,CELL*0.28,0,Math.PI*2);
        ctx.fill();
        ctx.globalAlpha=1;
      }
    }
  }
}

function drawPac(){
  var px=pac.x*CELL+CELL/2, py=pac.y*CELL+CELL/2;
  var r=CELL*0.42;
  var angle=0;
  if(dir.x===1) angle=0;
  else if(dir.x===-1) angle=Math.PI;
  else if(dir.y===1) angle=Math.PI/2;
  else if(dir.y===-1) angle=-Math.PI/2;
  var mouth=Math.abs(Math.sin(mouthPhase))*0.32+0.06;
  ctx.save();
  ctx.translate(px,py);
  ctx.rotate(angle);
  var grad=ctx.createRadialGradient(0,0,0,0,0,r);
  grad.addColorStop(0,'#fff2b8');
  grad.addColorStop(1,'#ffd166');
  ctx.fillStyle=grad;
  ctx.beginPath();
  ctx.arc(0,0,r,mouth*Math.PI,(2-mouth)*Math.PI);
  ctx.lineTo(0,0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawGhost(g){
  var px=g.x*CELL+CELL/2, py=g.y*CELL+CELL/2;
  var r=CELL*0.4;
  ctx.save();
  ctx.translate(px,py);
  var color=g.scared ? (powerTimer<1500 && Math.floor(powerTimer/200)%2===0 ? '#ffffff':'#4a6fe0') : g.color;
  ctx.fillStyle=color;
  ctx.beginPath();
  ctx.arc(0,-r*0.1,r,Math.PI,0);
  ctx.lineTo(r,r*0.7);
  var waves=3;
  for(var i=0;i<waves;i++){
    var wx=r - (2*r/waves)*(i+0.5);
    ctx.quadraticCurveTo(wx+ (r/waves)/2, r*0.4, wx - (r/waves)/2, r*0.7);
  }
  ctx.lineTo(-r,r*0.7);
  ctx.closePath();
  ctx.fill();

  if(!g.scared){
    ctx.fillStyle='#fff';
    ctx.beginPath(); ctx.arc(-r*0.35,-r*0.15,r*0.28,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.35,-r*0.15,r*0.28,0,Math.PI*2); ctx.fill();
    var ex=g.dir.x*r*0.12, ey=g.dir.y*r*0.12;
    ctx.fillStyle='#1a1d30';
    ctx.beginPath(); ctx.arc(-r*0.35+ex,-r*0.15+ey,r*0.13,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(r*0.35+ex,-r*0.15+ey,r*0.13,0,Math.PI*2); ctx.fill();
  } else {
    ctx.strokeStyle='#fff';
    ctx.lineWidth=1.6;
    ctx.beginPath(); ctx.arc(-r*0.32,-r*0.1,r*0.16,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(r*0.32,-r*0.1,r*0.16,0,Math.PI*2); ctx.stroke();
  }
  ctx.restore();
}

function draw(){
  var bg=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  bg.addColorStop(0,'#0a0c1a');
  bg.addColorStop(1,'#12142a');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  if(!started){
    ctx.fillStyle='rgba(255,255,255,.7)';
    ctx.textAlign='center';
    ctx.font='700 13px -apple-system,Arial,sans-serif';
    ctx.fillText('Tekan tombol',canvas.width/2,canvas.height/2);
    ctx.fillText('untuk mulai',canvas.width/2,canvas.height/2+16);
    ctx.textAlign='left';
    return;
  }

  drawMaze();

  for(var p=0;p<particles.length;p++){
    var pt=particles[p];
    ctx.save();
    ctx.globalAlpha=Math.max(0,pt.life);
    ctx.fillStyle=pt.color;
    ctx.beginPath();
    ctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  drawPac();
  for(var i=0;i<ghosts.length;i++){ drawGhost(ghosts[i]); }

  if(gameOver){
    ctx.fillStyle='rgba(10,10,20,.75)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    var grad2=ctx.createLinearGradient(0,canvas.height/2-24,0,canvas.height/2+10);
    if(win){ grad2.addColorStop(0,'#ffffff'); grad2.addColorStop(1,'#ffd166'); }
    else { grad2.addColorStop(0,'#ffffff'); grad2.addColorStop(1,'#ff7b7b'); }
    ctx.fillStyle=grad2;
    ctx.textAlign='center';
    ctx.font='800 17px -apple-system,Arial,sans-serif';
    ctx.fillText(win?'MENANG!':'GAME OVER',canvas.width/2,canvas.height/2-10);
    ctx.fillStyle='rgba(232,236,244,.8)';
    ctx.font='600 11px -apple-system,Arial,sans-serif';
    ctx.fillText('Tekan tombol untuk ulang',canvas.width/2,canvas.height/2+10);
    ctx.textAlign='left';
  }
}

function stepAnim(dt){
  mouthPhase+=dt*0.012;
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx; p.y+=p.vy;
    p.vx*=0.94; p.vy*=0.94;
    p.life-=p.decay;
    if(p.life<=0) particles.splice(i,1);
  }
  if(powerTimer>0){
    powerTimer-=dt;
    if(powerTimer<=0){
      powerTimer=0;
      for(var g=0;g<ghosts.length;g++){ ghosts[g].scared=false; }
    }
  }
  if(safeTimer>0){
    safeTimer-=dt;
    if(safeTimer<0) safeTimer=0;
  }
}

var rafId=null;
var FALLBACK_MS=50;
var last=0;

function loop(t){
  if(!last) last=t;
  var dt=t-last;
  last=t;

  if(started && !gameOver){
    moveAcc+=dt;
    if(moveAcc>=MOVE_TIME){
      moveAcc=0;
      tryMovePac();
    }
    ghostAcc+=dt;
    var speed = powerTimer>0 ? GHOST_MOVE_TIME*1.5 : GHOST_MOVE_TIME;
    if(ghostAcc>=speed){
      ghostAcc=0;
      moveGhosts();
    }
    stepAnim(dt);
  }

  draw();
  rafId=requestAnimationFrame(loop);
}

// Some embedded WebViews throttle or pause requestAnimationFrame when
// the surface is not considered visible like a normal browser tab.
// To keep the game ticking, and to make sure the board reflects the
// current state right after a button press, we force an immediate
// redraw inside every input handler and also run a setInterval as a
// fallback driver alongside rAF.
setInterval(function(){
  var now = (typeof performance!=='undefined' && performance.now) ? performance.now() : Date.now();
  if(!last){ last=now; return; }
  var dt=now-last;
  if(dt>=FALLBACK_MS){
    last=now;
    if(started && !gameOver){
      moveAcc+=dt;
      if(moveAcc>=MOVE_TIME){
        moveAcc=0;
        tryMovePac();
      }
      ghostAcc+=dt;
      var speed = powerTimer>0 ? GHOST_MOVE_TIME*1.5 : GHOST_MOVE_TIME;
      if(ghostAcc>=speed){
        ghostAcc=0;
        moveGhosts();
      }
      stepAnim(dt);
    }
    draw();
  }
},FALLBACK_MS);

function forceRedraw(){ draw(); }

function startOrMove(dx,dy){
  ensureAudio();
  if(!started||gameOver){ reset(); forceRedraw(); return; }
  setDirection(dx,dy);
  forceRedraw();
}

document.getElementById('btnUp').addEventListener('pointerdown',function(e){ e.preventDefault(); startOrMove(0,-1); });
document.getElementById('btnDown').addEventListener('pointerdown',function(e){ e.preventDefault(); startOrMove(0,1); });
document.getElementById('btnLeft').addEventListener('pointerdown',function(e){ e.preventDefault(); startOrMove(-1,0); });
document.getElementById('btnRight').addEventListener('pointerdown',function(e){ e.preventDefault(); startOrMove(1,0); });

document.addEventListener('keydown',function(e){
  if(e.code==='ArrowLeft'){ e.preventDefault(); startOrMove(-1,0); }
  else if(e.code==='ArrowRight'){ e.preventDefault(); startOrMove(1,0); }
  else if(e.code==='ArrowUp'){ e.preventDefault(); startOrMove(0,-1); }
  else if(e.code==='ArrowDown'){ e.preventDefault(); startOrMove(0,1); }
  else if(e.code==='Space'){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();} }
});

lastPacStart = buildGrid().pacStart;
draw();
rafId=requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-pacman-" + Date.now(),
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
                                    messageText: "LUNARIELLE • PACMAN"
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
                text: `❌ Gagal mengirim Pacman: ${err?.message || err}`
            });
        }
    }
};