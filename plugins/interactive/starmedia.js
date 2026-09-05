//plugins/bot/starmedia.js

// 🎵 Lunarielle-style music player

import fs from 'fs';

export default {
    command: 'starmedia',
    alias: ['media', 'star', 'player'],
    category: 'interactive',
    description: '🎵 Lunarielle music player (gambar + audio)',
    execute: async (m, { sock }) => {
        const targetChat = m.chat;

        // ========== AUDIO BASE64 ==========
        const audioPath = './src/menu.mp3';
        let audioSrc = '';
        let audioError = false;
        try {
            const audioBuffer = fs.readFileSync(audioPath);
            const audioBase64 = audioBuffer.toString('base64');
            audioSrc = `data:audio/mpeg;base64,${audioBase64}`;
        } catch {
            audioError = true;
        }

        // ========== IMAGE BASE64 (COVER) ==========
        const imagePath = './src/cover.jpg';
        let imageSrc = '';
        let imageError = false;
        try {
            const imageBuffer = fs.readFileSync(imagePath);
            const imageBase64 = imageBuffer.toString('base64');
            imageSrc = `data:image/jpeg;base64,${imageBase64}`;
        } catch {
            imageError = true;
        }

        if (audioError || imageError) {
            let msg = '⚠️ *File media tidak ditemukan!*\n\n';
            if (audioError) msg += '❌ Audio: `./src/menu.mp3` tidak ditemukan\n';
            if (imageError) msg += '❌ Gambar: `./src/cover.jpg` tidak ditemukan\n';
            msg += '\n📁 Pastikan file ada di folder `src/`';
            await sock.message.send(targetChat, { text: msg });
            return;
        }

        // ========== HTML LUNARIELLE PLAYER ==========
        const html = `<style>
*{
  box-sizing:border-box;
  margin:0;
  padding:0;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
  -webkit-tap-highlight-color:transparent;
  user-select:none
}

html,body{
  width:100%;
  background:transparent;
  overflow:hidden
}

body{
  padding:8px
}

/* MAIN PLAYER */
.lunar-card{
  width:100%;
  max-width:430px;
  margin:0 auto;
  padding:25px 28px 34px;
  border-radius:26px;
  overflow:hidden;
  position:relative;
  color:#eef1f7;
  border:1px solid rgba(255,255,255,.09);

  /* tema gelap Lunarielle Arcade — biru/ungu redup ke hitam,
     senada dengan Block Blast */
  background:
    radial-gradient(120% 140% at 15% -10%, rgba(142,203,255,.14), transparent 55%),
    radial-gradient(120% 140% at 100% 0%, rgba(199,146,234,.12), transparent 50%),
    linear-gradient(180deg,#1c2036 0%,#181b30 20%,#14172a 45%,#101223 72%,#0a0b16 100%);

  box-shadow:
    0 20px 50px rgba(0,0,0,.6),
    0 2px 0 rgba(255,255,255,.05) inset,
    0 0 0 1px rgba(255,255,255,.06) inset
}

.lunar-card .sheen{
  position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(115deg, transparent 30%, rgba(255,255,255,.045) 45%, transparent 60%);
  background-size:250% 250%;
  animation:sheenMove 7s ease-in-out infinite;
  mix-blend-mode:screen;
}
@keyframes sheenMove{ 0%{background-position:120% -20%;} 50%{background-position:-20% 120%;} 100%{background-position:120% -20%;} }

/* HEADER */
.top-row{
  width:100%;
  height:48px;
  position:relative;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-bottom:0
}

.top-row .back{
  width:36px;
  height:36px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  font-size:31px;
  line-height:1;
  font-weight:300;
  opacity:.95;
  margin-top:-3px
}

.top-row .center{
  position:absolute;
  left:50%;
  top:3px;
  transform:translateX(-50%);
  text-align:center;
  color:rgba(238,241,247,.45);
  font-size:10px;
  font-weight:800;
  letter-spacing:3px;
  white-space:nowrap;
  display:flex;
  align-items:center;
  gap:6px
}

.top-row .center .dot{
  width:5px;
  height:5px;
  border-radius:50%;
  background:linear-gradient(135deg,#8ecbff,#c792ea);
  box-shadow:0 0 8px rgba(142,203,255,.8)
}

.top-row .menu{
  width:36px;
  height:36px;
  display:flex;
  align-items:center;
  justify-content:center;
  color:#fff;
  font-size:21px;
  letter-spacing:4px;
  margin-top:-3px
}

/* JUDUL ATAS */
.header-title{
  width:100%;
  text-align:center;
  font-size:21px;
  line-height:27px;
  font-weight:900;
  letter-spacing:-.2px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  margin:2px 0 22px;
  background:linear-gradient(135deg,#ffffff,#c9d6f0 60%,#8ecbff);
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent
}

/* COVER */
.cover-wrap{
  width:100%;
  aspect-ratio:1/1;
  max-width:350px;
  margin:0 auto 28px;
  border-radius:22px;
  overflow:hidden;
  background:#1a1d2e;
  position:relative;

  box-shadow:
    0 14px 34px rgba(0,0,0,.5),
    0 3px 10px rgba(0,0,0,.3),
    0 0 0 1px rgba(255,255,255,.06) inset
}

.cover-wrap img{
  width:100%;
  height:100%;
  object-fit:cover;
  display:block
}

/* SONG INFO */
.song-info{
  display:flex;
  align-items:center;
  width:100%;
  margin-bottom:20px
}

.song-info .left{
  flex:1;
  min-width:0;
  text-align:left;
  padding-right:14px
}

.song-info .title{
  color:#fff;
  font-size:24px;
  line-height:29px;
  font-weight:800;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis
}

.song-info .artist{
  color:rgba(238,241,247,.6);
  font-size:16px;
  line-height:22px;
  margin-top:3px;
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis
}

/* LIKE */
.song-info .like-btn{
  width:42px;
  height:42px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:none;
  border:none;
  cursor:pointer;
  padding:0
}

.song-info .like-btn svg{
  width:31px;
  height:31px;
  fill:none;
  stroke:#eef1f7;
  stroke-width:1.8;
  transition:.2s
}

.song-info .like-btn.liked svg{
  fill:#8ecbff;
  stroke:#8ecbff;
  filter:drop-shadow(0 0 6px rgba(142,203,255,.6))
}

/* PROGRESS */
.progress-wrap{
  width:100%;
  display:flex;
  flex-direction:column;
  gap:8px;
  margin-bottom:25px
}

.progress-track{
  width:100%;
  height:5px;
  position:relative;
  background:rgba(255,255,255,.14);
  border-radius:10px;
  cursor:pointer
}

.progress-track .bar{
  height:100%;
  width:0%;
  background:linear-gradient(90deg,#8ecbff,#c792ea);
  box-shadow:0 0 10px rgba(142,203,255,.4);
  border-radius:10px;
  transition:width .05s linear
}

.progress-track .dot{
  position:absolute;
  top:50%;
  left:0%;
  width:15px;
  height:15px;
  background:#fff;
  border-radius:50%;
  transform:translate(-50%,-50%);
  opacity:1;
  box-shadow:0 1px 6px rgba(0,0,0,.4), 0 0 10px rgba(142,203,255,.5);
  transition:opacity .15s
}

.progress-wrap .time-row{
  display:flex;
  justify-content:space-between;
  width:100%
}

.progress-wrap .time{
  color:rgba(238,241,247,.5);
  font-size:12px;
  line-height:15px;
  font-weight:600;
  font-variant-numeric:tabular-nums
}

/* CONTROLS */
.controls{
  width:100%;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:0 1px
}

.controls button{
  width:46px;
  height:46px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:none;
  border:none;
  border-radius:50%;
  cursor:pointer;
  padding:0;
  transition:transform .1s
}

.controls button:active{
  transform:scale(.86)
}

.controls .ctrl-btn svg{
  width:25px;
  height:25px;
  fill:#eef1f7;
  transition:.2s
}

.controls .ctrl-btn:hover svg{
  fill:#fff
}

.controls .ctrl-btn.active svg{
  fill:#8ecbff;
  filter:drop-shadow(0 0 6px rgba(142,203,255,.6))
}

/* PLAY */
.controls .play-btn{
  width:76px;
  height:76px;
  background:linear-gradient(150deg,#ffffff,#dfe9fb);
  border-radius:50%;
  box-shadow:0 10px 24px rgba(142,203,255,.28), 0 0 0 1px rgba(255,255,255,.4) inset
}

.controls .play-btn svg{
  width:34px;
  height:34px;
  fill:#12142a
}

.controls .play-btn.paused svg{
  fill:#12142a
}

.controls .play-btn:active{
  transform:scale(.92)
}

/* MOBILE */
@media(max-width:360px){

  .lunar-card{
    padding:22px 20px 28px;
    border-radius:22px
  }

  .top-row{
    height:45px
  }

  .top-row .center{
    font-size:9px;
    letter-spacing:2px
  }

  .header-title{
    font-size:18px;
    margin-bottom:18px
  }

  .cover-wrap{
    max-width:285px;
    border-radius:18px;
    margin-bottom:22px
  }

  .song-info .title{
    font-size:20px;
    line-height:25px
  }

  .song-info .artist{
    font-size:14px
  }

  .controls .play-btn{
    width:64px;
    height:64px
  }

  .controls .play-btn svg{
    width:29px;
    height:29px
  }

  .controls button{
    width:40px;
    height:40px
  }
}
</style>

<div class="lunar-card">

  <div class="sheen"></div>

  <div class="top-row">

    <div class="back">⌄</div>

    <div class="center">
      <span class="dot"></span>LUNARIELLE STUDIO
    </div>

    <div class="menu">
      •••
    </div>

  </div>

  <div class="header-title">
    Lunarielle Player
  </div>

  <div class="cover-wrap">

    <img
      src="${imageSrc}"
      alt="cover"
      id="coverImg"
    >

  </div>

  <div class="song-info">

    <div class="left">

      <div class="title" id="songTitle">
        Menu Theme
      </div>

      <div class="artist" id="artistName">
        Lunarielle
      </div>

    </div>

    <button
      class="like-btn"
      id="likeBtn"
    >

      <svg viewBox="0 0 24 24">

        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
        2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09
        C13.09 3.81 14.76 3 16.5 3
        19.58 3 22 5.42 22 8.5
        c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>

      </svg>

    </button>

  </div>

  <div class="progress-wrap">

    <div
      class="progress-track"
      id="progressTrack"
    >

      <div
        class="bar"
        id="progressBar"
      ></div>

      <div
        class="dot"
        id="progressDot"
      ></div>

    </div>

    <div class="time-row">

      <span
        class="time"
        id="currentTime"
      >
        0:00
      </span>

      <span
        class="time"
        id="totalTime"
      >
        0:00
      </span>

    </div>

  </div>

  <div class="controls">

    <button
      class="ctrl-btn"
      id="shuffleBtn"
    >

      <svg viewBox="0 0 24 24">

        <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17
        1.42-1.41zM14.5 4l2.04 2.04L4 18.59
        5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33
        9.41l-1.41 1.41 3.13 3.13L14.5 20H20
        v-5.5l-2.04 2.04-3.13-3.13z"/>

      </svg>

    </button>

    <button
      class="ctrl-btn"
      id="prevBtn"
    >

      <svg viewBox="0 0 24 24">

        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>

      </svg>

    </button>

    <button
      class="play-btn paused"
      id="playBtn"
    >

      <svg viewBox="0 0 24 24">

        <path d="M8 5v14l11-7z"/>

      </svg>

    </button>

    <button
      class="ctrl-btn"
      id="nextBtn"
    >

      <svg viewBox="0 0 24 24">

        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>

      </svg>

    </button>

    <button
      class="ctrl-btn"
      id="loopBtn"
    >

      <svg viewBox="0 0 24 24">

        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10
        10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>

      </svg>

    </button>

  </div>

</div>

<audio
  id="audioPlayer"
  src="${audioSrc}"
  preload="metadata"
></audio>

<script>
(function(){

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const progressBar = document.getElementById('progressBar');
const progressDot = document.getElementById('progressDot');
const progressTrack = document.getElementById('progressTrack');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const likeBtn = document.getElementById('likeBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const loopBtn = document.getElementById('loopBtn');

let isDragging = false;
let isLiked = false;
let isShuffled = false;
let isLooped = false;

function formatTime(sec){

  if(!isFinite(sec) || sec < 0)
    return '0:00';

  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);

  return m + ':' + (s < 10 ? '0' : '') + s;
}

function updateProgress(){

  if(!isDragging && audio.duration){

    const pct =
      (audio.currentTime / audio.duration) * 100;

    progressBar.style.width =
      pct + '%';

    progressDot.style.left =
      pct + '%';

    currentTimeEl.textContent =
      formatTime(audio.currentTime);
  }
}

function setPlayingState(isPlaying){

  if(isPlaying){

    playBtn.classList.remove('paused');

    playBtn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';

  }else{

    playBtn.classList.add('paused');

    playBtn.innerHTML =
      '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';

  }
}

playBtn.addEventListener('click', function(){

  if(audio.paused){

    audio.play().catch(()=>{});

  }else{

    audio.pause();

  }

});

audio.addEventListener('play', function(){

  setPlayingState(true);

});

audio.addEventListener('pause', function(){

  setPlayingState(false);

});

audio.addEventListener('timeupdate', updateProgress);

audio.addEventListener('loadedmetadata', function(){

  totalTimeEl.textContent =
    formatTime(audio.duration);

});

audio.addEventListener('ended', function(){

  setPlayingState(false);

  if(isLooped){

    audio.currentTime = 0;

    audio.play().catch(()=>{});

  }else{

    progressBar.style.width = '0%';

    progressDot.style.left = '0%';

    currentTimeEl.textContent = '0:00';

  }

});

/* SEEK */

progressTrack.addEventListener(
  'pointerdown',
  function(e){

    isDragging = true;

    const rect =
      this.getBoundingClientRect();

    const x = Math.max(
      0,
      Math.min(
        e.clientX - rect.left,
        rect.width
      )
    );

    const pct =
      x / rect.width;

    if(audio.duration){

      audio.currentTime =
        pct * audio.duration;

      progressBar.style.width =
        (pct * 100) + '%';

      progressDot.style.left =
        (pct * 100) + '%';

      currentTimeEl.textContent =
        formatTime(audio.currentTime);

    }

  }
);

document.addEventListener(
  'pointermove',
  function(e){

    if(isDragging){

      const rect =
        progressTrack.getBoundingClientRect();

      const x = Math.max(
        0,
        Math.min(
          e.clientX - rect.left,
          rect.width
        )
      );

      const pct =
        x / rect.width;

      if(audio.duration){

        audio.currentTime =
          pct * audio.duration;

        progressBar.style.width =
          (pct * 100) + '%';

        progressDot.style.left =
          (pct * 100) + '%';

        currentTimeEl.textContent =
          formatTime(audio.currentTime);

      }

    }

  }
);

document.addEventListener(
  'pointerup',
  function(){

    isDragging = false;

  }
);

/* LIKE */

likeBtn.addEventListener(
  'click',
  function(){

    isLiked = !isLiked;

    this.classList.toggle(
      'liked',
      isLiked
    );

  }
);

/* SHUFFLE */

shuffleBtn.addEventListener(
  'click',
  function(){

    isShuffled = !isShuffled;

    this.classList.toggle(
      'active',
      isShuffled
    );

  }
);

/* LOOP */

loopBtn.addEventListener(
  'click',
  function(){

    isLooped = !isLooped;

    this.classList.toggle(
      'active',
      isLooped
    );

  }
);

/* PREVIOUS */

document.getElementById('prevBtn')
.addEventListener(
  'click',
  function(){

    audio.currentTime = 0;

  }
);

/* NEXT */

document.getElementById('nextBtn')
.addEventListener(
  'click',
  function(){

    audio.currentTime = 0;

  }
);

/* INISIALISASI */

setPlayingState(false);

})();
</script>`;

        // ========== BUNGKUS DALAM RICH RESPONSE ==========
        const responseData = {
            response_id: "lunarielle-music-" + Date.now(),
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

        await sock.message.send(targetChat, {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: [
                            {
                                messageType: 2,
                                messageText: "🎵 Lunarielle Player"
                            }
                        ],
                        unifiedResponse: {
                            data: base64Data
                        },
                        contextInfo: {
                            forwardingScore: 999,
                            isForwarded: true,
                            forwardOrigin: 4
                        }
                    }
                }
            }
        }, {
            additionalAttributes: {
                "type": "text"
            }
        });
    }
};