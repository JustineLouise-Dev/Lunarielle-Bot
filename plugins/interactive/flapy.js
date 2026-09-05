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
body{ margin:0; background:transparent; color:#eaf2ff; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:24px;
  overflow:hidden;
  background:linear-gradient(160deg,#141e30,#0d1420);
  box-shadow:0 20px 46px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.09);
}

.header{
  padding:16px 18px 10px;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
  position:relative;
  z-index:2;
}

.brand{ display:flex; flex-direction:column; gap:2px; }
.eyebrow{ font-size:10px; letter-spacing:3px; color:#ffd166; font-weight:800; text-shadow:0 0 12px rgba(255,209,102,.5); }
.title{ font-size:20px; font-weight:800; color:#fff; letter-spacing:-.3px; display:flex; align-items:center; gap:6px; }

.hdrRight{ display:flex; align-items:center; gap:10px; }

.scoreBox{ text-align:right; }
.scoreNow{ font-size:24px; font-weight:800; color:#ffd166; font-variant-numeric:tabular-nums; text-shadow:0 0 16px rgba(255,209,102,.45); line-height:1; transition:transform .12s ease; }
.scoreNow.bump{ transform:scale(1.28); }
.scoreBest{ font-size:10px; color:rgba(255,255,255,.5); margin-top:3px; }
.scoreBest b{ color:#8fd9f0; }

.soundBtn{
  width:30px; height:30px; border-radius:50%;
  border:1px solid rgba(255,255,255,.15);
  background:rgba(255,255,255,.06);
  color:#fff; font-size:14px;
  display:flex; align-items:center; justify-content:center;
  cursor:pointer; flex-shrink:0;
}
.soundBtn:active{ transform:scale(.9); }

.stage{ position:relative; }
canvas{ display:block; width:100%; height:auto; }

.combo{
  position:absolute; left:50%; top:38%; transform:translate(-50%,-50%) scale(.6);
  font-size:15px; font-weight:800; color:#ffd166; text-shadow:0 0 14px rgba(255,209,102,.7);
  opacity:0; pointer-events:none; letter-spacing:1px;
  transition:opacity .18s ease, transform .18s ease;
  z-index:3; white-space:nowrap;
}
.combo.show{ opacity:1; transform:translate(-50%,-50%) scale(1); }

.footer{
  padding:11px 18px 17px;
  text-align:center;
  position:relative; z-index:2;
}
.status{ font-size:12px; font-weight:700; color:rgba(255,255,255,.6); letter-spacing:.4px; transition:color .2s ease; }
.status.over{ color:#ff6b6b; }
.status.new{ color:#7CFC9A; }

.flashOverlay{
  position:absolute; inset:0; background:#fff; opacity:0; pointer-events:none; z-index:5;
}
</style>

<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">LUNARIELLE ARCADE</div>
        <div class="title">🐤 Flappy Bird</div>
      </div>
      <div class="hdrRight">
        <button class="soundBtn" id="soundBtn" type="button">🔊</button>
        <div class="scoreBox">
          <div class="scoreNow" id="score">0</div>
          <div class="scoreBest">BEST <b id="best">0</b></div>
        </div>
      </div>
    </div>

    <div class="stage">
      <canvas id="game" width="360" height="440"></canvas>
      <div class="combo" id="combo">COMBO x2</div>
      <div class="flashOverlay" id="flash"></div>
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
var comboEl=document.getElementById('combo');
var flashEl=document.getElementById('flash');
var soundBtn=document.getElementById('soundBtn');

var W=canvas.width, H=canvas.height;
var GROUND=H-40;
var DPR=Math.min(2,window.devicePixelRatio||1);

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
function sfxFlap(){ tone(420,0.09,'sine',0.22,620); }
function sfxScore(streak){
  var base=660+Math.min(streak||0,10)*30;
  tone(base,0.12,'triangle',0.3,base*1.6);
}
function sfxHit(){
  tone(180,0.18,'sawtooth',0.35,60);
  tone(90,0.3,'square',0.25,30,0.05);
}
function sfxSwoosh(){ tone(200,0.15,'sine',0.12,400); }
function sfxRecord(){
  tone(523.25,0.1,'triangle',0.28,0,0);
  tone(659.25,0.1,'triangle',0.28,0,0.09);
  tone(783.99,0.18,'triangle',0.3,0,0.18);
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
  try{ var v=localStorage.getItem('lunarielle_flappy_best'); if(v) vals.push(parseInt(v,10)); }catch(e){}
  try{ var v2=sessionStorage.getItem('lunarielle_flappy_best'); if(v2) vals.push(parseInt(v2,10)); }catch(e){}
  try{ var m=document.cookie.match(/(?:^|;\\s*)lunarielle_flappy_best=(\\d+)/); if(m) vals.push(parseInt(m[1],10)); }catch(e){}
  var f=vals.filter(function(x){ return !isNaN(x); });
  return f.length?Math.max.apply(null,f):0;
}
function saveBest(val){
  var s=String(Math.floor(val));
  try{ localStorage.setItem('lunarielle_flappy_best',s); }catch(e){}
  try{ sessionStorage.setItem('lunarielle_flappy_best',s); }catch(e){}
  try{ document.cookie='lunarielle_flappy_best='+s+';max-age=31536000;path=/'; }catch(e){}
}

var bird={ x:80, y:H/2, vy:0, r:13, rot:0 }, pipes=[], particles=[], clouds, score=0, best=loadBest(), streak=0;
var gameOver=false, started=false, last=0, spawnTimer=0, shake=0, flash=0, newRecord=false, groundOffset=0;
var GAP=148, PIPE_W=52, PIPE_SPEED=2.6;

bestEl.textContent=String(best);

function initClouds(){
  clouds=[];
  for(var i=0;i<5;i++){
    clouds.push({ x:Math.random()*W, y:30+Math.random()*140, s:0.6+Math.random()*0.8, spd:6+Math.random()*10 });
  }
}
initClouds();

function reset(){
  bird={ x:80, y:H/2, vy:0, r:13, rot:0 };
  pipes=[]; particles=[];
  score=0; streak=0; gameOver=false; started=true; newRecord=false;
  shake=0; flash=0;
  scoreEl.textContent='0';
  statusEl.textContent='Terbang...';
  statusEl.className='status';
  spawnPipe(90);
  spawnTimer=95;
  sfxSwoosh();
}

function spawnPipe(offsetX){
  var minTop=40, maxTop=GROUND-GAP-40;
  var top=minTop+Math.random()*(maxTop-minTop);
  pipes.push({ x:W+10+(offsetX||0), top:top, passed:false });
}

function burst(x,y,color,n){
  for(var i=0;i<(n||14);i++){
    var a=Math.random()*Math.PI*2, sp=1+Math.random()*3.5;
    particles.push({ x:x,y:y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp, life:1, color:color, size:2+Math.random()*3 });
  }
}

function flap(){
  initAudio();
  if(!started || gameOver){ reset(); return; }
  bird.vy=-7.4;
  sfxFlap();
  burst(bird.x-8,bird.y+4,'255,255,255',3);
}

function circleRectHit(cx,cy,cr,rx,ry,rw,rh){
  var closestX=Math.max(rx,Math.min(cx,rx+rw));
  var closestY=Math.max(ry,Math.min(cy,ry+rh));
  var dx=cx-closestX, dy=cy-closestY;
  return (dx*dx+dy*dy) < cr*cr;
}

function drawBackground(){
  var g=ctx.createLinearGradient(0,0,0,GROUND);
  g.addColorStop(0,'#3aa9dd');
  g.addColorStop(0.55,'#6cc8e8');
  g.addColorStop(1,'#a7e4f0');
  ctx.fillStyle=g;
  ctx.fillRect(0,0,W,GROUND);

  // sun glow
  ctx.save();
  var glow=ctx.createRadialGradient(W-70,60,4,W-70,60,70);
  glow.addColorStop(0,'rgba(255,244,200,.9)');
  glow.addColorStop(1,'rgba(255,244,200,0)');
  ctx.fillStyle=glow;
  ctx.beginPath(); ctx.arc(W-70,60,70,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // parallax clouds
  ctx.fillStyle='rgba(255,255,255,.75)';
  for(var i=0;i<clouds.length;i++){
    var c=clouds[i];
    if(started && !gameOver) c.x-=c.spd*0.016*16.6*0.06;
    if(c.x<-60) c.x=W+60;
    ctx.save();
    ctx.translate(c.x,c.y);
    ctx.scale(c.s,c.s);
    ctx.beginPath();
    ctx.arc(0,0,20,0,Math.PI*2);
    ctx.arc(20,4,15,0,Math.PI*2);
    ctx.arc(-18,5,13,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }

  // distant hill silhouette (moves with ground/pipe scroll, at slow parallax rate)
  ctx.fillStyle='rgba(60,140,90,.35)';
  ctx.beginPath();
  ctx.moveTo(0,GROUND);
  var hillOffset=groundOffset*0.5;
  for(var x=0;x<=W;x+=40){
    ctx.lineTo(x, GROUND-30-Math.sin((x+hillOffset)*0.02)*14);
  }
  ctx.lineTo(W,GROUND); ctx.closePath(); ctx.fill();
}

function drawGround(){
  ctx.fillStyle='#ded18f';
  ctx.fillRect(0,GROUND,W,H-GROUND);
  ctx.fillStyle='#4caf50';
  ctx.fillRect(0,GROUND,W,8);
  ctx.fillStyle='rgba(255,255,255,.25)';
  ctx.fillRect(0,GROUND,W,2);

  ctx.fillStyle='rgba(0,0,0,.1)';
  var stripe=18;
  for(var x=-stripe;x<W+stripe;x+=stripe){
    ctx.fillRect(x+groundOffset%stripe,GROUND+10,9,4);
  }
}

function drawPipe(p){
  var grad=ctx.createLinearGradient(p.x,0,p.x+PIPE_W,0);
  grad.addColorStop(0,'#3f9142');
  grad.addColorStop(0.5,'#5ec262');
  grad.addColorStop(1,'#3f9142');
  ctx.fillStyle=grad;
  ctx.fillRect(p.x,0,PIPE_W,p.top);
  ctx.fillRect(p.x-4,p.top-18,PIPE_W+8,18);

  var bottomY=p.top+GAP;
  ctx.fillRect(p.x,bottomY,PIPE_W,GROUND-bottomY);
  ctx.fillRect(p.x-4,bottomY,PIPE_W+8,18);

  ctx.fillStyle='rgba(255,255,255,.22)';
  ctx.fillRect(p.x+6,0,6,p.top);
  ctx.fillRect(p.x+6,bottomY+18,6,GROUND-bottomY-18);

  ctx.fillStyle='rgba(0,0,0,.15)';
  ctx.fillRect(p.x,p.top-18,3,18);
  ctx.fillRect(p.x,bottomY,3,18);
}

function drawBird(t){
  ctx.save();
  ctx.translate(bird.x,bird.y);
  ctx.rotate(bird.rot);

  // motion glow
  ctx.save();
  ctx.globalAlpha=0.35;
  ctx.fillStyle='#ffe08a';
  ctx.beginPath(); ctx.arc(0,0,bird.r+6,0,Math.PI*2); ctx.fill();
  ctx.restore();

  var flapPhase=Math.sin(t*0.02)*0.5+0.5;

  ctx.fillStyle='#ffd166';
  ctx.beginPath();
  ctx.arc(0,0,bird.r,0,Math.PI*2);
  ctx.fill();

  // wing (animated flap)
  ctx.fillStyle='#f4a72e';
  ctx.beginPath();
  ctx.ellipse(-4,3-flapPhase*3,7,5,0.3,0,Math.PI*2);
  ctx.fill();

  // eye
  ctx.fillStyle='#fff';
  ctx.beginPath(); ctx.arc(6,-4,3.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#3a3f4b';
  ctx.beginPath();
  ctx.arc(7,-4,2.2,0,Math.PI*2);
  ctx.fill();

  // beak
  ctx.fillStyle='#ff8c42';
  ctx.beginPath();
  ctx.moveTo(11,0);
  ctx.lineTo(21,-2);
  ctx.lineTo(11,5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawParticles(){
  for(var i=particles.length-1;i>=0;i--){
    var p=particles[i];
    ctx.globalAlpha=Math.max(0,p.life);
    ctx.fillStyle='rgba('+p.color+','+Math.max(0,p.life)+')';
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
    p.vy+=0.08*dt;
    p.life-=0.045*dt;
    if(p.life<=0) particles.splice(i,1);
  }
}

function draw(t){
  ctx.save();
  if(shake>0){
    ctx.translate((Math.random()-0.5)*shake,(Math.random()-0.5)*shake);
  }

  drawBackground();
  for(var i=0;i<pipes.length;i++) drawPipe(pipes[i]);
  drawGround();
  drawBird(t);
  drawParticles();

  if(!started){
    ctx.fillStyle='rgba(15,25,35,.4)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.font='800 20px -apple-system,Arial,sans-serif';
    ctx.fillText('🐤 Flappy Bird',W/2,H/2-14);
    ctx.font='600 13px -apple-system,Arial,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.8)';
    ctx.fillText('Tap layar untuk terbang',W/2,H/2+14);
    ctx.textAlign='left';
  }

  if(gameOver){
    ctx.fillStyle='rgba(15,20,30,.55)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.font='800 26px -apple-system,Arial,sans-serif';
    ctx.fillText('GAME OVER',W/2,H/2-18);
    if(newRecord){
      ctx.fillStyle='#ffd166';
      ctx.font='700 14px -apple-system,Arial,sans-serif';
      ctx.fillText('🏆 REKOR BARU!',W/2,H/2+8);
    } else {
      ctx.fillStyle='rgba(255,255,255,.7)';
      ctx.font='600 13px -apple-system,Arial,sans-serif';
      ctx.fillText('Skor: '+score,W/2,H/2+8);
    }
    ctx.font='600 12px -apple-system,Arial,sans-serif';
    ctx.fillStyle='rgba(255,255,255,.65)';
    ctx.fillText('Tap layar untuk main lagi',W/2,H/2+32);
    ctx.textAlign='left';
  }

  ctx.restore();
}

function showCombo(streakVal){
  comboEl.textContent='COMBO x'+streakVal;
  comboEl.classList.remove('show');
  void comboEl.offsetWidth;
  comboEl.classList.add('show');
  clearTimeout(showCombo._t);
  showCombo._t=setTimeout(function(){ comboEl.classList.remove('show'); },550);
}

function bumpScore(){
  scoreEl.classList.remove('bump');
  void scoreEl.offsetWidth;
  scoreEl.classList.add('bump');
}

function flashScreen(){
  flashEl.style.transition='none';
  flashEl.style.opacity='0.55';
  requestAnimationFrame(function(){
    flashEl.style.transition='opacity .35s ease';
    flashEl.style.opacity='0';
  });
}

function update(dt,t){
  updateParticles(dt);
  if(shake>0) shake=Math.max(0,shake-0.6*dt);

  if(!started){ draw(t); return; }
  if(gameOver){ draw(t); return; }

  bird.vy+=0.36*dt;
  bird.y+=bird.vy*dt;
  bird.rot=Math.max(-0.5,Math.min(1.3,bird.vy*0.08));
  groundOffset-=PIPE_SPEED*dt;

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
      score++; streak++;
      scoreEl.textContent=String(score);
      bumpScore();
      sfxScore(streak);
      burst(bird.x,bird.y,'255,209,102',10);
      if(streak>1 && streak%2===0) showCombo(streak);
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

  draw(t);
}

function endGame(){
  if(gameOver) return;
  gameOver=true;
  streak=0;
  shake=8;
  flashScreen();
  burst(bird.x,bird.y,'255,107,107',22);
  sfxHit();
  if(score>best){
    best=score;
    newRecord=true;
    saveBest(best);
    setTimeout(sfxRecord,220);
  }
  bestEl.textContent=String(best);
  statusEl.textContent=newRecord?'🏆 Rekor baru! Tap untuk ulang':'Coba lagi?';
  statusEl.className='status '+(newRecord?'new':'over');
}

function loop(t){
  if(!last) last=t;
  var dt=Math.min(2,(t-last)/16.67);
  last=t;
  update(dt,t);
  requestAnimationFrame(loop);
}

draw(0);

document.addEventListener('pointerdown',function(e){ e.preventDefault(); flap(); },{passive:false});
document.addEventListener('keydown',function(e){
  if(e.code==='Space' || e.code==='ArrowUp'){ e.preventDefault(); flap(); }
});
document.addEventListener('visibilitychange',function(){
  if(document.hidden && audioCtx) audioCtx.suspend().catch(function(){});
});

requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "lunarielle-flappy-" + Date.now(),
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
                                    messageText: "LUNARIELLE • FLAPPY BIRD"
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