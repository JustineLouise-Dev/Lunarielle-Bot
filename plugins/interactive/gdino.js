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

.hdrRight{ display:flex; align-items:center; gap:10px; }

.scoreBox{ text-align:right; font-family:ui-monospace,SFMono-Regular,Menlo,monospace; }
.scoreNow{ font-size:20px; font-weight:700; color:#202020; letter-spacing:1px; transition:transform .12s ease; display:inline-block; }
.scoreNow.bump{ transform:scale(1.22); color:#c0392b; }
.scoreBest{ font-size:11px; color:#a3a3a3; margin-top:1px; letter-spacing:1px; }
.scoreBest b{ color:#6b6b6b; }

.soundBtn{
  width:28px; height:28px; border-radius:50%;
  border:1px solid #e3e3e3;
  background:#f7f7f7;
  color:#535353; font-size:13px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0;
}
.soundBtn:active{ transform:scale(.9); }

.stage{
  position:relative;
  background:#ffffff;
  overflow:hidden;
}

canvas{ display:block; width:100%; height:auto; }

.milestone{
  position:absolute; left:50%; top:30%; transform:translate(-50%,-50%) scale(.6);
  font-size:13px; font-weight:800; color:#535353; letter-spacing:1px;
  opacity:0; pointer-events:none; transition:opacity .18s ease, transform .18s ease;
  background:rgba(255,255,255,.9); padding:4px 10px; border-radius:20px;
  border:1px solid #e3e3e3;
}
.milestone.show{ opacity:1; transform:translate(-50%,-50%) scale(1); }

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
  transition:color .2s ease;
}

.footer .status.over{ color:#c0392b; }
.footer .status.new{ color:#1f9d55; }
</style>

<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">LUNARIELLE ARCADE</div>
        <div class="title">🦖 Dino Runner</div>
      </div>
      <div class="hdrRight">
        <button class="soundBtn" id="soundBtn" type="button">🔊</button>
        <div class="scoreBox">
          <div class="scoreNow" id="score">00000</div>
          <div class="scoreBest">HI <b id="best">00000</b></div>
        </div>
      </div>
    </div>

    <div class="stage">
      <canvas id="game" width="600" height="180"></canvas>
      <div class="milestone" id="milestone">100m!</div>
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
var soundBtn=document.getElementById('soundBtn');
var milestoneEl=document.getElementById('milestone');

var W=canvas.width;
var H=canvas.height;
var GROUND=H-30;

// ---------- AUDIO (Web Audio API, procedural, no files needed) ----------
var audioCtx=null, muted=false;
function initAudio(){
  if(!audioCtx){
    var AC=window.AudioContext||window.webkitAudioContext;
    if(AC) audioCtx=new AC();
  }
  if(audioCtx && audioCtx.state==='suspended'){ audioCtx.resume().catch(function(){}); }
}
function tone(freq,dur,type,vol,glideTo,delay){
  if(muted || !audioCtx) return;
  try{
    var t0=audioCtx.currentTime+(delay||0);
    var osc=audioCtx.createOscillator();
    var gain=audioCtx.createGain();
    osc.type=type||'sine';
    osc.frequency.setValueAtTime(freq,t0);
    if(glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo,t0+dur);
    gain.gain.setValueAtTime(vol||0.3,t0);
    gain.gain.exponentialRampToValueAtTime(0.001,t0+dur);
    osc.connect(gain); gain.connect(audioCtx.destination);
    osc.start(t0); osc.stop(t0+dur+0.02);
  }catch(e){}
}
function sfxJump(){ tone(380,0.09,'square',0.16,620); }
function sfxHit(){
  tone(160,0.2,'sawtooth',0.32,50);
  tone(80,0.28,'square',0.22,30,0.04);
}
function sfxMilestone(){
  tone(660,0.08,'triangle',0.22,0,0);
  tone(880,0.12,'triangle',0.24,0,0.08);
}
function sfxRecord(){
  tone(523.25,0.1,'triangle',0.26,0,0);
  tone(659.25,0.1,'triangle',0.26,0,0.09);
  tone(783.99,0.16,'triangle',0.28,0,0.18);
}
soundBtn.addEventListener('click',function(e){
  e.stopPropagation();
  initAudio();
  muted=!muted;
  soundBtn.textContent=muted?'🔇':'🔊';
});

// ---------- STORAGE (multi-fallback) ----------
function loadBest(){
  var vals=[];
  try{ var v=localStorage.getItem('lunarielle_dino_best'); if(v) vals.push(parseInt(v,10)); }catch(e){}
  try{ var v2=sessionStorage.getItem('lunarielle_dino_best'); if(v2) vals.push(parseInt(v2,10)); }catch(e){}
  try{ var m=document.cookie.match(/(?:^|;\\s*)lunarielle_dino_best=(\\d+)/); if(m) vals.push(parseInt(m[1],10)); }catch(e){}
  var f=vals.filter(function(x){ return !isNaN(x); });
  return f.length?Math.max.apply(null,f):0;
}
function saveBest(val){
  var s=String(Math.floor(val));
  try{ localStorage.setItem('lunarielle_dino_best',s); }catch(e){}
  try{ sessionStorage.setItem('lunarielle_dino_best',s); }catch(e){}
  try{ document.cookie='lunarielle_dino_best='+s+';max-age=31536000;path=/'; }catch(e){}
}

var dino={ x:44, y:GROUND-39, w:26, h:39, vy:0, jumping:false, duckFrame:0 };
var obstacles=[], clouds=[], groundDots=[], particles=[];
var score=0, best=loadBest(), speed=6, gameOver=false, started=false, last=0, spawnTimer=0, runFrame=0, groundOffset=0;
var shake=0, lastMilestone=0, newRecord=false;

bestEl.textContent=pad(Math.floor(best));

function pad(n){ return String(n).padStart(5,'0'); }

function dust(x,y,n){
  for(var i=0;i<(n||6);i++){
    particles.push({ x:x,y:y, vx:-1-Math.random()*1.5, vy:-0.5+Math.random()*-1, life:1, size:1.5+Math.random()*2 });
  }
}

function reset(){
  dino={ x:44, y:GROUND-39, w:26, h:39, vy:0, jumping:false, duckFrame:0 };
  obstacles=[]; particles=[];
  score=0; speed=6; gameOver=false; started=true; newRecord=false;
  spawnTimer=45; shake=0; lastMilestone=0;
  scoreEl.textContent='00000';
  scoreEl.classList.remove('bump');
  statusEl.textContent='Berlari...';
  statusEl.className='status';
}

function showMilestone(text){
  milestoneEl.textContent=text;
  milestoneEl.classList.remove('show');
  void milestoneEl.offsetWidth;
  milestoneEl.classList.add('show');
  clearTimeout(showMilestone._t);
  showMilestone._t=setTimeout(function(){ milestoneEl.classList.remove('show'); },600);
}

function bumpScore(){
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('bump');
}

function jump(){
  initAudio();
  if(!started){ reset(); return; }
  if(gameOver){ reset(); return; }
  if(!dino.jumping){
    dino.jumping=true; dino.vy=-12.5;
    sfxJump();
    dust(dino.x+4,GROUND-2,5);
  }
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

// Improved pixel-block T-Rex, redesigned proportions closer to the classic
// Chrome offline dino: slim tapering tail, elongated body with a smooth
// neck-to-chest transition, compact head with a short snout, and slender
// two-part legs. dino.x/dino.y is the top-left of the bounding box.
function drawDino(){
  var x=Math.round(dino.x), y=Math.round(dino.y);
  ctx.fillStyle='#535353';

  // tail: tapering, tucked close to the body
  ctx.fillRect(x-9,y+19,7,4);
  ctx.fillRect(x-5,y+16,7,5);
  ctx.fillRect(x-1,y+13,6,6);

  // body: long, gently domed top, flatter near the legs
  ctx.fillRect(x+3,y+13,19,4);
  ctx.fillRect(x+2,y+17,20,5);
  ctx.fillRect(x+4,y+22,16,3);

  // chest curving up, smoothing the transition from body into neck
  ctx.fillRect(x+15,y+8,9,7);
  ctx.fillRect(x+17,y+3,7,7);

  // neck: slim column rising, slightly forward-leaning
  ctx.fillRect(x+20,y-3,6,8);
  ctx.fillRect(x+22,y-9,6,7);

  // head: compact, with a brow ridge and a short snout
  ctx.fillRect(x+24,y-15,12,8);
  ctx.fillRect(x+25,y-17,9,3);
  ctx.fillRect(x+33,y-12,7,5);

  // tiny arm nub tucked under the chest
  ctx.fillRect(x+14,y+16,5,3);

  if(gameOver){
    // flat splayed legs + closed/X eye
    ctx.fillRect(x+4,y+25,8,10);
    ctx.fillRect(x+16,y+25,9,10);
    ctx.fillStyle='#fff';
    ctx.fillRect(x+29,y-9,2,2);
    ctx.fillRect(x+33,y-5,2,2);
    ctx.fillRect(x+29,y-5,2,2);
    ctx.fillRect(x+33,y-9,2,2);
    return;
  }

  // eye (white notch cut into the head so it doesn't merge with body color)
  ctx.fillStyle='#fff';
  ctx.fillRect(x+32,y-14,3,3);
  ctx.fillStyle='#535353';

  if(dino.jumping){
    // tucked legs mid-air, slim with a gap between them
    ctx.fillRect(x+4,y+25,6,9);
    ctx.fillRect(x+16,y+25,6,9);
  } else {
    // 2-frame running legs, slimmer than before with a clear white gap
    if(Math.floor(runFrame)%2===0){
      ctx.fillRect(x+4,y+25,6,14);
      ctx.fillRect(x+16,y+25,6,7);
    } else {
      ctx.fillRect(x+4,y+25,6,7);
      ctx.fillRect(x+16,y+25,6,14);
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

function drawParticles(){
  for(var i=0;i<particles.length;i++){
    var p=particles[i];
    ctx.globalAlpha=Math.max(0,p.life*0.5);
    ctx.fillStyle='#535353';
    ctx.beginPath();
    ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fill();
  }
  ctx.globalAlpha=1;
}

function updateParticles(dt){
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    p.x+=p.vx*dt; p.y+=p.vy*dt;
    p.life-=0.05*dt;
    if(p.life<=0) particles.splice(i,1);
  }
}

function draw(){
  ctx.save();
  if(shake>0){
    ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake);
  }
  ctx.clearRect(-4,-4,W+8,H+8);
  drawClouds();
  drawGround();
  drawParticles();

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
    if(newRecord){
      ctx.fillStyle='#1f9d55';
      ctx.font='700 12px -apple-system,Arial,sans-serif';
      ctx.fillText('🏆 REKOR BARU!',W/2,GROUND/2+14);
    } else {
      ctx.fillStyle='#535353';
      ctx.font='600 12px -apple-system,Arial,sans-serif';
      ctx.fillText('Ketuk untuk main lagi',W/2,GROUND/2+16);
    }
    ctx.textAlign='left';
  }
  ctx.restore();
}

function update(dt){
  updateParticles(dt);
  if(shake>0) shake=Math.max(0,shake-0.6*dt);

  if(!started || gameOver){ return; }

  groundOffset += speed*dt;

  dino.y += dino.vy*dt;
  dino.vy += 0.72*dt;
  if(dino.y >= GROUND-dino.h){
    if(dino.jumping) dust(dino.x+4,GROUND-2,4);
    dino.y = GROUND-dino.h;
    dino.vy = 0;
    dino.jumping = false;
  }

  if(!dino.jumping){
    runFrame += dt*0.28;
    if(Math.floor(runFrame)%2===0 && Math.random()<0.06*dt) dust(dino.x+2,GROUND-1,1);
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
      shake=7;
      sfxHit();
      if(score>best){
        best=score;
        newRecord=true;
        saveBest(best);
        setTimeout(sfxRecord,200);
      }
      bestEl.textContent=pad(Math.floor(best));
      statusEl.textContent=newRecord?'🏆 Rekor baru!':'Coba lagi';
      statusEl.className='status '+(newRecord?'new':'over');
      break;
    }
  }

  score += dt*0.6;
  speed = Math.min(13, 6+score/150);
  scoreEl.textContent=pad(Math.floor(score));

  var milestone=Math.floor(score/100)*100;
  if(milestone>lastMilestone && milestone>0){
    lastMilestone=milestone;
    bumpScore();
    sfxMilestone();
    showMilestone(milestone+'m!');
  }
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

draw();

document.addEventListener('pointerdown', function(e){
  if(e.target && e.target.id==='soundBtn') return;
  e.preventDefault(); jump();
}, {passive:false});
document.addEventListener('keydown', function(e){
  if(e.code==='Space' || e.code==='ArrowUp'){ e.preventDefault(); jump(); }
});
document.addEventListener('visibilitychange', function(){
  if(document.hidden && audioCtx) audioCtx.suspend().catch(function(){});
});

requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-dino-" + Date.now(),
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
                                    messageText: "LUNARIELLE • DINO RUNNER"
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