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
body{ margin:0; background:transparent; color:#e8ecf4; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:22px;
  overflow:hidden;
  background:#151726;
  box-shadow:0 14px 36px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.08);
}

.header{
  padding:15px 18px 10px;
  display:flex;
  justify-content:space-between;
  align-items:flex-end;
}

.brand{ display:flex; flex-direction:column; gap:2px; }
.eyebrow{ font-size:10px; letter-spacing:2.5px; color:rgba(232,236,244,.4); font-weight:700; }
.title{ font-size:19px; font-weight:800; letter-spacing:-.2px; }

.stats{ display:flex; gap:16px; }
.statBox{ text-align:right; }
.statLabel{ font-size:9px; letter-spacing:1.5px; color:rgba(232,236,244,.42); font-weight:700; }
.statVal{ font-size:16px; font-weight:800; color:#7ee787; font-variant-numeric:tabular-nums; }
.statVal.lines{ color:#79c0ff; }

.body{
  display:flex;
  gap:10px;
  padding:0 14px 12px;
}

.stage{
  flex:1;
  border-radius:10px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.1);
}
canvas{ display:block; width:100%; height:auto; }

.side{
  width:76px;
  display:flex;
  flex-direction:column;
  gap:8px;
}
.nextBox{
  border-radius:10px;
  background:rgba(255,255,255,.04);
  border:1px solid rgba(255,255,255,.08);
  padding:6px;
}
.nextLabel{ font-size:8px; letter-spacing:1.5px; color:rgba(232,236,244,.4); font-weight:700; text-align:center; margin-bottom:4px; }
#nextCanvas{ display:block; width:100%; height:auto; }

.footer{
  padding:0 18px 12px;
  text-align:center;
}
.status{ font-size:12px; font-weight:600; color:rgba(232,236,244,.55); letter-spacing:.3px; }
.status.over{ color:#ff7b7b; }

.pad{
  padding:0 14px 16px;
  display:grid;
  grid-template-columns:44px 44px 44px 44px;
  gap:6px;
  justify-content:center;
}
.padBtn{
  height:40px;
  border:none;
  border-radius:9px;
  background:rgba(255,255,255,.07);
  color:#e8ecf4;
  font-size:15px;
  font-weight:700;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.06);
}
.padBtn:active{ background:rgba(255,255,255,.14); }
</style>

<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">ZURE ARCADE</div>
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
      <div class="stage">
        <canvas id="game" width="200" height="400"></canvas>
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

var COLS=10, ROWS=20;
var CELL=canvas.width/COLS;

var COLORS={
  I:'#4dd0e1', O:'#ffd166', T:'#c792ea', S:'#7ee787',
  Z:'#ff7b7b', J:'#79c0ff', L:'#ffa657'
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

var grid, current, next, score=0, lines=0, gameOver=false, started=false;
var dropAcc=0, DROP_TIME=650, last=0;

function newGrid(){
  var g=[];
  for(var y=0;y<ROWS;y++){ g.push(new Array(COLS).fill(null)); }
  return g;
}

function randPiece(){
  var keys=Object.keys(SHAPES);
  var k=keys[Math.floor(Math.random()*keys.length)];
  return { type:k, cells:SHAPES[k].map(function(c){return [c[0],c[1]];}), x:3, y:0, color:COLORS[k] };
}

function reset(){
  grid=newGrid();
  current=randPiece();
  next=randPiece();
  score=0; lines=0; gameOver=false; started=true;
  dropAcc=0; DROP_TIME=650;
  scoreEl.textContent='0';
  linesEl.textContent='0';
  statusEl.textContent='Bermain...';
  statusEl.className='status';
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

function lockPiece(){
  var cells=cellsAt(current,current.x,current.y);
  for(var i=0;i<cells.length;i++){
    var x=cells[i][0], y=cells[i][1];
    if(y<0){ gameOver=true; return; }
    grid[y][x]=current.color;
  }
  clearLines();
  current=next;
  next=randPiece();
  if(collides(cellsAt(current,current.x,current.y))){
    gameOver=true;
  }
}

function clearLines(){
  var cleared=0;
  for(var y=ROWS-1;y>=0;y--){
    var full=true;
    for(var x=0;x<COLS;x++){ if(!grid[y][x]){ full=false; break; } }
    if(full){
      grid.splice(y,1);
      grid.unshift(new Array(COLS).fill(null));
      cleared++;
      y++;
    }
  }
  if(cleared>0){
    var points=[0,100,300,500,800][cleared]||1000;
    score+=points;
    lines+=cleared;
    scoreEl.textContent=String(score);
    linesEl.textContent=String(lines);
    DROP_TIME=Math.max(140,650-lines*18);
  }
}

function move(dx,dy){
  if(!started||gameOver) return;
  var cells=cellsAt(current,current.x+dx,current.y+dy);
  if(!collides(cells)){
    current.x+=dx;
    current.y+=dy;
    return true;
  }
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
  } else {
    // simple wall-kick attempt
    var kicked=cellsAt(current,current.x-1,current.y,rotated);
    if(!collides(kicked)){ current.x-=1; current.cells=rotated; return; }
    kicked=cellsAt(current,current.x+1,current.y,rotated);
    if(!collides(kicked)){ current.x+=1; current.cells=rotated; return; }
  }
}

function softDrop(){
  if(!started||gameOver){ reset(); return; }
  if(!move(0,1)){
    lockPiece();
  }
  dropAcc=0;
}

function drawCell(c,x,y,size,color){
  c.fillStyle=color;
  c.fillRect(x+1,y+1,size-2,size-2);
  c.fillStyle='rgba(255,255,255,.22)';
  c.fillRect(x+1,y+1,size-2,3);
  c.fillStyle='rgba(0,0,0,.18)';
  c.fillRect(x+1,y+size-4,size-2,3);
}

function draw(){
  ctx.fillStyle='#0d0f1a';
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.strokeStyle='rgba(255,255,255,.04)';
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
      if(grid[y][x]) drawCell(ctx,x*CELL,y*CELL,CELL,grid[y][x]);
    }
  }

  var cells=cellsAt(current,current.x,current.y);
  for(var i=0;i<cells.length;i++){
    var cx=cells[i][0], cy=cells[i][1];
    if(cy>=0) drawCell(ctx,cx*CELL,cy*CELL,CELL,current.color);
  }

  if(gameOver){
    ctx.fillStyle='rgba(10,10,20,.72)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#fff';
    ctx.textAlign='center';
    ctx.font='800 17px -apple-system,Arial,sans-serif';
    ctx.fillText('GAME OVER',canvas.width/2,canvas.height/2-10);
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
    drawCell(nctx,offX+c[0]*size,offY+c[1]*size,size,next.color);
  }
}

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

  draw();
  drawNext();
  requestAnimationFrame(loop);
}

