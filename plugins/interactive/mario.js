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
// plugins/interactive/mario.js

import { sendRichHtml } from '../../lib/richmessage.js'

export default async function mario(m, { conn, args, text, command }) {

    const targetChat = m.chat;

    const html = `

<style>
*{
  box-sizing:border-box;
  margin:0;
  padding:0;
  user-select:none;
  -webkit-user-select:none;
  -webkit-tap-highlight-color:transparent;
  font-family:Arial,Segoe UI,sans-serif;
}

html,body{
  width:100%;
  min-height:100%;
  background:#111;
}

.game{
  width:100%;
  max-width:430px;
  margin:auto;
  background:#151515;
  color:white;
  overflow:hidden;
  border-radius:18px;
}

.header{
  padding:13px 14px;
  background:#191919;
  display:flex;
  align-items:center;
  justify-content:space-between;
}

.logo{
  font-size:17px;
  font-weight:900;
  white-space:nowrap;
}

.stats{
  display:flex;
  gap:7px;
}

.stat{
  background:#242424;
  padding:5px 7px;
  border-radius:8px;
  font-size:11px;
  font-weight:bold;
}

.canvasWrap{
  position:relative;
  width:100%;
  background:#79c9ff;
}

canvas{
  display:block;
  width:100%;
  height:auto;
  background:#79c9ff;
}

.startScreen,
.winScreen,
.gameOverScreen{
  position:absolute;
  inset:0;
  z-index:20;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:20px;
  background:rgba(0,0,0,.72);
}

.startBox,
.winBox,
.gameOverBox{
  width:92%;
  max-width:350px;
  background:#181818;
  border:2px solid #fff;
  border-radius:18px;
  padding:22px 17px;
  box-shadow:0 10px 35px rgba(0,0,0,.5);
}

.startBox h1,
.winBox h1,
.gameOverBox h1{
  font-size:27px;
  margin-bottom:8px;
}

.startBox p,
.winBox p,
.gameOverBox p{
  color:#ddd;
  font-size:13px;
  line-height:1.5;
}

.stageTitle{
  color:#ffd43b;
  font-size:15px;
  font-weight:bold;
  margin-bottom:5px;
}

.bigWin{
  font-size:34px !important;
  font-weight:1000;
  line-height:1.1 !important;
}

.winText{
  margin-top:10px;
  font-size:14px !important;
}

.result{
  margin:14px 0;
  padding:10px;
  border-radius:10px;
  background:#252525;
  font-size:13px;
  line-height:1.8;
}

button{
  border:0;
  outline:0;
  cursor:pointer;
}

.startBtn,
.nextBtn,
.restartBtn{
  margin-top:14px;
  width:100%;
  padding:13px;
  border-radius:11px;
  background:#fff;
  color:#111;
  font-size:15px;
  font-weight:900;
}

.controls{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:12px 13px;
  background:#181818;
}

.leftControls{
  display:flex;
  gap:9px;
}

.ctrl{
  width:55px;
  height:48px;
  border-radius:13px;
  background:#292929;
  color:white;
  font-size:22px;
  font-weight:bold;
  display:flex;
  align-items:center;
  justify-content:center;
  border:1px solid #3d3d3d;
  touch-action:none;
}

.jump{
  width:76px;
  background:#333;
  font-size:15px;
}

.ctrl:active{
  transform:scale(.94);
  background:#444;
}

.footer{
  text-align:center;
  padding:8px;
  color:#777;
  font-size:9px;
  letter-spacing:.5px;
}
</style>

<div class="game">

  <div class="header">
    <div class="logo">🍄 MARIO RUNNER</div>

    <div class="stats">
      <div class="stat">🏁 <span id="stage">1</span>/5</div>
      <div class="stat">🪙 <span id="coins">0</span></div>
      <div class="stat">⭐ <span id="score">0</span></div>
      <div class="stat">❤️ <span id="lives">3</span></div>
    </div>
  </div>

  <div class="canvasWrap">

    <canvas id="gameCanvas" width="800" height="500"></canvas>

    <div class="startScreen" id="startScreen">
      <div class="startBox">
        <div class="stageTitle" id="startStage">WORLD 1</div>
        <h1 id="startTitle">🍄 MARIO RUNNER</h1>
        <p id="startText">
          Selesaikan semua stage sampai Stage 5!
          <br>
          Jangan jatuh dan hati-hati dengan musuh.
        </p>

        <button class="startBtn" id="startBtn">
          ▶ MULAI
        </button>
      </div>
    </div>

    <div class="winScreen" id="winScreen" style="display:none">
      <div class="winBox">

        <div class="bigWin">🏆 YOU WIN! 🏆</div>

        <p class="winText">
          🎉 SELAMAT! 🎉<br>
          Kamu berhasil menyelesaikan
          <b>5 STAGE</b> Mario Runner!
        </p>

        <div class="result">
          🏁 Semua Stage Selesai<br>
          ⭐ Score: <b id="finalScore">0</b><br>
          🪙 Coins: <b id="finalCoins">0</b>
        </div>

        <button class="restartBtn" id="restartBtn">
          🔄 MAIN LAGI
        </button>

      </div>
    </div>

    <div class="gameOverScreen" id="gameOverScreen" style="display:none">
      <div class="gameOverBox">

        <h1>💀 GAME OVER</h1>

        <p>
          Semua nyawa habis!
          <br>
          Coba lagi dan selesaikan 5 stage.
        </p>

        <div class="result">
          🏁 Stage: <b id="overStage">1</b>/5<br>
          ⭐ Score: <b id="overScore">0</b><br>
          🪙 Coins: <b id="overCoins">0</b>
        </div>

        <button class="restartBtn" id="restartGameBtn">
          🔄 COBA LAGI
        </button>

      </div>
    </div>

  </div>

  <div class="controls">

    <div class="leftControls">

      <button class="ctrl" id="leftBtn">
        ◀
      </button>

      <button class="ctrl" id="rightBtn">
        ▶
      </button>

    </div>

    <button class="ctrl jump" id="jumpBtn">
      ⬆ JUMP
    </button>

  </div>

  <div class="footer">
    MARIO RUNNER • 5 STAGE EDITION 🎮
  </div>

</div>

<script>

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const stageEl = document.getElementById("stage");
const coinsEl = document.getElementById("coins");
const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");

const startScreen = document.getElementById("startScreen");
const startStage = document.getElementById("startStage");
const startTitle = document.getElementById("startTitle");
const startText = document.getElementById("startText");
const startBtn = document.getElementById("startBtn");

const winScreen = document.getElementById("winScreen");
const gameOverScreen = document.getElementById("gameOverScreen");

const finalScore = document.getElementById("finalScore");
const finalCoins = document.getElementById("finalCoins");

const overStage = document.getElementById("overStage");
const overScore = document.getElementById("overScore");
const overCoins = document.getElementById("overCoins");

const restartBtn = document.getElementById("restartBtn");
const restartGameBtn = document.getElementById("restartGameBtn");

/* =========================
   GAME STATE
========================= */

let running = false;
let gameOver = false;

let stage = 1;

let score = 0;
let coins = 0;
let lives = 3;

let cameraX = 0;

let left = false;
let right = false;

let platforms = [];
let originalCoins = [];
let enemies = [];

const gravity = 0.55;

/* =========================
   PLAYER
========================= */

const player = {
  x:100,
  y:300,

  w:34,
  h:44,

  vx:0,
  vy:0,

  speed:4.4,
  jump:12,

  grounded:false,
  invincible:0,
  facing:1,
  walkFrame:0
};

/* =========================
   STAGE DATA
========================= */

const stages = [

/* =========================
   STAGE 1
========================= */

{
  width:3800,
  flagX:3550,

  platforms:[
    {x:0,y:430,w:1000,h:70},
    {x:1100,y:430,w:550,h:70},
    {x:1750,y:430,w:800,h:70},
    {x:2670,y:430,w:1000,h:70},

    {x:700,y:350,w:150,h:20},
    {x:1250,y:340,w:170,h:20},
    {x:1510,y:290,w:140,h:20},
    {x:1880,y:350,w:150,h:20},
    {x:2150,y:300,w:170,h:20},
    {x:2800,y:340,w:170,h:20},
    {x:3150,y:280,w:180,h:20}
  ],

  coins:[
    [250,380],
    [430,380],
    [740,310],
    [790,310],
    [1200,380],
    [1300,300],
    [1550,250],
    [1600,250],
    [1900,310],
    [2200,260],
    [2850,300],
    [2920,300],
    [3200,240],
    [3350,380]
  ],

  enemies:[
    [500,400,400,850],
    [1150,400,1100,1600],
    [1850,400,1750,2300],
    [2750,400,2670,3500]
  ]
},

/* =========================
   STAGE 2
========================= */

{
  width:3700,
  flagX:3450,

  platforms:[
    {x:0,y:430,w:700,h:70},
    {x:780,y:430,w:720,h:70},
    {x:1580,y:430,w:720,h:70},
    {x:2380,y:430,w:1220,h:70},

    {x:420,y:350,w:150,h:20},
    {x:900,y:340,w:160,h:20},
    {x:1200,y:290,w:150,h:20},
    {x:1680,y:350,w:150,h:20},
    {x:1950,y:300,w:170,h:20},
    {x:2500,y:340,w:170,h:20},
    {x:2850,y:290,w:170,h:20},
    {x:3250,y:340,w:170,h:20}
  ],

  coins:[
    [300,380],
    [470,310],
    [950,300],
    [1240,250],
    [1710,310],
    [2000,260],
    [2550,300],
    [2900,250],
    [3300,300],
    [3500,380]
  ],

  enemies:[
    [450,400,0,680],
    [1000,400,780,1500],
    [1750,400,1580,2300],
    [2550,400,2380,3500]
  ]
},

/* =========================
   STAGE 3
========================= */

{
  width:3800,
  flagX:3550,

  platforms:[
    {x:0,y:430,w:850,h:70},
    {x:930,y:430,w:520,h:70},
    {x:1530,y:430,w:620,h:70},
    {x:2230,y:430,w:600,h:70},
    {x:2910,y:430,w:800,h:70},

    {x:600,y:340,w:150,h:20},
    {x:1050,y:350,w:160,h:20},
    {x:1280,y:290,w:150,h:20},
    {x:1650,y:350,w:160,h:20},
    {x:1900,y:290,w:150,h:20},
    {x:2350,y:340,w:170,h:20},
    {x:2600,y:280,w:160,h:20},
    {x:3050,y:340,w:170,h:20},
    {x:3300,y:280,w:180,h:20}
  ],

  coins:[
    [300,380],
    [650,300],
    [1080,310],
    [1320,250],
    [1690,310],
    [1940,250],
    [2400,300],
    [2650,240],
    [3100,300],
    [3350,240],
    [3500,380]
  ],

  enemies:[
    [500,400,0,850],
    [1100,400,930,1450],
    [1700,400,1530,2150],
    [2400,400,2230,2830],
    [3100,400,2910,3650]
  ]
},

/* =========================
   STAGE 4
========================= */

{
  width:4000,
  flagX:3750,

  platforms:[
    {x:0,y:430,w:550,h:70},
    {x:630,y:430,w:570,h:70},
    {x:1280,y:430,w:570,h:70},
    {x:1930,y:430,w:520,h:70},
    {x:2530,y:430,w:600,h:70},
    {x:3210,y:430,w:750,h:70},

    {x:300,y:340,w:150,h:20},
    {x:800,y:330,w:170,h:20},
    {x:1370,y:340,w:160,h:20},
    {x:1600,y:280,w:150,h:20},
    {x:2020,y:330,w:170,h:20},
    {x:2700,y:340,w:160,h:20},
    {x:2920,y:280,w:160,h:20},
    {x:3370,y:330,w:180,h:20},
    {x:3600,y:270,w:170,h:20}
  ],

  coins:[
    [250,380],
    [350,300],
    [850,290],
    [1420,300],
    [1650,240],
    [2070,290],
    [2750,300],
    [2970,240],
    [3420,290],
    [3650,230],
    [3800,380]
  ],

  enemies:[
    [350,400,0,550],
    [850,400,630,1200],
    [1450,400,1280,1850],
    [2100,400,1930,2450],
    [2750,400,2530,3130],
    [3450,400,3210,3950]
  ]
},

/* =========================
   STAGE 5
========================= */

{
  width:4100,
  flagX:3850,

  platforms:[
    {x:0,y:430,w:800,h:70},
    {x:880,y:430,w:420,h:70},
    {x:1380,y:430,w:520,h:70},
    {x:1980,y:430,w:520,h:70},
    {x:2580,y:430,w:470,h:70},
    {x:3130,y:430,w:900,h:70},

    {x:500,y:340,w:170,h:20},
    {x:950,y:330,w:170,h:20},
    {x:1450,y:340,w:170,h:20},
    {x:1600,y:270,w:150,h:20},
    {x:2050,y:330,w:180,h:20},
    {x:2250,y:270,w:150,h:20},
    {x:2700,y:340,w:170,h:20},
    {x:2900,y:270,w:150,h:20},
    {x:3300,y:330,w:180,h:20},
    {x:3500,y:260,w:170,h:20},
    {x:3750,y:330,w:180,h:20}
  ],

  coins:[
    [300,380],
    [550,290],
    [1000,280],
    [1500,290],
    [1650,220],
    [2100,280],
    [2300,220],
    [2750,290],
    [2950,220],
    [3350,280],
    [3550,210],
    [3800,280],
    [3950,380]
  ],

  enemies:[
    [500,400,0,800],
    [1000,400,880,1300],
    [1500,400,1380,1900],
    [2100,400,1980,2500],
    [2750,400,2580,3050],
    [3350,400,3130,4030]
  ]
}

];

/* =========================
   LOAD STAGE
========================= */

function loadStage(n){

  const data = stages[n-1];

  platforms = data.platforms.map(p => ({...p}));

  originalCoins = data.coins.map(c => ({
    x:c[0],
    y:c[1],
    collected:false
  }));

  enemies = data.enemies.map(e => ({
    x:e[0],
    y:e[1],
    min:e[2],
    max:e[3],
    dir:1,
    speed:1.2
  }));

  player.x = 100;
  player.y = 300;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.invincible = 80;

  cameraX = 0;

  stageEl.textContent = n;

}

/* =========================
   START GAME
========================= */

function startGame(){

  stage = 1;
  score = 0;
  coins = 0;
  lives = 3;

  gameOver = false;

  loadStage(stage);

  updateStats();

  startScreen.style.display = "none";
  winScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  running = true;

  requestAnimationFrame(loop);
}

/* =========================
   NEXT STAGE
========================= */

function nextStage(){

  running = false;

  if(stage >= 5){
    finishGame();
    return;
  }

  stage++;

  loadStage(stage);

  startStage.textContent = "WORLD " + stage;
  startTitle.textContent = "🏁 STAGE " + stage;
  startText.innerHTML =
    "Stage sebelumnya selesai!<br>" +
    "Siap lanjut ke stage berikutnya?";

  startBtn.textContent = "▶ LANJUT STAGE";

  startScreen.style.display = "flex";

  updateStats();
}

/* =========================
   FINAL WIN
========================= */

function finishGame(){

  running = false;
  gameOver = false;

  finalScore.textContent = score;
  finalCoins.textContent = coins;

  winScreen.style.display = "flex";

}

/* =========================
   GAME OVER
========================= */

function loseGame(){

  running = false;
  gameOver = true;

  overStage.textContent = stage;
  overScore.textContent = score;
  overCoins.textContent = coins;

  gameOverScreen.style.display = "flex";

}

/* =========================
   RESTART
========================= */

restartBtn.addEventListener("click", () => {

  winScreen.style.display = "none";

  startStage.textContent = "WORLD 1";
  startTitle.textContent = "🍄 MARIO RUNNER";
  startText.innerHTML =
    "Selesaikan semua stage sampai Stage 5!" +
    "<br>" +
    "Jangan jatuh dan hati-hati dengan musuh.";

  startBtn.textContent = "▶ MULAI";

  startScreen.style.display = "flex";

});

restartGameBtn.addEventListener("click", () => {

  gameOverScreen.style.display = "none";

  startStage.textContent = "WORLD 1";
  startTitle.textContent = "🍄 MARIO RUNNER";
  startText.innerHTML =
    "Selesaikan semua stage sampai Stage 5!" +
    "<br>" +
    "Jangan jatuh dan hati-hati dengan musuh.";

  startBtn.textContent = "▶ MULAI";

  startScreen.style.display = "flex";

});

startBtn.addEventListener("click", () => {

  if(stage > 1){
    startScreen.style.display = "none";
    running = true;
    requestAnimationFrame(loop);
  }else{
    startGame();
  }

});

/* =========================
   STATS
========================= */

function updateStats(){

  stageEl.textContent = stage;
  coinsEl.textContent = coins;
  scoreEl.textContent = score;
  livesEl.textContent = lives;

}

/* =========================
   COLLISION
========================= */

function collide(a,b){

  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );

}

/* =========================
   MOVEMENT
========================= */

function update(){

  if(!running) return;

  /* horizontal */

  if(left && !right){

    player.vx = -player.speed;
    player.facing = -1;

  }else if(right && !left){

    player.vx = player.speed;
    player.facing = 1;

  }else{

    player.vx *= .75;

  }

  player.x += player.vx;

  if(player.x < 0){
    player.x = 0;
  }

  /* =========================
     SAVE PREVIOUS POSITION
  ========================= */

  const previousY = player.y;
  const previousTop = previousY;
  const previousBottom = previousY + player.h;

  /* gravity */

  player.vy += gravity;

  player.y += player.vy;

  player.grounded = false;

  /* =========================
     SOLID PLATFORM COLLISION
  ========================= */

  for(const p of platforms){

    const horizontal =
      player.x + player.w > p.x &&
      player.x < p.x + p.w;

    if(!horizontal) continue;

    const currentTop = player.y;
    const currentBottom = player.y + player.h;

    /* =========================
       FALLING → LAND ON TOP
    ========================= */

    if(
      player.vy >= 0 &&
      previousBottom <= p.y &&
      currentBottom >= p.y
    ){

      player.y = p.y - player.h;

      player.vy = 0;

      player.grounded = true;

    }

    /* =========================
       RISING → HIT UNDERSIDE
    ========================= */

    else if(
      player.vy < 0 &&
      previousTop >= p.y + p.h &&
      currentTop <= p.y + p.h
    ){

      /*
       * MARIO MENYUNDUL BAGIAN BAWAH PLATFORM
       */

      player.y = p.y + p.h;

      player.vy = 0;

    }

  }

  /* =========================
     JUMP
  ========================= */

  if(
    jumpPressed &&
    player.grounded
  ){

    player.vy = -player.jump;
    player.grounded = false;

  }

  jumpPressed = false;

  /* =========================
     FALL INTO HOLE
  ========================= */

  if(player.y > 560){

    loseLife();

    return;

  }

  /* =========================
     ENEMY MOVEMENT
  ========================= */

  for(const e of enemies){

    e.x += e.dir * e.speed;

    if(e.x <= e.min){
      e.x = e.min;
      e.dir = 1;
    }

    if(e.x >= e.max){
      e.x = e.max;
      e.dir = -1;
    }

    const enemyBox = {
      x:e.x,
      y:e.y,
      w:34,
      h:30
    };

    if(
      player.invincible <= 0 &&
      collide(player,enemyBox)
    ){

      loseLife();

      return;

    }

  }

  /* =========================
     COINS
  ========================= */

  for(const c of originalCoins){

    if(c.collected) continue;

    const coinBox = {
      x:c.x-10,
      y:c.y-10,
      w:20,
      h:20
    };

    if(collide(player,coinBox)){

      c.collected = true;

      coins++;

      score += 100;

    }

  }

  /* =========================
     INVINCIBILITY
  ========================= */

  if(player.invincible > 0){
    player.invincible--;
  }

  /* =========================
     WALK ANIMATION
  ========================= */

  if(Math.abs(player.vx) > .5){

    player.walkFrame += .2;

  }

  /* =========================
     CAMERA
  ========================= */

  cameraX = Math.max(
    0,
    player.x - 250
  );

  /* =========================
     FINISH FLAG
  ========================= */

  const currentStage = stages[stage-1];

  if(player.x >= currentStage.flagX){

    nextStage();

    return;

  }

  updateStats();

}

/* =========================
   LOSE LIFE
========================= */

function loseLife(){

  lives--;

  updateStats();

  if(lives <= 0){

    loseGame();

    return;

  }

  player.x = 100;
  player.y = 300;

  player.vx = 0;
  player.vy = 0;

  player.invincible = 120;

  cameraX = 0;

}

/* =========================
   DRAW SKY
========================= */

function drawSky(){

  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    500
  );

  gradient.addColorStop(0,"#55b8ff");
  gradient.addColorStop(1,"#dff5ff");

  ctx.fillStyle = gradient;

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

}

/* =========================
   CLOUDS
========================= */

function drawCloud(x,y){

  ctx.fillStyle = "rgba(255,255,255,.9)";

  ctx.beginPath();

  ctx.arc(x,y,25,0,Math.PI*2);
  ctx.arc(x+28,y-10,32,0,Math.PI*2);
  ctx.arc(x+60,y,25,0,Math.PI*2);

  ctx.fill();

}

function drawClouds(){

  drawCloud(100-cameraX*.15,80);
  drawCloud(420-cameraX*.12,120);
  drawCloud(760-cameraX*.10,65);
  drawCloud(1100-cameraX*.15,100);
  drawCloud(1500-cameraX*.1,70);
  drawCloud(1900-cameraX*.12,110);
  drawCloud(2300-cameraX*.1,70);
  drawCloud(2700-cameraX*.12,110);
  drawCloud(3200-cameraX*.1,70);
  drawCloud(3600-cameraX*.1,100);

}

/* =========================
   HILLS
========================= */

function drawHills(){

  ctx.fillStyle = "#72c96c";

  ctx.beginPath();

  ctx.moveTo(0,430);

  for(let x=0;x<=900;x+=100){

    const y =
      340 +
      Math.sin(
        (x+cameraX*.2)/180
      )*35;

    ctx.lineTo(x,y);

  }

  ctx.lineTo(900,500);
  ctx.lineTo(0,500);

  ctx.fill();

  ctx.fillStyle = "#4fa958";

  ctx.beginPath();

  ctx.moveTo(0,450);

  for(let x=0;x<=900;x+=120){

    const y =
      380 +
      Math.sin(
        (x+cameraX*.15)/170
      )*30;

    ctx.lineTo(x,y);

  }

  ctx.lineTo(900,500);
  ctx.lineTo(0,500);

  ctx.fill();

}

/* =========================
   PLATFORMS
========================= */

function drawPlatforms(){

  for(const p of platforms){

    const x = p.x - cameraX;

    if(
      x + p.w < 0 ||
      x > canvas.width
    ) continue;

    ctx.fillStyle = "#8b572a";

    ctx.fillRect(
      x,
      p.y,
      p.w,
      p.h
    );

    ctx.fillStyle = "#36a83b";

    ctx.fillRect(
      x,
      p.y,
      p.w,
      9
    );

    ctx.fillStyle = "rgba(0,0,0,.12)";

    for(
      let bx=x+12;
      bx<x+p.w;
      bx+=35
    ){

      ctx.fillRect(
        bx,
        p.y+17,
        18,
        4
      );

    }

  }

}

/* =========================
   COINS
========================= */

function drawCoins(){

  for(const c of originalCoins){

    if(c.collected) continue;

    const x = c.x-cameraX;

    if(x < -30 || x > canvas.width+30)
      continue;

    ctx.fillStyle = "#ffd43b";

    ctx.beginPath();

    ctx.arc(
      x,
      c.y,
      9,
      0,
      Math.PI*2
    );

    ctx.fill();

    ctx.fillStyle = "#fff1a6";

    ctx.beginPath();

    ctx.arc(
      x-3,
      c.y-3,
      3,
      0,
      Math.PI*2
    );

    ctx.fill();

  }

}

/* =========================
   ENEMIES
========================= */

function drawEnemies(){

  for(const e of enemies){

    const x = e.x-cameraX;

    if(x < -50 || x > canvas.width+50)
      continue;

    /* body */

    ctx.fillStyle = "#7b3f1d";

    ctx.fillRect(
      x,
      e.y,
      34,
      30
    );

    /* head */

    ctx.fillStyle = "#a85828";

    ctx.beginPath();

    ctx.arc(
      x+17,
      e.y,
      17,
      0,
      Math.PI*2
    );

    ctx.fill();

    /* eyes */

    ctx.fillStyle = "#fff";

    ctx.fillRect(
      x+7,
      e.y-3,
      7,
      7
    );

    ctx.fillRect(
      x+20,
      e.y-3,
      7,
      7
    );

    ctx.fillStyle = "#111";

    ctx.fillRect(
      x+9,
      e.y-1,
      3,
      3
    );

    ctx.fillRect(
      x+22,
      e.y-1,
      3,
      3
    );

    /* feet */

    ctx.fillStyle = "#43200f";

    ctx.fillRect(
      x-3,
      e.y+25,
      15,
      7
    );

    ctx.fillRect(
      x+22,
      e.y+25,
      15,
      7
    );

  }

}

/* =========================
   FLAG
========================= */

function drawFlag(){

  const flagX =
    stages[stage-1].flagX -
    cameraX;

  ctx.fillStyle = "#555";

  ctx.fillRect(
    flagX,
    300,
    7,
    130
  );

  ctx.fillStyle = "#ff3b30";

  ctx.beginPath();

  ctx.moveTo(
    flagX+7,
    305
  );

  ctx.lineTo(
    flagX+65,
    325
  );

  ctx.lineTo(
    flagX+7,
    345
  );

  ctx.closePath();

  ctx.fill();

  ctx.fillStyle = "#ffd43b";

  ctx.beginPath();

  ctx.arc(
    flagX+3,
    298,
    7,
    0,
    Math.PI*2
  );

  ctx.fill();

}

/* =========================
   PLAYER
========================= */

function drawPlayer(){

  if(
    player.invincible > 0 &&
    Math.floor(player.invincible/6)%2===0
  ){
    return;
  }

  const x =
    player.x-cameraX;

  const y =
    player.y;

  ctx.save();

  if(player.facing === -1){

    ctx.translate(
      x+player.w,
      0
    );

    ctx.scale(-1,1);

  }else{

    ctx.translate(
      x,
      0
    );

  }

  /* legs */

  ctx.fillStyle = "#5a2d82";

  ctx.fillRect(
    7,
    y+30,
    8,
    14
  );

  ctx.fillRect(
    21,
    y+30,
    8,
    14
  );

  /* shoes */

  ctx.fillStyle = "#32144e";

  ctx.fillRect(
    4,
    y+41,
    13,
    5
  );

  ctx.fillRect(
    20,
    y+41,
    13,
    5
  );

  /* body */

  ctx.fillStyle = "#e52b2b";

  ctx.fillRect(
    6,
    y+17,
    23,
    17
  );

  /* blue overalls */

  ctx.fillStyle = "#2854b8";

  ctx.fillRect(
    8,
    y+20,
    7,
    14
  );

  ctx.fillRect(
    20,
    y+20,
    7,
    14
  );

  /* face */

  ctx.fillStyle = "#f2a06b";

  ctx.fillRect(
    8,
    y+5,
    20,
    17
  );

  /* ear */

  ctx.fillRect(
    26,
    y+10,
    5,
    8
  );

  /* hat */

  ctx.fillStyle = "#e52525";

  ctx.fillRect(
    5,
    y+1,
    24,
    8
  );

  ctx.fillRect(
    11,
    y-4,
    15,
    7
  );

  /* hat logo */

  ctx.fillStyle = "#fff";

  ctx.font = "bold 7px Arial";

  ctx.fillText(
    "M",
    17,
    y+5
  );

  /* eye */

  ctx.fillStyle = "#111";

  ctx.fillRect(
    23,
    y+10,
    3,
    4
  );

  /* mustache */

  ctx.fillRect(
    19,
    y+17,
    10,
    3
  );

  ctx.restore();

}

/* =========================
   DRAW STAGE NUMBER
========================= */

function drawStageText(){

  ctx.save();

  ctx.fillStyle = "rgba(0,0,0,.35)";

  ctx.fillRect(
    15,
    15,
    115,
    32
  );

  ctx.fillStyle = "#fff";

  ctx.font = "bold 15px Arial";

  ctx.fillText(
    "WORLD " + stage,
    28,
    37
  );

  ctx.restore();

}

/* =========================
   DRAW
========================= */

function draw(){

  drawSky();

  drawClouds();

  drawHills();

  drawPlatforms();

  drawCoins();

  drawEnemies();

  drawFlag();

  drawPlayer();

  drawStageText();

}

/* =========================
   LOOP
========================= */

function loop(){

  if(!running){

    draw();

    return;

  }

  update();

  draw();

  requestAnimationFrame(loop);

}

/* =========================
   CONTROLS
========================= */

let jumpPressed = false;

/* LEFT */

const leftBtn =
  document.getElementById("leftBtn");

leftBtn.addEventListener(
  "pointerdown",
  e => {

    e.preventDefault();

    left = true;

  }
);

leftBtn.addEventListener(
  "pointerup",
  e => {

    e.preventDefault();

    left = false;

  }
);

leftBtn.addEventListener(
  "pointercancel",
  () => {
    left = false;
  }
);

leftBtn.addEventListener(
  "pointerleave",
  () => {
    left = false;
  }
);

/* RIGHT */

const rightBtn =
  document.getElementById("rightBtn");

rightBtn.addEventListener(
  "pointerdown",
  e => {

    e.preventDefault();

    right = true;

  }
);

rightBtn.addEventListener(
  "pointerup",
  e => {

    e.preventDefault();

    right = false;

  }
);

rightBtn.addEventListener(
  "pointercancel",
  () => {
    right = false;
  }
);

rightBtn.addEventListener(
  "pointerleave",
  () => {
    right = false;
  }
);

/* JUMP */

const jumpBtn =
  document.getElementById("jumpBtn");

jumpBtn.addEventListener(
  "pointerdown",
  e => {

    e.preventDefault();

    jumpPressed = true;

  }
);

/* =========================
   KEYBOARD
========================= */

document.addEventListener(
  "keydown",
  e => {

    if(
      e.key === "ArrowLeft" ||
      e.key.toLowerCase() === "a"
    ){

      left = true;

    }

    if(
      e.key === "ArrowRight" ||
      e.key.toLowerCase() === "d"
    ){

      right = true;

    }

    if(
      e.key === "ArrowUp" ||
      e.key === " "
    ){

      jumpPressed = true;

    }

  }
);

document.addEventListener(
  "keyup",
  e => {

    if(
      e.key === "ArrowLeft" ||
      e.key.toLowerCase() === "a"
    ){

      left = false;

    }

    if(
      e.key === "ArrowRight" ||
      e.key.toLowerCase() === "d"
    ){

      right = false;

    }

  }
);

/* =========================
   INITIAL DRAW
========================= */

loadStage(1);
updateStats();
draw();

</script>
`;

    const responseData = {
      response_id: "mario-game-" + Date.now(),

      sections: [
        {
          view_model: {
            primitive: {
              __typename: "GenAIaeacdsnwHtmlPrimitive",
              payload: html,
              trusted_sources: ["levvicode.dev"]
            },

            __typename: "GenAISingleLayoutViewModel"
          }
        }
      ]
    };

    const base64Data =
      Buffer
        .from(JSON.stringify(responseData))
        .toString("base64");

    await sendRichHtml(conn, targetChat, null, {
        title: '🍄 Mario Runner — 5 Stage',
        responseData,
        base64Data
      });

  }

mario.command = 'mario'
mario.alias = ['game', 'mariogame']
mario.category = 'game'
mario.description = "🍄 Mario Runner 5 Stage langsung di WhatsApp"
