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
body{ margin:0; background:transparent; color:#eef1f7; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; touch-action:manipulation; }

.wrap{ width:100%; max-width:420px; margin:auto; padding:14px; }

.card{
  position:relative;
  border-radius:22px;
  overflow:hidden;
  background:#1a1d2e;
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
.eyebrow{ font-size:10px; letter-spacing:2.5px; color:rgba(238,241,247,.4); font-weight:700; }
.title{ font-size:19px; font-weight:800; letter-spacing:-.2px; }

.scoreBox{ text-align:right; }
.scoreNow{ font-size:22px; font-weight:800; color:#8ecbff; font-variant-numeric:tabular-nums; text-shadow:0 0 14px rgba(142,203,255,.3); }
.scoreBest{ font-size:10px; color:rgba(238,241,247,.45); margin-top:1px; }
.scoreBest b{ color:rgba(238,241,247,.75); }

.stage{ padding:0 16px; }
canvas#board{ display:block; width:100%; height:auto; border-radius:10px; border:1px solid rgba(255,255,255,.08); }

.trayLabel{
  padding:12px 18px 4px;
  font-size:9px;
  letter-spacing:1.5px;
  color:rgba(238,241,247,.4);
  font-weight:700;
  text-align:center;
}

.tray{
  display:flex;
  justify-content:center;
  gap:10px;
  padding:2px 16px 16px;
}

.trayPiece{
  width:74px;
  height:74px;
  border-radius:12px;
  background:rgba(255,255,255,.04);
  border:1.5px solid rgba(255,255,255,.08);
  display:flex;
  align-items:center;
  justify-content:center;
  transition:transform .1s ease, border-color .15s ease;
}
.trayPiece canvas{ display:block; }
.trayPiece.selected{
  border-color:#8ecbff;
  background:rgba(142,203,255,.1);
  transform:scale(1.06);
}
.trayPiece.used{ opacity:.15; pointer-events:none; }

.footer{
  padding:0 18px 16px;
  text-align:center;
}
.status{ font-size:12px; font-weight:600; color:rgba(238,241,247,.55); letter-spacing:.3px; }
.status.over{ color:#ff7b7b; }
</style>

<div class="wrap">
  <div class="card">

    <div class="header">
      <div class="brand">
        <div class="eyebrow">ZURE ARCADE</div>
        <div class="title">🟦 Block Blast</div>
      </div>
      <div class="scoreBox">
        <div class="scoreNow" id="score">0</div>
        <div class="scoreBest">BEST <b id="best">0</b></div>
      </div>
    </div>

    <div class="stage">
      <canvas id="board" width="320" height="320"></canvas>
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

var SIZE=8;
var CELL=boardCanvas.width/SIZE;

var COLORS=['#8ecbff','#ffd166','#ff8fa3','#7ee787','#c792ea','#ffa657'];

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

var board, score=0, best=0, gameOver=false, tray=[], selectedIdx=-1;

try{ best=Number(localStorage.getItem('zure_blast_best')||0); }catch(e){}
bestEl.textContent=String(best);

function emptyBoard(){
  var b=[];
  for(var y=0;y<SIZE;y++) b.push(new Array(SIZE).fill(null));
  return b;
}

function randShape(){
  var s=SHAPES[Math.floor(Math.random()*SHAPES.length)];
  var color=COLORS[Math.floor(Math.random()*COLORS.length)];
  return { cells:s.map(function(c){return [c[0],c[1]];}), color:color };
}

function refillTray(){
  tray=[randShape(),randShape(),randShape()];
  selectedIdx=-1;
  renderTray();
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

function placeShape(shape,ox,oy){
  for(var i=0;i<shape.cells.length;i++){
    var x=ox+shape.cells[i][0], y=oy+shape.cells[i][1];
    board[y][x]=shape.color;
  }
  score+=shape.cells.length;
  clearFull();
  scoreEl.textContent=String(score);
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
      for(var x2=0;x2<SIZE;x2++) board[rowsToClear[i]][x2]=null;
    }
    for(var j=0;j<colsToClear.length;j++){
      for(var y2=0;y2<SIZE;y2++) board[y2][colsToClear[j]]=null;
    }
    score += cleared*10*cleared;
    scoreEl.textContent=String(score);
    statusEl.textContent = cleared>1 ? 'Combo! +'+ (cleared*10*cleared) : '+'+ (cleared*10*cleared);
    statusEl.className='status';
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
  refillTray();
  drawBoard();
}

function drawCellBlock(c,x,y,size,color){
  c.fillStyle=color;
  c.fillRect(x+1,y+1,size-2,size-2);
  c.fillStyle='rgba(255,255,255,.25)';
  c.fillRect(x+1,y+1,size-2,3);
  c.fillStyle='rgba(0,0,0,.15)';
  c.fillRect(x+1,y+size-4,size-2,3);
}

function drawBoard(){
  bctx.fillStyle='#11131f';
  bctx.fillRect(0,0,boardCanvas.width,boardCanvas.height);

  bctx.strokeStyle='rgba(255,255,255,.06)';
  for(var i=0;i<=SIZE;i++){
    var w = (i%4===0)?1.6:0.7;
    bctx.lineWidth=w;
    bctx.beginPath(); bctx.moveTo(i*CELL,0); bctx.lineTo(i*CELL,boardCanvas.height); bctx.stroke();
    bctx.beginPath(); bctx.moveTo(0,i*CELL); bctx.lineTo(boardCanvas.width,i*CELL); bctx.stroke();
  }

  for(var y=0;y<SIZE;y++){
    for(var x=0;x<SIZE;x++){
      if(board[y][x]) drawCellBlock(bctx,x*CELL,y*CELL,CELL,board[y][x]);
    }
  }

  if(gameOver){
    bctx.fillStyle='rgba(10,10,20,.75)';
    bctx.fillRect(0,0,boardCanvas.width,boardCanvas.height);
    bctx.fillStyle='#fff';
    bctx.textAlign='center';
    bctx.font='800 20px -apple-system,Arial,sans-serif';
    bctx.fillText('PAPAN PENUH',boardCanvas.width/2,boardCanvas.height/2-8);
    bctx.font='600 12px -apple-system,Arial,sans-serif';
    bctx.fillText('Skor '+score+' — ketuk untuk ulang',boardCanvas.width/2,boardCanvas.height/2+16);
    bctx.textAlign='left';
  }
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
        drawCellBlock(pctx,offX+cell[0]*cs,offY+cell[1]*cs,cs,shape.color);
      }
      el.appendChild(c);
      el.addEventListener('pointerdown',function(e){
        e.preventDefault();
        if(gameOver || shape.used) return;
        selectedIdx = (selectedIdx===idx) ? -1 : idx;
        renderTray();
      });
      trayEl.appendChild(el);
    })(i);
  }
}

