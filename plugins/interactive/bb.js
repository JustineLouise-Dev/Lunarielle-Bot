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
// plugins/game/blockblast.js

export default {
    command: 'blockblast',
    alias: ['blast', 'blokblast'],
    category: 'interactive',
    description: '🟦 Main game Block Blast - susun blok, penuhi baris!',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        const html = `<style>
*{ -webkit-tap-highlight-color:transparent; user-select:none; box-sizing:border-box; }
html,body{ margin:0; background:transparent; color:#eef1f7; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:26px;
  overflow:hidden;
  background:
    radial-gradient(120% 140% at 15% -10%, rgba(142,203,255,.16), transparent 55%),
    radial-gradient(120% 140% at 100% 0%, rgba(199,146,234,.14), transparent 50%),
    linear-gradient(180deg,#1c2036 0%,#14172a 55%,#101223 100%);
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
.eyebrow{ font-size:10px; letter-spacing:3px; color:rgba(238,241,247,.42); font-weight:800; display:flex; align-items:center; gap:5px; }
.eyebrow .dot{ width:5px; height:5px; border-radius:50%; background:linear-gradient(135deg,#8ecbff,#c792ea); box-shadow:0 0 8px rgba(142,203,255,.8); }
.title{ font-size:21px; font-weight:900; letter-spacing:-.3px; background:linear-gradient(135deg,#ffffff,#c9d6f0 60%,#8ecbff); -webkit-background-clip:text; background-clip:text; color:transparent; }

.scoreBox{ text-align:right; }
.scoreNow{ font-size:26px; font-weight:900; color:#8ecbff; font-variant-numeric:tabular-nums; text-shadow:0 0 18px rgba(142,203,255,.45); transition:transform .18s cubic-bezier(.34,1.56,.64,1); }
.scoreNow.pop{ transform:scale(1.28); }
.scoreBest{ font-size:10px; color:rgba(238,241,247,.45); margin-top:2px; letter-spacing:.3px; }
.scoreBest b{ color:rgba(255,209,102,.9); }

.stage{ padding:2px 16px; position:relative; }
.boardShell{
  position:relative; border-radius:16px; padding:6px;
  background:linear-gradient(160deg, rgba(255,255,255,.05), rgba(255,255,255,0) 60%);
  box-shadow:0 10px 26px rgba(0,0,0,.4), inset 0 0 0 1px rgba(255,255,255,.06);
}
canvas#board{ display:block; width:100%; height:auto; border-radius:11px; }

.comboFx{
  position:absolute; left:50%; top:44%; transform:translate(-50%,-50%) scale(.7);
  font-weight:900; font-size:26px; letter-spacing:.5px;
  background:linear-gradient(135deg,#ffe17d,#ff9f7d 55%,#ff7bd0);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  text-shadow:0 0 22px rgba(255,180,120,.35);
  opacity:0; pointer-events:none; white-space:nowrap;
}
.comboFx.show{ animation:comboPop .75s cubic-bezier(.2,.9,.25,1); }
@keyframes comboPop{
  0%{ opacity:0; transform:translate(-50%,-50%) scale(.5); }
  18%{ opacity:1; transform:translate(-50%,-58%) scale(1.12); }
  38%{ transform:translate(-50%,-58%) scale(1); }
  100%{ opacity:0; transform:translate(-50%,-80%) scale(1.05); }
}

.trayLabel{
  padding:14px 18px 5px;
  font-size:9.5px;
  letter-spacing:2px;
  color:rgba(238,241,247,.4);
  font-weight:800;
  text-align:center;
}

.tray{
  display:flex;
  justify-content:center;
  gap:10px;
  padding:2px 16px 18px;
}

.trayPiece{
  position:relative;
  width:76px;
  height:76px;
  border-radius:14px;
  background:linear-gradient(160deg, rgba(255,255,255,.055), rgba(255,255,255,.02));
  border:1.5px solid rgba(255,255,255,.09);
  display:flex;
  align-items:center;
  justify-content:center;
  transition:transform .16s cubic-bezier(.34,1.56,.64,1), border-color .18s ease, box-shadow .18s ease, opacity .25s ease;
  animation:pieceIn .35s cubic-bezier(.2,.9,.25,1) backwards;
}
.trayPiece:nth-child(1){ animation-delay:.02s; }
.trayPiece:nth-child(2){ animation-delay:.08s; }
.trayPiece:nth-child(3){ animation-delay:.14s; }
@keyframes pieceIn{ from{ opacity:0; transform:translateY(10px) scale(.85);} to{ opacity:1; transform:none; } }

.trayPiece canvas{ display:block; }
.trayPiece.selected{
  border-color:rgba(142,203,255,.85);
  background:linear-gradient(160deg, rgba(142,203,255,.16), rgba(142,203,255,.04));
  transform:scale(1.08) translateY(-2px);
  box-shadow:0 8px 20px rgba(142,203,255,.25), 0 0 0 1px rgba(142,203,255,.3) inset;
}
.trayPiece.used{ opacity:0; transform:scale(.4) rotate(12deg); pointer-events:none; }

.footer{
  padding:0 18px 18px;
  text-align:center;
}
.status{ font-size:12px; font-weight:700; color:rgba(238,241,247,.55); letter-spacing:.3px; transition:color .2s ease; }
.status.over{ color:#ff7b7b; }
.status.good{ color:#8ff0b0; }

.shake{ animation:shakeFx .32s ease; }
@keyframes shakeFx{
  10%,90%{ transform:translateX(-1px); }
  20%,80%{ transform:translateX(2px); }
  30%,50%,70%{ transform:translateX(-4px); }
  40%,60%{ transform:translateX(4px); }
}

.pulseRing{
  position:absolute; border-radius:50%; pointer-events:none;
  border:2px solid rgba(255,255,255,.55);
  transform:translate(-50%,-50%) scale(0);
  opacity:.9;
  animation:ringPulse .5s ease-out forwards;
}
@keyframes ringPulse{ to{ transform:translate(-50%,-50%) scale(2.4); opacity:0; } }
</style>

<div class="wrap">
  <div class="card" id="card">
    <div class="sheen"></div>

    <div class="header">
      <div class="brand">
        <div class="eyebrow"><span class="dot"></span>LUNARIELLE ARCADE</div>
        <div class="title">🟦 Block Blast</div>
      </div>
      <div class="scoreBox">
        <div class="scoreNow" id="score">0</div>
        <div class="scoreBest">BEST <b id="best">0</b></div>
      </div>
    </div>

    <div class="stage">
      <div class="boardShell">
        <canvas id="board" width="320" height="320"></canvas>
        <div class="comboFx" id="comboFx"></div>
      </div>
    </div>

    <div class="trayLabel">PILIH BLOK, LALU KETUK PAPAN</div>
    <div class="tray" id="tray"></div>

    <div class="footer">
      <span class="status" id="status">Ketuk blok di bawah untuk memilih</span>
    </div>

  </div>
</div>

<script>
(function(){
"use strict";
var boardCanvas=document.getElementById('board');
var bctx=boardCanvas.getContext('2d');
var trayEl=document.getElementById('tray');
var scoreEl=document.getElementById('score');
var bestEl=document.getElementById('best');
var statusEl=document.getElementById('status');
var comboFxEl=document.getElementById('comboFx');
var cardEl=document.getElementById('card');
var boardShellEl=document.querySelector('.boardShell');

var SIZE=8;
var CELL=boardCanvas.width/SIZE;

var PALETTES=[
  {a:'#8ecbff',b:'#4f8ff0'},
  {a:'#ffd166',b:'#f2a53c'},
  {a:'#ff8fa3',b:'#ef5c78'},
  {a:'#7ee787',b:'#3fb85a'},
  {a:'#c792ea',b:'#9a5fd0'},
  {a:'#ffa657',b:'#f07a2e'}
];

var SHAPES=[
  [[0,0]],
  [[0,0],[1,0]],
  [[0,0],[0,1]],
  [[0,0],[1,0],[2,0]],
  [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[1,1]],
  [[1,0],[0,1],[1,1],[2,1]],
  [[0,0],[0,1],[0,2],[1,2]],
  [[0,0],[1,0],[1,1],[1,2]],
  [[0,0],[1,0],[2,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0],[3,0]],
  [[0,0],[0,1],[0,2],[0,3]],
  [[0,0],[1,0],[0,1],[1,1],[2,1]],
];

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
  var ctx=ensureAudio();
  if(!ctx) return;
  opts=opts||{};
  var t0=ctx.currentTime+(opts.delay||0);
  var osc=ctx.createOscillator();
  var gain=ctx.createGain();
  osc.type=opts.type||'sine';
  osc.frequency.setValueAtTime(freq,t0);
  if(opts.slideTo){ osc.frequency.exponentialRampToValueAtTime(Math.max(1,opts.slideTo), t0+dur); }
  var peak=opts.vol!=null?opts.vol:0.18;
  gain.gain.setValueAtTime(0.0001,t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0+0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t0); osc.stop(t0+dur+0.02);
}

// short burst of filtered noise — gives "thump"/"click"/"whoosh" texture that a pure
// oscillator can't, layered under the tonal beeps for a punchier, more premium feel
var noiseBuffer=null;
function getNoiseBuffer(ctx){
  if(noiseBuffer && noiseBuffer._ctx===ctx) return noiseBuffer;
  var len=ctx.sampleRate*1;
  var buf=ctx.createBuffer(1,len,ctx.sampleRate);
  var data=buf.getChannelData(0);
  for(var i=0;i<len;i++) data[i]=Math.random()*2-1;
  buf._ctx=ctx;
  noiseBuffer=buf;
  return buf;
}
function noiseBurst(dur, opts){
  var ctx=ensureAudio();
  if(!ctx) return;
  opts=opts||{};
  var t0=ctx.currentTime+(opts.delay||0);
  var src=ctx.createBufferSource();
  src.buffer=getNoiseBuffer(ctx);
  var filt=ctx.createBiquadFilter();
  filt.type=opts.filterType||'bandpass';
  filt.frequency.setValueAtTime(opts.freq||1200,t0);
  if(opts.freqTo){ filt.frequency.exponentialRampToValueAtTime(Math.max(1,opts.freqTo), t0+dur); }
  filt.Q.value=opts.q!=null?opts.q:1;
  var gain=ctx.createGain();
  var peak=opts.vol!=null?opts.vol:0.15;
  gain.gain.setValueAtTime(0.0001,t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0+0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
  src.start(t0); src.stop(t0+dur+0.02);
}

var sfx={
  select:function(){
    beep(560,0.06,{type:'triangle',vol:0.11,slideTo:700});
    noiseBurst(0.03,{freq:2200,vol:0.05,q:2});
  },
  // satisfying, punchy "thock" when a block lands: percussive noise click (impact)
  // layered with a quick pitched thump (body) and a tiny bright tick (snap)
  place:function(){
    noiseBurst(0.045,{freq:1600,freqTo:300,vol:0.14,q:1.1,filterType:'bandpass'});
    beep(220,0.09,{type:'sine',vol:0.20,slideTo:110});
    beep(880,0.03,{type:'triangle',vol:0.05,slideTo:1200,delay:0.005});
  },
  invalid:function(){
    beep(150,0.13,{type:'square',vol:0.10,slideTo:85});
    noiseBurst(0.07,{freq:400,freqTo:180,vol:0.07,filterType:'lowpass',q:0.7});
  },
  // line/row clear: rising percussive sweep per line, plus a shimmering high tail on combos
  clear:function(n){
    var base=520;
    var count=Math.min(n,4);
    for(var i=0;i<count;i++){
      (function(i){
        setTimeout(function(){
          beep(base+i*140,0.16,{type:'triangle',vol:0.16,slideTo:base+i*140+260});
          noiseBurst(0.09,{freq:2500+i*400,freqTo:5000+i*400,vol:0.05,q:2.5});
        },i*60);
      })(i);
    }
    if(count>1){
      setTimeout(function(){
        beep(1400,0.28,{type:'sine',vol:0.09,slideTo:2200,delay:0});
        beep(1760,0.3,{type:'sine',vol:0.06,slideTo:2600,delay:0.03});
      },count*60+40);
    }
  },
  refill:function(){
    beep(700,0.07,{type:'sine',vol:0.07,slideTo:950});
    beep(1050,0.09,{type:'sine',vol:0.05,slideTo:1300,delay:0.05});
  },
  gameover:function(){
    beep(300,0.22,{type:'sawtooth',vol:0.12,slideTo:80});
    noiseBurst(0.3,{freq:600,freqTo:120,vol:0.08,filterType:'lowpass'});
    setTimeout(function(){ beep(220,0.25,{type:'sawtooth',vol:0.1,slideTo:60}); },140);
  }
};

var board, score=0, best=0, gameOver=false, tray=[], selectedIdx=-1;
var particles=[];
var animRunning=false;
var hoverCell=null;

try{ best=Number(localStorage.getItem('lunarielle_blast_best')||0); }catch(e){}
bestEl.textContent=String(best);

function emptyBoard(){
  var b=[];
  for(var y=0;y<SIZE;y++) b.push(new Array(SIZE).fill(null));
  return b;
}

function randShape(){
  var s=SHAPES[Math.floor(Math.random()*SHAPES.length)];
  var pal=PALETTES[Math.floor(Math.random()*PALETTES.length)];
  return { cells:s.map(function(c){return [c[0],c[1]];}), color:pal.a, colorB:pal.b };
}

function refillTray(){
  tray=[randShape(),randShape(),randShape()];
  selectedIdx=-1;
  renderTray();
  sfx.refill();
}

function shapeSize(shape){
  var maxX=0,maxY=0;
  for(var i=0;i<shape.cells.length;i++){
    maxX=Math.max(maxX,shape.cells[i][0]);
    maxY=Math.max(maxY,shape.cells[i][1]);
  }
  return { w:maxX+1, h:maxY+1 };
}

function canPlace(shape,ox,oy){
  for(var i=0;i<shape.cells.length;i++){
    var x=ox+shape.cells[i][0], y=oy+shape.cells[i][1];
    if(x<0||x>=SIZE||y<0||y>=SIZE) return false;
    if(board[y][x]) return false;
  }
  return true;
}

function anyPlacementExists(shape){
  for(var y=0;y<SIZE;y++){
    for(var x=0;x<SIZE;x++){
      if(canPlace(shape,x,y)) return true;
    }
  }
  return false;
}

function spawnParticles(cx,cy,color){
  for(var i=0;i<10;i++){
    var ang=Math.random()*Math.PI*2;
    var spd=1.4+Math.random()*2.6;
    particles.push({
      x:cx,y:cy,
      vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
      life:1, decay:0.028+Math.random()*0.02,
      size:2+Math.random()*3,
      color:color
    });
  }
}

function pulseAt(px,py,color){
  var ring=document.createElement('div');
  ring.className='pulseRing';
  var rect=boardCanvas.getBoundingClientRect();
  var scaleX=rect.width/boardCanvas.width;
  var scaleY=rect.height/boardCanvas.height;
  ring.style.left=(px*scaleX)+'px';
  ring.style.top=(py*scaleY)+'px';
  ring.style.width='14px'; ring.style.height='14px';
  ring.style.borderColor=color;
  boardShellEl.appendChild(ring);
  setTimeout(function(){ ring.remove(); },520);
}

function bumpScore(){
  scoreEl.classList.remove('pop');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('pop');
  setTimeout(function(){ scoreEl.classList.remove('pop'); },200);
}

function showCombo(text){
  comboFxEl.textContent=text;
  comboFxEl.classList.remove('show');
  void comboFxEl.offsetWidth;
  comboFxEl.classList.add('show');
}

function placeShape(shape,ox,oy){
  for(var i=0;i<shape.cells.length;i++){
    var x=ox+shape.cells[i][0], y=oy+shape.cells[i][1];
    board[y][x]={c1:shape.color,c2:shape.colorB,pop:0.35};
    spawnParticles(x*CELL+CELL/2, y*CELL+CELL/2, shape.color);
  }
  score+=shape.cells.length;
  bumpScore();
  scoreEl.textContent=String(score);
  sfx.place();
  clearFull();
}

function clearFull(){
  var rowsToClear=[], colsToClear=[];
  for(var y=0;y<SIZE;y++){
    var full=true;
    for(var x=0;x<SIZE;x++){ if(!board[y][x]){ full=false; break; } }
    if(full) rowsToClear.push(y);
  }
  for(var x=0;x<SIZE;x++){
    var fullC=true;
    for(var y=0;y<SIZE;y++){ if(!board[y][x]){ fullC=false; break; } }
    if(fullC) colsToClear.push(x);
  }
  var cleared=rowsToClear.length+colsToClear.length;
  if(cleared>0){
    for(var i=0;i<rowsToClear.length;i++){
      for(var x2=0;x2<SIZE;x2++){
        var cellY=rowsToClear[i];
        if(board[cellY][x2]) spawnParticles(x2*CELL+CELL/2, cellY*CELL+CELL/2, board[cellY][x2].c1);
        board[cellY][x2]=null;
      }
    }
    for(var j=0;j<colsToClear.length;j++){
      for(var y2=0;y2<SIZE;y2++){
        var cellX=colsToClear[j];
        if(board[y2][cellX]) spawnParticles(cellX*CELL+CELL/2, y2*CELL+CELL/2, board[y2][cellX].c1);
        board[y2][cellX]=null;
      }
    }
    var gained = cleared*10*cleared;
    score += gained;
    bumpScore();
    scoreEl.textContent=String(score);
    statusEl.textContent = cleared>1 ? 'Combo x'+cleared+'! +'+gained : '+'+gained;
    statusEl.className='status good';
    showCombo(cleared>1 ? 'COMBO x'+cleared : '+'+gained);
    sfx.clear(cleared);
  }
}

function checkGameOver(){
  for(var i=0;i<tray.length;i++){
    if(!tray[i].used && anyPlacementExists(tray[i])) return false;
  }
  return true;
}

function reset(){
  board=emptyBoard();
  score=0; gameOver=false;
  scoreEl.textContent='0';
  statusEl.textContent='Ketuk blok, lalu ketuk papan';
  statusEl.className='status';
  particles=[];
  refillTray();
  startLoop();
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

function drawCellBlock(c,x,y,size,cell,scale){
  scale = scale==null?1:scale;
  var pad=1.5;
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
  roundRect(c,x+pad,y+pad,s,s,size*0.22);
  c.fill();

  c.fillStyle='rgba(255,255,255,.32)';
  roundRect(c,x+pad+2,y+pad+2,s-4,Math.max(2,s*0.22),size*0.14);
  c.fill();

  c.strokeStyle='rgba(0,0,0,.18)';
  c.lineWidth=1;
  roundRect(c,x+pad,y+pad,s,s,size*0.22);
  c.stroke();
  c.restore();
}

function drawGhost(c,x,y,size,color){
  var pad=2;
  c.save();
  c.globalAlpha=0.28;
  c.fillStyle=color;
  roundRect(c,x+pad,y+pad,size-pad*2,size-pad*2,size*0.22);
  c.fill();
  c.restore();
}

function drawBoard(){
  var w=boardCanvas.width, h=boardCanvas.height;
  var bg=bctx.createLinearGradient(0,0,w,h);
  bg.addColorStop(0,'#0f1120');
  bg.addColorStop(1,'#151830');
  bctx.fillStyle=bg;
  bctx.fillRect(0,0,w,h);

  bctx.strokeStyle='rgba(255,255,255,.055)';
  for(var i=0;i<=SIZE;i++){
    var lw=(i%4===0)?1.4:0.6;
    bctx.lineWidth=lw;
    bctx.beginPath(); bctx.moveTo(i*CELL,0); bctx.lineTo(i*CELL,h); bctx.stroke();
    bctx.beginPath(); bctx.moveTo(0,i*CELL); bctx.lineTo(w,i*CELL); bctx.stroke();
  }

  for(var y=0;y<SIZE;y++){
    for(var x=0;x<SIZE;x++){
      var cell=board[y][x];
      if(cell){
        var sc = cell.pop!=null ? cell.pop : 1;
        drawCellBlock(bctx,x*CELL,y*CELL,CELL,cell,sc);
      }
    }
  }

  if(selectedIdx>=0 && !gameOver){
    var shape=tray[selectedIdx];
    if(shape && !shape.used && hoverCell){
      for(var k=0;k<shape.cells.length;k++){
        var gx=hoverCell.x+shape.cells[k][0], gy=hoverCell.y+shape.cells[k][1];
        if(gx>=0&&gx<SIZE&&gy>=0&&gy<SIZE){
          var ok=canPlace(shape,hoverCell.x,hoverCell.y);
          drawGhost(bctx,gx*CELL,gy*CELL,CELL, ok?shape.color:'#ff5c5c');
        }
      }
    }
  }

  for(var p=0;p<particles.length;p++){
    var pt=particles[p];
    bctx.save();
    bctx.globalAlpha=Math.max(0,pt.life);
    bctx.fillStyle=pt.color;
    bctx.beginPath();
    bctx.arc(pt.x,pt.y,pt.size,0,Math.PI*2);
    bctx.fill();
    bctx.restore();
  }

  if(gameOver){
    bctx.fillStyle='rgba(8,9,18,.78)';
    bctx.fillRect(0,0,w,h);
    bctx.textAlign='center';
    var grad2=bctx.createLinearGradient(0,h/2-30,0,h/2+10);
    grad2.addColorStop(0,'#ffffff');
    grad2.addColorStop(1,'#8ecbff');
    bctx.fillStyle=grad2;
    bctx.font='900 22px -apple-system,Arial,sans-serif';
    bctx.fillText('PAPAN PENUH',w/2,h/2-8);
    bctx.fillStyle='rgba(238,241,247,.75)';
    bctx.font='700 12px -apple-system,Arial,sans-serif';
    bctx.fillText('Skor '+score+' — ketuk untuk ulang',w/2,h/2+16);
    bctx.textAlign='left';
  }
}

function stepAnim(){
  var alive=false;
  for(var y=0;y<SIZE;y++){
    for(var x=0;x<SIZE;x++){
      var cell=board[y][x];
      if(cell && cell.pop!=null && cell.pop<1){
        cell.pop=Math.min(1,cell.pop+0.14);
        if(cell.pop<1) alive=true;
      }
    }
  }
  for(var i=particles.length-1;i>=0;i--){
    var pt=particles[i];
    pt.x+=pt.vx; pt.y+=pt.vy;
    pt.vx*=0.94; pt.vy*=0.94;
    pt.life-=pt.decay;
    if(pt.life<=0) particles.splice(i,1); else alive=true;
  }
  return alive || particles.length>0;
}

function startLoop(){
  if(animRunning) return;
  animRunning=true;
  function tick(){
    stepAnim();
    drawBoard();
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderTray(){
  trayEl.innerHTML='';
  for(var i=0;i<tray.length;i++){
    (function(idx){
      var shape=tray[idx];
      var el=document.createElement('div');
      el.className='trayPiece'+(idx===selectedIdx?' selected':'')+(shape.used?' used':'');
      var c=document.createElement('canvas');
      var dim=shapeSize(shape);
      var cs=Math.min(16,60/Math.max(dim.w,dim.h));
      c.width=64; c.height=64;
      var pctx=c.getContext('2d');
      var offX=(64-dim.w*cs)/2, offY=(64-dim.h*cs)/2;
      for(var k=0;k<shape.cells.length;k++){
        var cell=shape.cells[k];
        drawCellBlock(pctx,offX+cell[0]*cs,offY+cell[1]*cs,cs,{c1:shape.color,c2:shape.colorB});
      }
      el.appendChild(c);
      el.addEventListener('pointerdown',function(e){
        e.preventDefault();
        ensureAudio();
        if(gameOver || shape.used) return;
        selectedIdx = (selectedIdx===idx) ? -1 : idx;
        sfx.select();
        renderTray();
        drawBoard();
      });
      trayEl.appendChild(el);
    })(i);
  }
}

function cellFromEvent(e){
  var rect=boardCanvas.getBoundingClientRect();
  var scaleX=boardCanvas.width/rect.width;
  var scaleY=boardCanvas.height/rect.height;
  var px=(e.clientX-rect.left)*scaleX;
  var py=(e.clientY-rect.top)*scaleY;
  return { x:Math.floor(px/CELL), y:Math.floor(py/CELL) };
}

boardCanvas.addEventListener('pointermove',function(e){
  if(selectedIdx<0 || gameOver) return;
  hoverCell=cellFromEvent(e);
});

boardCanvas.addEventListener('pointerdown',function(e){
  e.preventDefault();
  ensureAudio();
  if(gameOver){ reset(); return; }
  if(selectedIdx<0){
    statusEl.textContent='Pilih blok dulu di bawah';
    return;
  }
  var g=cellFromEvent(e);
  var gx=g.x, gy=g.y;

  var shape=tray[selectedIdx];
  if(!shape || shape.used) return;

  if(canPlace(shape,gx,gy)){
    pulseAt(gx*CELL+CELL/2, gy*CELL+CELL/2, shape.color);
    placeShape(shape,gx,gy);
    shape.used=true;
    selectedIdx=-1;
    hoverCell=null;

    if(tray.every(function(s){return s.used;})){
      refillTray();
    } else {
      renderTray();
    }

    drawBoard();

    if(checkGameOver()){
      gameOver=true;
      if(score>best){
        best=score;
        try{ localStorage.setItem('lunarielle_blast_best',String(best)); }catch(e){}
      }
      bestEl.textContent=String(best);
      statusEl.textContent='Papan penuh!';
      statusEl.className='status over';
      sfx.gameover();
      drawBoard();
    }
  } else {
    statusEl.textContent='Tidak muat di sana';
    sfx.invalid();
    cardEl.classList.remove('shake');
    void cardEl.offsetWidth;
    cardEl.classList.add('shake');
  }
},{passive:false});

reset();
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-blockblast-" + Date.now(),
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
                                    messageText: "LUNARIELLE • BLOCK BLAST"
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
                text: `❌ Gagal mengirim Block Blast: ${err?.message || err}`
            });
        }
    }
};