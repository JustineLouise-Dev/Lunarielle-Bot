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
// plugins/game/gdino.js

export default {
    command: 'gdino',
    alias: ['dino', 'dinorun'],
    category: 'interactive',
    description: '🦖 Main game Dino Runner klasik ala Chrome Offline',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        const html = `<style>
*{ -webkit-tap-highlight-color:transparent; user-select:none; box-sizing:border-box; }
body{ margin:0; background:transparent; color:#535353; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:620px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:10px;
  overflow:hidden;
  background:#ffffff;
  box-shadow:0 10px 30px rgba(0,0,0,.18);
  border:1px solid #e3e3e3;
}

.header{
  padding:14px 18px 10px;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  border-bottom:1px solid #ececec;
}

.brand{ display:flex; flex-direction:column; gap:2px; }
.eyebrow{ font-size:10px; letter-spacing:2.5px; color:#a3a3a3; font-weight:700; }
.title{ font-size:19px; font-weight:700; color:#202020; letter-spacing:-.2px; }

.scoreBox{ text-align:right; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.scoreNow{ font-size:20px; font-weight:700; color:#202020; letter-spacing:1px; }
.scoreBest{ font-size:11px; color:#a3a3a3; margin-top:1px; letter-spacing:1px; }
.scoreBest b{ color:#6b6b6b; }

.stage{
  position:relative;
  background:#ffffff;
}

canvas{ display:block; width:100%; height:auto; }

.footer{
  padding:10px 18px 16px;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}

.footer .status{
  font-size:12px;
  font-weight:600;
  color:#757575;
  letter-spacing:.3px;
}

.footer .status.over{ color:#c0392b; }
</style>

<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">ZURE ARCADE</div>
        <div class="title">🦖 Dino Runner</div>
      </div>
      <div class="scoreBox">
        <div class="scoreNow" id="score">00000</div>
        <div class="scoreBest">HI <b id="best">00000</b></div>
      </div>
    </div>

    <div class="stage">
      <canvas id="game" width="600" height="180"></canvas>
    </div>

    <div class="footer">
      <span class="status" id="status">Ketuk layar atau tekan Spasi untuk mulai</span>
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

var W=canvas.width;
var H=canvas.height;
var GROUND=H-30;

var dino, obstacles=[], clouds=[], groundDots=[];
var score=0, best=0, speed=6, gameOver=false, started=false, last=0, spawnTimer=0, runFrame=0, groundOffset=0;

try{ best=Number(localStorage.getItem('zure_dino_best')||0); }catch(e){}
bestEl.textContent=pad(Math.floor(best));

function pad(n){ return String(n).padStart(5,'0'); }

function reset(){
  dino={ x:44, y:GROUND-40, w:22, h:40, vy:0, jumping:false, duckFrame:0 };
  obstacles=[];
  score=0; speed=6; gameOver=false; started=true;
  spawnTimer=45;
  scoreEl.textContent='00000';
  statusEl.textContent='Berlari...';
  statusEl.className='status';
}

function jump(){
  if(!started){ reset(); return; }
  if(gameOver){ reset(); return; }
  if(!dino.jumping){ dino.jumping=true; dino.vy=-12.5; }
}

function makeObstacle(){
  var type = Math.random()<0.72 ? 'cactus' : 'bird';
  if(type==='cactus'){
    var group = 1+Math.floor(Math.random()*3);
    var totalW = 0;
    var parts=[];
    for(var i=0;i<group;i++){
      var h = 30+Math.random()*14;
      var w = 12+Math.random()*6;
      parts.push({w:w,h:h});
      totalW += w+2;
    }
    obstacles.push({ kind:'cactus', x:W+10, y:GROUND, w:totalW, parts:parts });
  } else {
    var fh = GROUND-70-Math.random()*40;
    obstacles.push({ kind:'bird', x:W+10, y:fh, w:34, h:22, wingFrame:0 });
  }
}

function hitBox(a){
  if(a.kind==='cactus'){
    var maxH = 0;
    for(var i=0;i<a.parts.length;i++) if(a.parts[i].h>maxH) maxH=a.parts[i].h;
    return { x:a.x+3, y:a.y-maxH, w:a.w-6, h:maxH };
  }
  return { x:a.x+4, y:a.y+4, w:a.w-8, h:a.h-8 };
}

function overlap(a,b){
  return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
}

function drawGround(){
  ctx.strokeStyle='#535353';
  ctx.lineWidth=2;
  ctx.beginPath();
  ctx.moveTo(0,GROUND+1);
  ctx.lineTo(W,GROUND+1);
  ctx.stroke();

  ctx.fillStyle='#535353';
  for(var i=0;i<groundDots.length;i++){
    var d=groundDots[i];
    var x = (d.x - groundOffset) % (W+40);
    if(x<-10) x+=W+40;
    ctx.fillRect(x, GROUND+4+d.yOff, d.w, 2);
  }
}

function drawClouds(){
  ctx.fillStyle='#c9c9c9';
  for(var i=0;i<clouds.length;i++){
    var c=clouds[i];
    var x = c.x - (groundOffset*0.35)%(W+80);
    while(x<-80) x+=W+80;
    ctx.fillRect(x, c.y, 30, 8);
    ctx.fillRect(x+6, c.y-5, 18, 6);
  }
}

// classic pixel-block dino, 2-frame run cycle, blocky like Chrome's T-rex
// pixel T-Rex silhouette, built as a grid of blocks like the Chrome offline dino.
// each row is drawn separately so the head/neck/body/legs read as distinct shapes
// instead of merging into one dark blob.
function drawDino(){
  var x=Math.round(dino.x), y=Math.round(dino.y);
  ctx.fillStyle='#535353';

  // tail (behind body, doesn't touch it - leaves a visible notch)
  ctx.fillRect(x-8,y+6,8,6);
  ctx.fillRect(x-4,y+12,6,5);

  // torso (narrower than before, clearly a body shape)
  ctx.fillRect(x+2,y+4,16,10);
  ctx.fillRect(x+2,y+14,14,10);

  // neck rising into head
  ctx.fillRect(x+14,y-6,10,14);
  // head block, offset forward from neck so it reads as a head
  ctx.fillRect(x+18,y-16,16,14);
  // snout
  ctx.fillRect(x+30,y-10,8,6);

  // arm nub
  ctx.fillRect(x+10,y+16,6,4);

  if(gameOver){
    // flat splayed legs + closed/X eye
    ctx.fillRect(x+2,y+24,8,10);
    ctx.fillRect(x+16,y+24,10,10);
    ctx.fillStyle='#fff';
    ctx.fillRect(x+26,y-8,2,2);
    ctx.fillRect(x+30,y-4,2,2);
    ctx.fillRect(x+26,y-4,2,2);
    ctx.fillRect(x+30,y-8,2,2);
    return;
  }

  // eye (white notch cut into the head so it doesn't merge with body color)
  ctx.fillStyle='#fff';
  ctx.fillRect(x+29,y-13,3,3);
  ctx.fillStyle='#535353';

  if(dino.jumping){
    // tucked legs mid-air, gap between them so they read as two legs
    ctx.fillRect(x+2,y+24,7,9);
    ctx.fillRect(x+15,y+24,7,9);
  } else {
    // 2-frame running legs with a white gap between them
    if(Math.floor(runFrame)%2===0){
      ctx.fillRect(x,y+24,7,13);
      ctx.fillRect(x+15,y+24,7,7);
    } else {
      ctx.fillRect(x,y+24,7,7);
      ctx.fillRect(x+15,y+24,7,13);
    }
  }
}

function drawCactus(o){
  ctx.fillStyle='#535353';
  var cx = o.x;
  for(var i=0;i<o.parts.length;i++){
    var p = o.parts[i];
    var px = Math.round(cx);
    var py = Math.round(o.y-p.h);
    ctx.fillRect(px, py, p.w, p.h);
    // little arm nub for taller ones
    if(p.h>36){
      ctx.fillRect(px-4, py+8, 5, 5);
      ctx.fillRect(px+p.w-1, py+14, 5, 5);
    }
    cx += p.w+2;
  }
}

function drawBird(o){
  ctx.fillStyle='#535353';
  var x=Math.round(o.x), y=Math.round(o.y);
  ctx.fillRect(x+10,y+6,14,8);
  ctx.fillRect(x+24,y+8,6,4);
  if(o.wingFrame%2===0){
    ctx.fillRect(x,y,14,6);
    ctx.fillRect(x+16,y+2,10,5);
  } else {
    ctx.fillRect(x,y+10,14,6);
    ctx.fillRect(x+16,y+9,10,5);
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);
  drawClouds();
  drawGround();

  for(var i=0;i<obstacles.length;i++){
    var o=obstacles[i];
    if(o.kind==='cactus') drawCactus(o);
    else drawBird(o);
  }

  drawDino();

  if(!started){
    ctx.fillStyle='#535353';
    ctx.textAlign='center';
    ctx.font='700 15px -apple-system,Arial,sans-serif';
    ctx.fillText('Ketuk untuk mulai',W/2,GROUND/2);
    ctx.textAlign='left';
  }

  if(gameOver){
    ctx.fillStyle='#535353';
    ctx.textAlign='center';
    ctx.font='800 20px -apple-system,Arial,sans-serif';
    ctx.fillText('GAME OVER',W/2,GROUND/2-6);
    ctx.font='600 12px -apple-system,Arial,sans-serif';
    ctx.fillText('Ketuk untuk main lagi',W/2,GROUND/2+16);
    ctx.strokeStyle='#535353';
    ctx.lineWidth=2;
    ctx.strokeRect(W/2-22,GROUND/2+30,44,26);
    ctx.textAlign='left';
  }
}

function update(dt){
  if(!started || gameOver){ return; }

  groundOffset += speed*dt;

  dino.y += dino.vy*dt;
  dino.vy += 0.72*dt;
  if(dino.y >= GROUND-dino.h){
    dino.y = GROUND-dino.h;
    dino.vy = 0;
    dino.jumping = false;
  }

  if(!dino.jumping){
    runFrame += dt*0.28;
  }

  spawnTimer -= dt;
  if(spawnTimer<=0){
    makeObstacle();
    spawnTimer = Math.max(28, 62-speed*2 + Math.random()*30);
  }

  for(var i=0;i<obstacles.length;i++){
    obstacles[i].x -= speed*dt;
    if(obstacles[i].kind==='bird') obstacles[i].wingFrame += dt*0.15;
  }
  obstacles = obstacles.filter(function(o){ return o.x > -60; });

  var dinoBox = { x:dino.x, y:dino.y, w:dino.w, h:dino.h };
  for(var j=0;j<obstacles.length;j++){
    if(overlap(dinoBox, hitBox(obstacles[j]))){
      gameOver = true;
      if(score>best){
        best=score;
        try{ localStorage.setItem('zure_dino_best',String(Math.floor(best))); }catch(e){}
      }
      bestEl.textContent=pad(Math.floor(best));
      statusEl.textContent='Coba lagi';
      statusEl.className='status over';
      break;
    }
  }

  score += dt*0.6;
  speed = Math.min(13, 6+score/150);
  scoreEl.textContent=pad(Math.floor(score));
}

function loop(t){
  if(!last) last=t;
  var dt=Math.min(2,(t-last)/16.67);
  last=t;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

for(var i=0;i<3;i++){
  clouds.push({ x: Math.random()*W, y: 15+Math.random()*40 });
}
for(var i=0;i<80;i++){
  groundDots.push({ x: Math.random()*(W+40), w: 2+Math.random()*4, yOff: Math.random()*4 });
}

dino={ x:44, y:GROUND-40, w:22, h:40, vy:0, jumping:false };
draw();

document.addEventListener('pointerdown', function(e){ e.preventDefault(); jump(); }, {passive:false});
document.addEventListener('keydown', function(e){
  if(e.code==='Space' || e.code==='ArrowUp'){ e.preventDefault(); jump(); }
});

requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "zure-dino-" + Date.now(),
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
                                    messageText: "ZURE • DINO RUNNER"
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
                text: `❌ Gagal mengirim Dino Runner: ${err?.message || err}`
            });
        }
    }
};