boardCanvas.addEventListener('pointerdown',function(e){
  e.preventDefault();
  if(gameOver){ reset(); return; }
  if(selectedIdx<0){
    statusEl.textContent='Pilih blok dulu di bawah';
    return;
  }
  var rect=boardCanvas.getBoundingClientRect();
  var scaleX=boardCanvas.width/rect.width;
  var scaleY=boardCanvas.height/rect.height;
  var px=(e.clientX-rect.left)*scaleX;
  var py=(e.clientY-rect.top)*scaleY;
  var gx=Math.floor(px/CELL), gy=Math.floor(py/CELL);

  var shape=tray[selectedIdx];
  if(!shape || shape.used) return;

  if(canPlace(shape,gx,gy)){
    placeShape(shape,gx,gy);
    shape.used=true;
    selectedIdx=-1;

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
        try{ localStorage.setItem('zure_blast_best',String(best)); }catch(e){}
      }
      bestEl.textContent=String(best);
      statusEl.textContent='Papan penuh!';
      statusEl.className='status over';
      drawBoard();
    }
  } else {
    statusEl.textContent='Tidak muat di sana';
  }
},{passive:false});

reset();
})();
</script>`;

        const responseData = {
            response_id: "zure-blockblast-" + Date.now(),
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
                                    messageText: "ZURE • BLOCK BLAST"
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
