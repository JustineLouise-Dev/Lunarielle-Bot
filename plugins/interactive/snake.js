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
body{ margin:0; background:transparent; color:#0f380f; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.phone{
  position:relative;
  border-radius:26px;
  overflow:hidden;
  background:#3a3f35;
  padding:14px 14px 18px;
  box-shadow:0 14px 34px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06);
  border:1px solid rgba(0,0,0,.4);
}

.header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:2px 4px 10px;
}

.brand{ display:flex; flex-direction:column; gap:1px; }
.eyebrow{ font-size:9px; letter-spacing:2.5px; color:#c4c9b8; font-weight:700; }
.title{ font-size:15px; font-weight:700; color:#e8ecdd; letter-spacing:.2px; }

.scoreBox{ text-align:right; }
.scoreNow{ font-size:15px; font-weight:800; color:#e8ecdd; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; letter-spacing:1px; }
.scoreBest{ font-size:9px; color:#a3a89a; margin-top:1px; letter-spacing:.5px; }

.screen{
  position:relative;
  border-radius:6px;
  overflow:hidden;
  background:#9bbc0f;
  border:3px solid #24291f;
  box-shadow:inset 0 2px 10px rgba(0,0,0,.35);
}

canvas{ display:block; width:100%; height:auto; image-rendering:pixelated; }

.status{
  padding:8px 4px 2px;
  text-align:center;
  font-size:11px;
  font-weight:700;
  color:#c4c9b8;
  letter-spacing:.5px;
}
.status.over{ color:#e0736b; }

.pad{
  margin-top:12px;
  display:grid;
  grid-template-columns:52px 52px 52px;
  grid-template-rows:44px 44px 44px;
  gap:6px;
  justify-content:center;
}

.padBtn{
  border:none;
  border-radius:10px;
  background:#4d5346;
  color:#e8ecdd;
  font-size:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 3px 0 #262a20, inset 0 1px 0 rgba(255,255,255,.08);
}
.padBtn:active{ transform:translateY(2px); box-shadow:0 1px 0 #262a20; }

.padUp{ grid-column:2; grid-row:1; }
.padLeft{ grid-column:1; grid-row:2; }
.padCenter{ grid-column:2; grid-row:2; background:#3a3f35; box-shadow:inset 0 1px 4px rgba(0,0,0,.4); font-size:10px; font-weight:700; letter-spacing:.5px; }
.padRight{ grid-column:3; grid-row:2; }
.padDown{ grid-column:2; grid-row:3; }
</style>

<div class="wrap">
  <div class="phone">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">ZURE ARCADE</div>
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

var COLS=20, ROWS=20;
var CELL=canvas.width/COLS;

var BG='#9bbc0f';
var BG_DARK='#8bac0f';
var FG='#0f380f';

var snake, dir, nextDir, food, score, best, gameOver, started, paused;
var tickAcc=0, TICK=110;
var last=0;

try{ best=Number(localStorage.getItem('zure_snake_best')||0); }catch(e){}
bestEl.textContent=pad3(best);

function pad3(n){ return String(n).padStart(3,'0'); }

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
  placeFood();
  scoreEl.textContent=pad3(score);
  statusEl.textContent='Berjalan...';
  statusEl.className='status';
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
  if(paused) return;
  // prevent reversing directly into itself
  if(dir.x===-nx && dir.y===-ny) return;
  nextDir={x:nx,y:ny};
}

function togglePause(){
  if(!started || gameOver){ reset(); return; }
  paused=!paused;
  statusEl.textContent = paused ? 'Jeda' : 'Berjalan...';
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
    TICK=Math.max(55, 110-score*3);
    placeFood();
  } else {
    snake.pop();
  }
}

function endGame(){
  gameOver=true;
  if(score>best){
    best=score;
    try{ localStorage.setItem('zure_snake_best',String(best)); }catch(e){}
  }
  bestEl.textContent=pad3(best);
  statusEl.textContent='Game Over - tekan panah untuk ulang';
  statusEl.className='status over';
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

  // food (blinking pixel block)
  ctx.fillStyle=FG;
  var pulse = Math.floor(Date.now()/220)%2===0;
  var fpad = pulse?1:2;
  ctx.fillRect(food.x*CELL+fpad, food.y*CELL+fpad, CELL-fpad*2, CELL-fpad*2);

  // snake body blocks with 1px gap so segments read distinctly
  for(var i=0;i<snake.length;i++){
    var s=snake[i];
    ctx.fillStyle=FG;
    ctx.fillRect(s.x*CELL+1, s.y*CELL+1, CELL-2, CELL-2);
  }

  if(gameOver){
    ctx.fillStyle='rgba(15,56,15,0.72)';
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
            response_id: "zure-snake-" + Date.now(),
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
                                    messageText: "ZURE • SNAKE"
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
