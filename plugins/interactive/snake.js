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
// plugins/game/snake.js

export default {
    command: 'snake',
    alias: ['ular', 'nokia'],
    category: 'interactive',
    description: '🐍 Main game Snake klasik ala Nokia 3310',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        const html = `<style>
*{ -webkit-tap-highlight-color:transparent; user-select:none; box-sizing:border-box; }
html,body{ margin:0; background:transparent; color:#0f380f; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.phone{
  position:relative;
  border-radius:28px;
  overflow:hidden;
  background:
    radial-gradient(120% 140% at 20% -10%, rgba(255,255,255,.05), transparent 55%),
    linear-gradient(180deg,#484e40 0%,#3a3f35 40%,#2c3027 100%);
  padding:15px 15px 19px;
  box-shadow:0 18px 42px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.07), inset 0 0 0 1px rgba(0,0,0,.35);
  border:1px solid rgba(0,0,0,.45);
  animation:phoneIn .5s cubic-bezier(.2,.8,.2,1);
}
@keyframes phoneIn{ from{ opacity:0; transform:translateY(10px) scale(.98);} to{ opacity:1; transform:none; } }

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:2px 5px 11px;
}

.brand{ display:flex; flex-direction:column; gap:1px; }
.eyebrow{ font-size:9px; letter-spacing:2.5px; color:#c4c9b8; font-weight:800; display:flex; align-items:center; gap:5px; }
.eyebrow .dot{ width:4px; height:4px; border-radius:50%; background:#9bbc0f; box-shadow:0 0 6px rgba(155,188,15,.8); }
.title{ font-size:15px; font-weight:800; color:#e8ecdd; letter-spacing:.2px; }

.scoreBox{ text-align:right; }
.scoreNow{ font-size:15px; font-weight:800; color:#e8ecdd; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:1px; transition:transform .15s cubic-bezier(.34,1.56,.64,1), color .15s ease; }
.scoreNow.pop{ transform:scale(1.35); color:#c8e878; }
.scoreBest{ font-size:9px; color:#a3a89a; margin-top:1px; letter-spacing:.5px; }
.scoreBest span{ color:#d7dcc6; font-weight:700; }

.screen{
  position:relative;
  border-radius:8px;
  overflow:hidden;
  background:#9bbc0f;
  border:3px solid #1d211a;
  box-shadow:inset 0 3px 14px rgba(0,0,0,.4), inset 0 0 24px rgba(0,0,0,.12);
}

.screen::after{
  /* subtle LCD scanline sheen overlay */
  content:'';
  position:absolute; inset:0;
  background:repeating-linear-gradient(180deg, rgba(0,0,0,.05) 0px, rgba(0,0,0,.05) 1px, transparent 1px, transparent 3px);
  pointer-events:none;
  mix-blend-mode:multiply;
  opacity:.5;
}

canvas{ display:block; width:100%; height:auto; image-rendering:pixelated; }

.status{
  padding:9px 4px 2px;
  text-align:center;
  font-size:11px;
  font-weight:700;
  color:#c4c9b8;
  letter-spacing:.5px;
  transition:color .2s ease;
}
.status.over{ color:#e0736b; }
.status.good{ color:#9bbc0f; }

.shake{ animation:shakeFx .35s ease; }
@keyframes shakeFx{
  10%,90%{ transform:translateX(-1px); }
  20%,80%{ transform:translateX(2px); }
  30%,50%,70%{ transform:translateX(-4px); }
  40%,60%{ transform:translateX(4px); }
}

.pad{
  margin-top:13px;
  display:grid;
  grid-template-columns:52px 52px 52px;
  grid-template-rows:44px 44px 44px;
  gap:7px;
  justify-content:center;
}

.padBtn{
  border:none;
  border-radius:11px;
  background:linear-gradient(160deg,#565c4d,#454a3d);
  color:#e8ecdd;
  font-size:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 3px 0 #21241b, inset 0 1px 0 rgba(255,255,255,.1);
  transition:transform .08s ease, box-shadow .08s ease;
}
.padBtn:active{ transform:translateY(3px); box-shadow:0 0 0 #21241b; }

.padUp{ grid-column:2; grid-row:1; }
.padLeft{ grid-column:1; grid-row:2; }
.padCenter{ grid-column:2; grid-row:2; background:linear-gradient(160deg,#3f453a,#33372c); box-shadow:inset 0 2px 6px rgba(0,0,0,.45); font-size:10px; font-weight:800; letter-spacing:.5px; }
.padRight{ grid-column:3; grid-row:2; }
.padDown{ grid-column:2; grid-row:3; }
</style>

<div class="wrap">
  <div class="phone" id="phone">

    <div class="header">
      <div class="brand">
        <div class="eyebrow"><span class="dot"></span>LUNARIELLE ARCADE</div>
        <div class="title">🐍 Snake</div>
      </div>
      <div class="scoreBox">
        <div class="scoreNow" id="score">000</div>
        <div class="scoreBest">HI <span id="best">000</span></div>
      </div>
    </div>

    <div class="screen">
      <canvas id="game" width="240" height="240"></canvas>
    </div>

    <div class="status" id="status">Tekan panah untuk mulai</div>

    <div class="pad">
      <button class="padBtn padUp" id="btnUp">▲</button>
      <button class="padBtn padLeft" id="btnLeft">◀</button>
      <button class="padBtn padCenter" id="btnCenter">JEDA</button>
      <button class="padBtn padRight" id="btnRight">▶</button>
      <button class="padBtn padDown" id="btnDown">▼</button>
    </div>

  </div>
</div>

<script>
(function(){
"use strict";
var canvas=document.getElementById('game');
var ctx=canvas.getContext('2d');
var scoreEl=document.getElementById('score');
var bestEl=document.getElementById('best');
var statusEl=document.getElementById('status');
var phoneEl=document.getElementById('phone');

var COLS=20, ROWS=20;
var CELL=canvas.width/COLS;

var BG='#9bbc0f';
var BG_DARK='#8bac0f';
var FG='#0f380f';

var snake, dir, nextDir, food, score, best, gameOver, started, paused;
var tickAcc=0, TICK=110;
var last=0;
var eatPulse=0; // 0..1 flash on eat
var deathFlash=0;
var particles=[]; // small pixel burst on eat / death

best=0;
try{
  var storedBest=localStorage.getItem('lunarielle_snake_best');
  var parsedBest=Number(storedBest);
  if(storedBest!=null && !isNaN(parsedBest)){ best=parsedBest; }
}catch(e){}
bestEl.textContent=pad3(best);

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
  osc.type=opts.type||'square';
  osc.frequency.setValueAtTime(freq,t0);
  if(opts.slideTo){ osc.frequency.exponentialRampToValueAtTime(Math.max(1,opts.slideTo), t0+dur); }
  var peak=opts.vol!=null?opts.vol:0.14;
  gain.gain.setValueAtTime(0.0001,t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0+0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(t0); osc.stop(t0+dur+0.02);
}
var sfx={
  eat:function(){ beep(660,0.05,{type:'square',vol:0.13,slideTo:920}); beep(1320,0.04,{type:'square',vol:0.06,delay:0.03}); },
  move:function(){ /* intentionally silent — avoid tick spam every frame */ },
  turn:function(){ beep(300,0.02,{type:'square',vol:0.04}); },
  pause:function(){ beep(500,0.05,{type:'triangle',vol:0.08}); },
  resume:function(){ beep(650,0.05,{type:'triangle',vol:0.08}); },
  gameover:function(){
    beep(300,0.1,{type:'square',vol:0.14,slideTo:180});
    setTimeout(function(){ beep(220,0.1,{type:'square',vol:0.13,slideTo:130}); },90);
    setTimeout(function(){ beep(140,0.22,{type:'square',vol:0.12,slideTo:60}); },180);
  },
  start:function(){ beep(440,0.04,{type:'square',vol:0.09}); setTimeout(function(){ beep(660,0.06,{type:'square',vol:0.1}); },60); }
};

function pad3(n){
  n=Number(n);
  if(!isFinite(n) || isNaN(n)) n=0;
  return String(n).padStart(3,'0');
}

function bumpScore(){
  scoreEl.classList.remove('pop');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('pop');
  setTimeout(function(){ scoreEl.classList.remove('pop'); },220);
}

function spawnParticles(gx,gy,count){
  for(var i=0;i<count;i++){
    var ang=Math.random()*Math.PI*2;
    var spd=0.6+Math.random()*1.6;
    particles.push({
      x:gx*CELL+CELL/2, y:gy*CELL+CELL/2,
      vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd,
      life:1, decay:0.035+Math.random()*0.02,
      size:1.5+Math.random()*2
    });
  }
}

function reset(){
  snake=[
    {x:9,y:10},{x:8,y:10},{x:7,y:10}
  ];
  dir={x:1,y:0};
  nextDir={x:1,y:0};
  score=0;
  gameOver=false;
  started=true;
  paused=false;
  tickAcc=0;
  TICK=110;
  particles=[];
  deathFlash=0;
  placeFood();
  scoreEl.textContent=pad3(score);
  statusEl.textContent='Berjalan...';
  statusEl.className='status';
  sfx.start();
}

function placeFood(){
  var ok=false, fx, fy;
  while(!ok){
    fx=Math.floor(Math.random()*COLS);
    fy=Math.floor(Math.random()*ROWS);
    ok=true;
    for(var i=0;i<snake.length;i++){
      if(snake[i].x===fx && snake[i].y===fy){ ok=false; break; }
    }
  }
  food={x:fx,y:fy};
}

function setDir(nx,ny){
  if(!started || gameOver){ reset(); return; }
  ensureAudio();
  if(paused) return;
  // prevent reversing directly into itself
  if(dir.x===-nx && dir.y===-ny) return;
  if(nextDir.x!==nx || nextDir.y!==ny) sfx.turn();
  nextDir={x:nx,y:ny};
}

function togglePause(){
  ensureAudio();
  if(!started || gameOver){ reset(); return; }
  paused=!paused;
  statusEl.textContent = paused ? 'Jeda' : 'Berjalan...';
  if(paused) sfx.pause(); else sfx.resume();
}

function step(){
  dir=nextDir;
  var head={ x:snake[0].x+dir.x, y:snake[0].y+dir.y };

  // wrap around edges like classic Nokia snake
  if(head.x<0) head.x=COLS-1;
  if(head.x>=COLS) head.x=0;
  if(head.y<0) head.y=ROWS-1;
  if(head.y>=ROWS) head.y=0;

  // self collision
  for(var i=0;i<snake.length;i++){
    if(snake[i].x===head.x && snake[i].y===head.y){
      endGame();
      return;
    }
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    score++;
    scoreEl.textContent=pad3(score);
    bumpScore();
    TICK=Math.max(55, 110-score*3);
    eatPulse=1;
    spawnParticles(food.x,food.y,8);
    sfx.eat();
    placeFood();
  } else {
    snake.pop();
  }
}

function endGame(){
  gameOver=true;
  deathFlash=1;
  spawnParticles(snake[0].x,snake[0].y,16);
  if(score>best){
    best=score;
    try{ localStorage.setItem('lunarielle_snake_best',String(best)); }catch(e){}
  }
  bestEl.textContent=pad3(best);
  statusEl.textContent='Game Over - tekan panah untuk ulang';
  statusEl.className='status over';
  sfx.gameover();
  phoneEl.classList.remove('shake');
  void phoneEl.offsetWidth;
  phoneEl.classList.add('shake');
}

function stepAnim(){
  if(eatPulse>0) eatPulse=Math.max(0,eatPulse-0.09);
  if(deathFlash>0) deathFlash=Math.max(0,deathFlash-0.05);
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx; p.y+=p.vy;
    p.vx*=0.92; p.vy*=0.92;
    p.life-=p.decay;
    if(p.life<=0) particles.splice(i,1);
  }
}

function draw(){
  ctx.fillStyle=BG;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // subtle LCD grid like a real Nokia screen
  ctx.fillStyle=BG_DARK;
  for(var gy=0;gy<ROWS;gy++){
    for(var gx=0;gx<COLS;gx++){
      if((gx+gy)%2===0){
        ctx.fillRect(gx*CELL,gy*CELL,CELL,CELL);
      }
    }
  }

  if(!started){
    drawCenterText('SNAKE',canvas.height/2-10);
    drawCenterText('Tekan panah',canvas.height/2+10,10);
    return;
  }

  // food (blinking pixel block, slightly larger pulse ring right after eating nearby food)
  ctx.fillStyle=FG;
  var pulse = Math.floor(Date.now()/220)%2===0;
  var fpad = pulse?1:2;
  ctx.fillRect(food.x*CELL+fpad, food.y*CELL+fpad, CELL-fpad*2, CELL-fpad*2);

  // snake body blocks with 1px gap so segments read distinctly; head slightly larger/brighter
  for(var i=0;i<snake.length;i++){
    var s=snake[i];
    ctx.fillStyle=FG;
    if(i===0){
      ctx.fillRect(s.x*CELL, s.y*CELL, CELL-1, CELL-1);
    } else {
      ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
    }
  }

  // eat pulse ring flash around head
  if(eatPulse>0){
    var headS=snake[0];
    ctx.save();
    ctx.globalAlpha=eatPulse*0.5;
    ctx.strokeStyle=FG;
    ctx.lineWidth=2;
    var r=(1-eatPulse)*CELL*1.6+CELL*0.4;
    ctx.beginPath();
    ctx.arc(headS.x*CELL+CELL/2, headS.y*CELL+CELL/2, r, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  // particles (pixel-style squares to match the LCD aesthetic)
  for(var p=0;p<particles.length;p++){
    var pt=particles[p];
    ctx.save();
    ctx.globalAlpha=Math.max(0,pt.life);
    ctx.fillStyle=FG;
    ctx.fillRect(pt.x-pt.size/2, pt.y-pt.size/2, pt.size, pt.size);
    ctx.restore();
  }

  if(gameOver){
    ctx.fillStyle='rgba(15,56,15,'+(0.35+deathFlash*0.4)+')';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawCenterTextInverted('GAME OVER',canvas.height/2-6);
    drawCenterTextInverted('Skor '+score,canvas.height/2+14,10);
  } else if(paused){
    ctx.fillStyle='rgba(15,56,15,0.55)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    drawCenterTextInverted('JEDA',canvas.height/2);
  }
}

function drawCenterText(text,y,size){
  ctx.fillStyle=FG;
  ctx.textAlign='center';
  ctx.font='700 '+(size||16)+'px monospace';
  ctx.fillText(text,canvas.width/2,y);
  ctx.textAlign='left';
}

function drawCenterTextInverted(text,y,size){
  ctx.fillStyle=BG;
  ctx.textAlign='center';
  ctx.font='700 '+(size||16)+'px monospace';
  ctx.fillText(text,canvas.width/2,y);
  ctx.textAlign='left';
}

function loop(t){
  if(!last) last=t;
  var dt=t-last;
  last=t;

  if(started && !gameOver && !paused){
    tickAcc+=dt;
    while(tickAcc>=TICK){
      step();
      tickAcc-=TICK;
      if(gameOver) break;
    }
  }

  stepAnim();
  draw();
  requestAnimationFrame(loop);
}

document.getElementById('btnUp').addEventListener('pointerdown',function(e){ e.preventDefault(); setDir(0,-1); });
document.getElementById('btnDown').addEventListener('pointerdown',function(e){ e.preventDefault(); setDir(0,1); });
document.getElementById('btnLeft').addEventListener('pointerdown',function(e){ e.preventDefault(); setDir(-1,0); });
document.getElementById('btnRight').addEventListener('pointerdown',function(e){ e.preventDefault(); setDir(1,0); });
document.getElementById('btnCenter').addEventListener('pointerdown',function(e){ e.preventDefault(); togglePause(); });

document.addEventListener('keydown',function(e){
  if(e.code==='ArrowUp'){ e.preventDefault(); setDir(0,-1); }
  else if(e.code==='ArrowDown'){ e.preventDefault(); setDir(0,1); }
  else if(e.code==='ArrowLeft'){ e.preventDefault(); setDir(-1,0); }
  else if(e.code==='ArrowRight'){ e.preventDefault(); setDir(1,0); }
  else if(e.code==='Space'){ e.preventDefault(); togglePause(); }
});

// swipe support on the screen itself
var touchStartX=0, touchStartY=0;
var screenEl=document.querySelector('.screen');
screenEl.addEventListener('pointerdown',function(e){
  touchStartX=e.clientX; touchStartY=e.clientY;
});
screenEl.addEventListener('pointerup',function(e){
  var dx=e.clientX-touchStartX, dy=e.clientY-touchStartY;
  if(Math.abs(dx)<12 && Math.abs(dy)<12){
    if(!started || gameOver){ reset(); }
    return;
  }
  if(Math.abs(dx)>Math.abs(dy)){
    setDir(dx>0?1:-1,0);
  } else {
    setDir(0,dy>0?1:-1);
  }
});

draw();
requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-snake-" + Date.now(),
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
                                    messageText: "LUNARIELLE • SNAKE"
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
                text: `❌ Gagal mengirim Snake: ${err?.message || err}`
            });
        }
    }
};