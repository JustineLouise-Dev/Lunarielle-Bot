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
// plugins/game/flappy.js

export default {
    command: 'flappy',
    alias: ['flappybird', 'burung'],
    category: 'interactive',
    description: '🐤 Main game Flappy Bird langsung di chat',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        const html = `<style>
*{ -webkit-tap-highlight-color:transparent; user-select:none; box-sizing:border-box; }
body{ margin:0; background:transparent; color:#3a3f4b; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:22px;
  overflow:hidden;
  background:#1c2b3a;
  box-shadow:0 14px 36px rgba(0,0,0,.4), inset 0 1px 0 rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);
}

.header{
  padding:15px 18px 10px;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
}

.brand{ display:flex; flex-direction:column; gap:2px; }
.eyebrow{ font-size:10px; letter-spacing:2.5px; color:rgba(255,255,255,.4); font-weight:700; }
.title{ font-size:19px; font-weight:800; color:#fff; letter-spacing:-.2px; }

.scoreBox{ text-align:right; }
.scoreNow{ font-size:22px; font-weight:800; color:#ffd166; font-variant-numeric:tabular-nums; text-shadow:0 0 14px rgba(255,209,102,.3); }
.scoreBest{ font-size:10px; color:rgba(255,255,255,.45); margin-top:1px; }
.scoreBest b{ color:rgba(255,255,255,.75); }

.stage{ position:relative; }
canvas{ display:block; width:100%; height:auto; }

.footer{
  padding:10px 18px 16px;
  text-align:center;
}
.status{ font-size:12px; font-weight:600; color:rgba(255,255,255,.55); letter-spacing:.3px; }
.status.over{ color:#ff6b6b; }
</style>

<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">ZURE ARCADE</div>
        <div class="title">🐤 Flappy Bird</div>
      </div>
      <div class="scoreBox">
        <div class="scoreNow" id="score">0</div>
        <div class="scoreBest">BEST <b id="best">0</b></div>
      </div>
    </div>

    <div class="stage">
      <canvas id="game" width="360" height="440"></canvas>
    </div>

    <div class="footer">
      <span class="status" id="status">Tap layar untuk terbang</span>
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

var W=canvas.width, H=canvas.height;
var GROUND=H-40;

var bird, pipes, score=0, best=0, gameOver=false, started=false, last=0, spawnTimer=0;
var GAP=118, PIPE_W=52, PIPE_SPEED=2.6;

try{ best=Number(localStorage.getItem('zure_flappy_best')||0); }catch(e){}
bestEl.textContent=String(best);

function reset(){
  bird={ x:80, y:H/2, vy:0, r:13, rot:0 };
  pipes=[];
  score=0; gameOver=false; started=true;
  spawnTimer=0;
  scoreEl.textContent='0';
  statusEl.textContent='Terbang...';
  statusEl.className='status';
  spawnPipe();
}

function spawnPipe(){
  var minTop=40, maxTop=GROUND-GAP-40;
  var top=minTop+Math.random()*(maxTop-minTop);
  pipes.push({ x:W+10, top:top, passed:false });
}

function flap(){
  if(!started || gameOver){ reset(); return; }
  bird.vy=-7.2;
}

function circleRectHit(cx,cy,cr,rx,ry,rw,rh){
  var closestX=Math.max(rx,Math.min(cx,rx+rw));
  var closestY=Math.max(ry,Math.min(cy,ry+rh));
  var dx=cx-closestX, dy=cy-closestY;
  return (dx*dx+dy*dy) < cr*cr;
}

function drawBackground(){
  var g=ctx.createLinearGradient(0,0,0,GROUND);
  g.addColorStop(0,'#4ec0e8');
  g.addColorStop(1,'#8fd9f0');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,GROUND);

  ctx.fillStyle='rgba(255,255,255,.55)';
  var t=Date.now()*0.00002;
  for(var i=0;i<4;i++){
    var cx=((i*130 + t*400)%(W+120))-60;
    var cy=50+i*40%160;
    ctx.beginPath();
    ctx.arc(cx,cy,22,0,Math.PI*2);
    ctx.arc(cx+22,cy+4,16,0,Math.PI*2);
    ctx.arc(cx-20,cy+6,14,0,Math.PI*2);
    ctx.fill();
  }
}

function drawGround(){
  ctx.fillStyle='#ded18f';
  ctx.fillRect(0,GROUND,W,H-GROUND);
  ctx.fillStyle='#4caf50';
  ctx.fillRect(0,GROUND,W,8);
  ctx.fillStyle='rgba(0,0,0,.08)';
  for(var x=0;x<W;x+=18){
    ctx.fillRect(x,GROUND+10,9,4);
  }
}

function drawPipe(p){
  ctx.fillStyle='#4caf50';
  // top pipe
  ctx.fillRect(p.x,0,PIPE_W,p.top);
  ctx.fillRect(p.x-4,p.top-18,PIPE_W+8,18);
  // bottom pipe
  var bottomY=p.top+GAP;
  ctx.fillRect(p.x,bottomY,PIPE_W,GROUND-bottomY);
  ctx.fillRect(p.x-4,bottomY,PIPE_W+8,18);

  ctx.fillStyle='rgba(255,255,255,.18)';
  ctx.fillRect(p.x+6,0,6,p.top);
  ctx.fillRect(p.x+6,bottomY+18,6,GROUND-bottomY-18);
}

function drawBird(){
  ctx.save();
  ctx.translate(bird.x,bird.y);
  ctx.rotate(bird.rot);

  ctx.fillStyle='#ffd166';
  ctx.beginPath();
  ctx.arc(0,0,bird.r,0,Math.PI*2);
  ctx.fill();

  // wing
  ctx.fillStyle='#f4a72e';
  ctx.beginPath();
  ctx.ellipse(-4,3,7,5,0.3,0,Math.PI*2);
  ctx.fill();

  // eye
  ctx.fillStyle='#3a3f4b';
  ctx.beginPath();
  ctx.arc(6,-4,2.2,0,Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle='#ff8c42';
  ctx.beginPath();
  ctx.moveTo(11,0);
  ctx.lineTo(20,-2);
  ctx.lineTo(11,5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function draw(){
  drawBackground();

  for(var i=0;i<pipes.length;i++) drawPipe(pipes[i]);

  drawGround();
  drawBird();

  if(!started){
    ctx.fillStyle='rgba(20,30,40,.35)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.font='700 18px -apple-system,Arial,sans-serif';
    ctx.fillText('Tap untuk terbang',W/2,H/2);
    ctx.textAlign='left';
  }

  if(gameOver){
    ctx.fillStyle='rgba(20,30,40,.5)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.font='800 24px -apple-system,Arial,sans-serif';
    ctx.fillText('GAME OVER',W/2,H/2-8);
    ctx.font='600 13px -apple-system,Arial,sans-serif';
    ctx.fillText('Tap layar untuk main lagi',W/2,H/2+16);
    ctx.textAlign='left';
  }
}

function update(dt){
  if(!started){ draw(); return; }
  if(gameOver){ draw(); return; }

  bird.vy+=0.36*dt;
  bird.y+=bird.vy*dt;
  bird.rot=Math.max(-0.5,Math.min(1.3,bird.vy*0.08));

  if(bird.y-bird.r<0){ bird.y=bird.r; bird.vy=0; }

  spawnTimer-=dt;
  if(spawnTimer<=0){
    spawnPipe();
    spawnTimer=95;
  }

  for(var i=0;i<pipes.length;i++){
    pipes[i].x-=PIPE_SPEED*dt;
  }
  pipes=pipes.filter(function(p){ return p.x>-PIPE_W-20; });

  for(var j=0;j<pipes.length;j++){
    var p=pipes[j];
    if(!p.passed && p.x+PIPE_W < bird.x){
      p.passed=true;
      score++;
      scoreEl.textContent=String(score);
    }
    var bottomY=p.top+GAP;
    if(circleRectHit(bird.x,bird.y,bird.r-2,p.x,0,PIPE_W,p.top) ||
       circleRectHit(bird.x,bird.y,bird.r-2,p.x,bottomY,PIPE_W,GROUND-bottomY)){
      endGame();
    }
  }

  if(bird.y+bird.r>=GROUND){
    bird.y=GROUND-bird.r;
    endGame();
  }

  draw();
}

function endGame(){
  if(gameOver) return;
  gameOver=true;
  if(score>best){
    best=score;
    try{ localStorage.setItem('zure_flappy_best',String(best)); }catch(e){}
  }
  bestEl.textContent=String(best);
  statusEl.textContent='Coba lagi?';
  statusEl.className='status over';
}

function loop(t){
  if(!last) last=t;
  var dt=Math.min(2,(t-last)/16.67);
  last=t;
  update(dt);
  requestAnimationFrame(loop);
}

draw();

document.addEventListener('pointerdown',function(e){ e.preventDefault(); flap(); },{passive:false});
document.addEventListener('keydown',function(e){
  if(e.code==='Space' || e.code==='ArrowUp'){ e.preventDefault(); flap(); }
});

requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "zure-flappy-" + Date.now(),
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
                                    messageText: "ZURE • FLAPPY BIRD"
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
                text: `❌ Gagal mengirim Flappy Bird: ${err?.message || err}`
            });
        }
    }
};