document.getElementById('btnLeft').addEventListener('pointerdown',function(e){ e.preventDefault(); if(!started||gameOver){reset();return;} move(-1,0); });
document.getElementById('btnRight').addEventListener('pointerdown',function(e){ e.preventDefault(); if(!started||gameOver){reset();return;} move(1,0); });
document.getElementById('btnRotate').addEventListener('pointerdown',function(e){ e.preventDefault(); if(!started||gameOver){reset();return;} rotate(); });
document.getElementById('btnDown').addEventListener('pointerdown',function(e){ e.preventDefault(); softDrop(); });

document.addEventListener('keydown',function(e){
  if(e.code==='ArrowLeft'){ e.preventDefault(); if(!started||gameOver){reset();return;} move(-1,0); }
  else if(e.code==='ArrowRight'){ e.preventDefault(); if(!started||gameOver){reset();return;} move(1,0); }
  else if(e.code==='ArrowUp'){ e.preventDefault(); if(!started||gameOver){reset();return;} rotate(); }
  else if(e.code==='ArrowDown'){ e.preventDefault(); softDrop(); }
  else if(e.code==='Space'){ e.preventDefault(); if(!started||gameOver){reset();} }
});

draw();
drawNext();
requestAnimationFrame(loop);
})();
</script>`;

        const responseData = {
            response_id: "zure-tetris-" + Date.now(),
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
                                    messageText: "ZURE • TETRIS"
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
