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
// plugins/game/tetris.js

export default {
    command: 'tetris',
    alias: ['blok', 'tetrominoes'],
    category: 'interactive',
    description: '🧱 Main game Tetris klasik langsung di chat',
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
    radial-gradient(120% 140% at 15% -10%, rgba(121,192,255,.15), transparent 55%),
    radial-gradient(120% 140% at 100% 0%, rgba(199,146,234,.13), transparent 50%),
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
.eyebrow .dot{ width:5px; height:5px; border-radius:50%; background:linear-gradient(135deg,#79c0ff,#c792ea); box-shadow:0 0 8px rgba(121,192,255,.8); }
.title{ font-size:20px; font-weight:900; letter-spacing:-.3px; background:linear-gradient(135deg,#ffffff,#c9d6f0 60%,#79c0ff); -webkit-background-clip:text; background-clip:text; color:transparent; }

.stats{ display:flex; gap:16px; }
.statBox{ text-align:right; }
.statLabel{ font-size:9px; letter-spacing:1.8px; color:rgba(232,236,244,.42); font-weight:800; }
.statVal{ font-size:17px; font-weight:900; color:#7ee787; font-variant-numeric:tabular-nums; text-shadow:0 0 14px rgba(126,231,135,.35); transition:transform .16s cubic-bezier(.34,1.56,.64,1); }
.statVal.pop{ transform:scale(1.28); }
.statVal.lines{ color:#79c0ff; text-shadow:0 0 14px rgba(121,192,255,.35); }

.body{
  position:relative;
  display:flex;
  gap:10px;
  padding:0 14px 12px;
}

.stage{
  position:relative;
  flex:1;
  border-radius:12px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.1);
  box-shadow:0 8px 20px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.05);
}
canvas{ display:block; width:100%; height:auto; }

.comboFx{
  position:absolute; left:50%; top:38%; transform:translate(-50%,-50%) scale(.7);
  font-weight:900; font-size:20px; letter-spacing:.5px; text-align:center;
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

.side{
  width:76px;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.nextBox{
  border-radius:12px;
  background:linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.02));
  border:1px solid rgba(255,255,255,.09);
  padding:7px;
  box-shadow:0 6px 16px rgba(0,0,0,.3);
}
.nextLabel{ font-size:8px; letter-spacing:1.8px; color:rgba(232,236,244,.42); font-weight:800; text-align:center; margin-bottom:5px; }
#nextCanvas{ display:block; width:100%; height:auto; }

.footer{
  padding:0 18px 12px;
  text-align:center;
}
.status{ font-size:12px; font-weight:700; color:rgba(232,236,244,.55); letter-spacing:.3px; transition:color .2s ease; }
.status.over{ color:#ff7b7b; }
.status.good{ color:#8ff0b0; }

.shake{ animation:shakeFx .32s ease; }
@keyframes shakeFx{
  10%,90%{ transform:translateX(-1px); }
  20%,80%{ transform:translateX(2px); }
  30%,50%,70%{ transform:translateX(-4px); }
  40%,60%{ transform:translateX(4px); }
}

.pad{
  padding:0 14px 16px;
  display:grid;
  grid-template-columns:44px 44px 44px 44px;
  gap:7px;
  justify-content:center;
}
.padBtn{
  height:42px;
  border:none;
  border-radius:11px;
  background:linear-gradient(160deg, rgba(255,255,255,.1), rgba(255,255,255,.03));
  color:#e8ecf4;
  font-size:15px;
  font-weight:800;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 3px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.1);
  transition:transform .08s ease, box-shadow .08s ease, background .12s ease;
}
.padBtn:active{ transform:translateY(3px); box-shadow:0 0 0 rgba(0,0,0,.35); background:linear-gradient(160deg, rgba(121,192,255,.25), rgba(121,192,255,.08)); }
</style>

<div class="wrap">
  <div class="card" id="card">
    <div class="sheen"></div>

    <div class="header">
      <div class="brand">
        <div class="eyebrow"><span class="dot"></span>LUNARIELLE ARCADE</div>
        <div class="title">🧱 Tetris</div>
      </div>
      <div class="stats">
        <div class="statBox">
          <div class="statLabel">SKOR</div>
          <div class="statVal" id="score">0</div>
        </div>
        <div class="statBox">
          <div class="statLabel">BARIS</div>
          <div class="statVal lines" id="lines">0</div>
        </div>
      </div>
    </div>

    <div class="body">
      <div class="stage" id="stage">
        <canvas id="game" width="200" height="400"></canvas>
        <div class="comboFx" id="comboFx"></div>
      </div>
      <div class="side">
        <div class="nextBox">
          <div class="nextLabel">BERIKUTNYA</div>
          <canvas id="nextCanvas" width="64" height="64"></canvas>
        </div>
      </div>
    </div>

    <div class="footer">
      <span class="status" id="status">Tekan tombol untuk mulai</span>
    </div>

    <div class="pad">
      <button class="padBtn" id="btnLeft">◀</button>
      <button class="padBtn" id="btnRotate">⟳</button>
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
var nextCanvas=document.getElementById('nextCanvas');
var nctx=nextCanvas.getContext('2d');
var scoreEl=document.getElementById('score');
var linesEl=document.getElementById('lines');
var statusEl=document.getElementById('status');
var comboFxEl=document.getElementById('comboFx');
var cardEl=document.getElementById('card');

var COLS=10, ROWS=20;
var CELL=canvas.width/COLS;

var PALETTES={
  I:{a:'#4dd0e1',b:'#1f9fb3'}, O:{a:'#ffd166',b:'#e0a52f'}, T:{a:'#c792ea',b:'#9a5fd0'},
  S:{a:'#7ee787',b:'#3fb85a'}, Z:{a:'#ff7b7b',b:'#e04b4b'}, J:{a:'#79c0ff',b:'#4a8ff0'}, L:{a:'#ffa657',b:'#f07a2e'}
};

var SHAPES={
  I:[[0,1],[1,1],[2,1],[3,1]],
  O:[[1,0],[2,0],[1,1],[2,1]],
  T:[[1,0],[0,1],[1,1],[2,1]],
  S:[[1,0],[2,0],[0,1],[1,1]],
  Z:[[0,0],[1,0],[1,1],[2,1]],
  J:[[0,0],[0,1],[1,1],[2,1]],
  L:[[2,0],[0,1],[1,1],[2,1]]
};

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
  move:function(){ beep(220,0.03,{type:'square',vol:0.05}); },
  rotate:function(){ beep(440,0.05,{type:'triangle',vol:0.09,slideTo:560}); },
  softdrop:function(){ noiseBurst(0.03,{freq:800,freqTo:300,vol:0.06,q:1}); },
  lock:function(){
    noiseBurst(0.05,{freq:1400,freqTo:250,vol:0.13,q:1.1});
    beep(180,0.08,{type:'sine',vol:0.15,slideTo:90});
  },
  invalid:function(){ beep(140,0.08,{type:'square',vol:0.06,slideTo:100}); },
  clear:function(n){
    var base=520;
    var count=Math.min(n,4);
    for(var i=0;i<count;i++){
      (function(i){
        setTimeout(function(){
          beep(base+i*160,0.15,{type:'triangle',vol:0.16,slideTo:base+i*160+260});
          noiseBurst(0.08,{freq:2400+i*400,freqTo:4800+i*400,vol:0.05,q:2.5});
        },i*55);
      })(i);
    }
    if(count>=4){
      setTimeout(function(){
        beep(1400,0.3,{type:'sine',vol:0.1,slideTo:2400});
        beep(1760,0.32,{type:'sine',vol:0.07,slideTo:2800,delay:0.04});
      },count*55+40);
    }
  },
  gameover:function(){
    beep(300,0.2,{type:'sawtooth',vol:0.12,slideTo:80});
    noiseBurst(0.3,{freq:600,freqTo:120,vol:0.08,filterType:'lowpass'});
    setTimeout(function(){ beep(220,0.24,{type:'sawtooth',vol:0.1,slideTo:60}); },140);
  },
  start:function(){ beep(440,0.05,{type:'sine',vol:0.09}); setTimeout(function(){ beep(660,0.08,{type:'sine',vol:0.1}); },70); }
};

var grid, current, next, score=0, lines=0, gameOver=false, started=false;
var dropAcc=0, DROP_TIME=650, last=0;
var particles=[];
var clearingRows=[];
var lockFlashPieces=[];

function newGrid(){
  var g=[];
  for(var y=0;y<ROWS;y++){ g.push(new Array(COLS).fill(null)); }
  return g;
}

function randPiece(){
  var keys=Object.keys(SHAPES);
  var k=keys[Math.floor(Math.random()*keys.length)];
  var pal=PALETTES[k];
  return { type:k, cells:SHAPES[k].map(function(c){return [c[0],c[1]];}), x:3, y:0, color:pal.a, colorB:pal.b };
}

function reset(){
  grid=newGrid();
  current=randPiece();
  next=randPiece();
  score=0; lines=0; gameOver=false; started=true;
  dropAcc=0; DROP_TIME=650;
  particles=[];
  clearingRows=[];
  scoreEl.textContent='0';
  linesEl.textContent='0';
  statusEl.textContent='Bermain...';
  statusEl.className='status';
  sfx.start();
}

function cellsAt(piece,px,py,cells){
  return (cells||piece.cells).map(function(c){ return [c[0]+px, c[1]+py]; });
}

function collides(cells){
  for(var i=0;i<cells.length;i++){
    var x=cells[i][0], y=cells[i][1];
    if(x<0||x>=COLS||y>=ROWS) return true;
    if(y>=0 && grid[y][x]) return true;
  }
  return false;
}

function ghostY(){
  var gy=current.y;
  while(!collides(cellsAt(current,current.x,gy+1))){ gy++; }
  return gy;
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

function lockPiece(){
  var cells=cellsAt(current,current.x,current.y);
  for(var i=0;i<cells.length;i++){
    var x=cells[i][0], y=cells[i][1];
    if(y<0){ endGame(); return; }
    grid[y][x]={c1:current.color,c2:current.colorB,pop:0.4};
  }
  sfx.lock();
  clearLines();
  current=next;
  next=randPiece();
  if(collides(cellsAt(current,current.x,current.y))){
    endGame();
  }
}

function clearLines(){
  var rowsToClear=[];
  for(var y=ROWS-1;y>=0;y--){
    var full=true;
    for(var x=0;x<COLS;x++){ if(!grid[y][x]){ full=false; break; } }
    if(full) rowsToClear.push(y);
  }
  var cleared=rowsToClear.length;
  if(cleared>0){
    for(var r=0;r<rowsToClear.length;r++){
      var yy=rowsToClear[r];
      for(var x2=0;x2<COLS;x2++){
        var cell=grid[yy][x2];
        if(cell) spawnParticles(x2,yy,cell.c1);
      }
    }
    for(var y2=ROWS-1;y2>=0;y2--){
      var full2=true;
      for(var x3=0;x3<COLS;x3++){ if(!grid[y2][x3]){ full2=false; break; } }
      if(full2){
        grid.splice(y2,1);
        grid.unshift(new Array(COLS).fill(null));
        y2++;
      }
    }
    var points=[0,100,300,500,800][cleared]||1000;
    score+=points;
    lines+=cleared;
    scoreEl.textContent=String(score);
    linesEl.textContent=String(lines);
    bumpStat(scoreEl);
    bumpStat(linesEl);
    DROP_TIME=Math.max(140,650-lines*18);
    statusEl.textContent = cleared>=4 ? 'TETRIS! +'+points : 'Baris bersih! +'+points;
    statusEl.className='status good';
    showCombo(cleared>=4 ? 'TETRIS!' : 'x'+cleared+' BARIS');
    sfx.clear(cleared);
  }
}

function move(dx,dy){
  if(!started||gameOver) return false;
  var cells=cellsAt(current,current.x+dx,current.y+dy);
  if(!collides(cells)){
    current.x+=dx;
    current.y+=dy;
    if(dx!==0) sfx.move();
    return true;
  }
  if(dx!==0) sfx.invalid();
  return false;
}

function rotate(){
  if(!started||gameOver) return;
  if(current.type==='O') return;
  var pivot=current.cells[1];
  var rotated=current.cells.map(function(c){
    var rx=c[0]-pivot[0], ry=c[1]-pivot[1];
    return [pivot[0]-ry, pivot[1]+rx];
  });
  var cells=cellsAt(current,current.x,current.y,rotated);
  if(!collides(cells)){
    current.cells=rotated;
    sfx.rotate();
  } else {
    var kicked=cellsAt(current,current.x-1,current.y,rotated);
    if(!collides(kicked)){ current.x-=1; current.cells=rotated; sfx.rotate(); return; }
    kicked=cellsAt(current,current.x+1,current.y,rotated);
    if(!collides(kicked)){ current.x+=1; current.cells=rotated; sfx.rotate(); return; }
    sfx.invalid();
  }
}

function softDrop(){
  if(!started||gameOver){ reset(); return; }
  if(!move(0,1)){
    lockPiece();
  } else {
    sfx.softdrop();
  }
  dropAcc=0;
}

function endGame(){
  gameOver=true;
  statusEl.textContent='Game Over - tekan tombol untuk ulang';
  statusEl.className='status over';
  sfx.gameover();
  cardEl.classList.remove('shake');
  void cardEl.offsetWidth;
  cardEl.classList.add('shake');
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

function drawCell(c,x,y,size,cell,scale){
  scale = scale==null?1:scale;
  var pad=1.3;
  var s=size-pad*2;
  var cx=x+size/2, cy=y+size/2;
  c.save();
  c.translate(cx,cy);
  c.scale(scale,scale);
  c.translate(-cx,-cy);

  var grad=c.createLinearGradient(x,y,x+size,y+size);
  grad.addColorStop(0,cell.c1||cell);
  grad.addColorStop(1,cell.c2||cell);
  c.fillStyle=grad;
  roundRect(c,x+pad,y+pad,s,s,size*0.2);
  c.fill();

  c.fillStyle='rgba(255,255,255,.28)';
  roundRect(c,x+pad+1.5,y+pad+1.5,s-3,Math.max(2,s*0.2),size*0.12);
  c.fill();

  c.strokeStyle='rgba(0,0,0,.2)';
  c.lineWidth=1;
  roundRect(c,x+pad,y+pad,s,s,size*0.2);
  c.stroke();
  c.restore();
}

function drawGhostCell(c,x,y,size,color){
  var pad=2;
  c.save();
  c.globalAlpha=0.22;
  c.strokeStyle=color;
  c.lineWidth=1.6;
  roundRect(c,x+pad,y+pad,size-pad*2,size-pad*2,size*0.2);
  c.stroke();
  c.restore();
}

function stepAnim(){
  for(var y=0;y<ROWS;y++){
    for(var x=0;x<COLS;x++){
      var cell=grid[y][x];
      if(cell && cell.pop!=null && cell.pop<1){
        cell.pop=Math.min(1,cell.pop+0.16);
      }
    }
  }
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx; p.y+=p.vy;
    p.vx*=0.94; p.vy*=0.94;
    p.life-=p.decay;
    if(p.life<=0) particles.splice(i,1);
  }
}

function draw(){
  var bg=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
  bg.addColorStop(0,'#0d0f1a');
  bg.addColorStop(1,'#12142a');
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle='rgba(255,255,255,.045)';
  for(var gx=0;gx<=COLS;gx++){
    ctx.beginPath(); ctx.moveTo(gx*CELL,0); ctx.lineTo(gx*CELL,canvas.height); ctx.stroke();
  }
  for(var gy=0;gy<=ROWS;gy++){
    ctx.beginPath(); ctx.moveTo(0,gy*CELL); ctx.lineTo(canvas.width,gy*CELL); ctx.stroke();
  }

  if(!started){
    ctx.fillStyle='rgba(255,255,255,.7)';
    ctx.textAlign='center';
    ctx.font='700 13px -apple-system,Arial,sans-serif';
    ctx.fillText('Tekan tombol',canvas.width/2,canvas.height/2);
    ctx.fillText('untuk mulai',canvas.width/2,canvas.height/2+16);
    ctx.textAlign='left';
    return;
  }

  for(var y=0;y<ROWS;y++){
    for(var x=0;x<COLS;x++){
      if(grid[y][x]){
        var cell=grid[y][x];
        var sc=cell.pop!=null?cell.pop:1;
        drawCell(ctx,x*CELL,y*CELL,CELL,cell,sc);
      }
    }
  }

  if(!gameOver){
    var gy2=ghostY();
    if(gy2!==current.y){
      var ghostCells=cellsAt(current,current.x,gy2);
      for(var gi=0;gi<ghostCells.length;gi++){
        var gcx=ghostCells[gi][0], gcy=ghostCells[gi][1];
        if(gcy>=0) drawGhostCell(ctx,gcx*CELL,gcy*CELL,CELL,current.color);
      }
    }
  }

  var cells=cellsAt(current,current.x,current.y);
  for(var i=0;i<cells.length;i++){
    var cx=cells[i][0], cy=cells[i][1];
    if(cy>=0) drawCell(ctx,cx*CELL,cy*CELL,CELL,{c1:current.color,c2:current.colorB});
  }

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

  if(gameOver){
    ctx.fillStyle='rgba(10,10,20,.75)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    var grad2=ctx.createLinearGradient(0,canvas.height/2-24,0,canvas.height/2+10);
    grad2.addColorStop(0,'#ffffff');
    grad2.addColorStop(1,'#79c0ff');
    ctx.fillStyle=grad2;
    ctx.textAlign='center';
    ctx.font='800 17px -apple-system,Arial,sans-serif';
    ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-10);
    ctx.fillStyle='rgba(232,236,244,.8)';
    ctx.font='600 11px -apple-system,Arial,sans-serif';
    ctx.fillText('Tekan tombol untuk ulang',canvas.width/2,canvas.height/2+10);
    ctx.textAlign='left';
  }
}

function drawNext(){
  nctx.fillStyle='#0d0f1a';
  nctx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
  if(!started) return;
  var size=14;
  var offX=(nextCanvas.width-4*size)/2;
  var offY=(nextCanvas.height-2*size)/2;
  for(var i=0;i<next.cells.length;i++){
    var c=next.cells[i];
    drawCell(nctx,offX+c[0]*size,offY+c[1]*size,size,{c1:next.color,c2:next.colorB});
  }
}

var rafId=null;
var FALLBACK_MS=50;

function loop(t){
  if(!last) last=t;
  var dt=t-last;
  last=t;

  if(started && !gameOver){
    dropAcc+=dt;
    if(dropAcc>=DROP_TIME){
      dropAcc=0;
      if(!move(0,1)){ lockPiece(); }
    }
  }

  stepAnim();
  draw();
  drawNext();
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
      dropAcc+=dt;
      if(dropAcc>=DROP_TIME){
        dropAcc=0;
        if(!move(0,1)){ lockPiece(); }
      }
    }
    stepAnim();
    draw();
    drawNext();
  }
},FALLBACK_MS);

function forceRedraw(){
  draw();
  drawNext();
}

document.getElementById('btnLeft').addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();return;} move(-1,0); forceRedraw(); });
document.getElementById('btnRight').addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();return;} move(1,0); forceRedraw(); });
document.getElementById('btnRotate').addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();return;} rotate(); forceRedraw(); });
document.getElementById('btnDown').addEventListener('pointerdown',function(e){ e.preventDefault(); ensureAudio(); softDrop(); forceRedraw(); });

document.addEventListener('keydown',function(e){
  if(e.code==='ArrowLeft'){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();return;} move(-1,0); forceRedraw(); }
  else if(e.code==='ArrowRight'){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();return;} move(1,0); forceRedraw(); }
  else if(e.code==='ArrowUp'){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();return;} rotate(); forceRedraw(); }
  else if(e.code==='ArrowDown'){ e.preventDefault(); ensureAudio(); softDrop(); forceRedraw(); }
  else if(e.code==='Space'){ e.preventDefault(); ensureAudio(); if(!started||gameOver){reset();forceRedraw();} }
});

draw();
drawNext();
rafId=requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-tetris-" + Date.now(),
            sections: [
                {
                    view_model: {
                        primitive: {
                            __typename: "GenAIaeacdsnwHtmlPrimitive",
                            payload: html,
                            trusted_sources: []
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
                                    messageText: "LUNARIELLE • TETRIS"
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
                text: `❌ Gagal mengirim Tetris: ${err?.message || err}`
            });
        }
    }
};
