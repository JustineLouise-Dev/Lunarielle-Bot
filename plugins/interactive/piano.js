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
// plugins/interactive/piano.js

const PIANO_HTML = `<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=IBM+Plex+Mono:wght@500&display=swap');

*{box-sizing:border-box;margin:0;font-family:'IBM Plex Mono',monospace;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
html,body{width:100%}
body{background:radial-gradient(ellipse at 50% -10%,#241d14,#100c07 55%,#0a0703);padding:10px;color:#f3ead9;overflow-y:auto}

.unit{width:100%;max-width:420px;margin:0 auto;padding:16px 16px 14px;border-radius:20px;background:linear-gradient(175deg,#241c13,#17120b 65%,#120e08);box-shadow:inset 0 0 0 1px #3a2d1b,inset 0 1px 0 #4d3c22,0 14px 30px #000b}

.head{display:flex;align-items:baseline;justify-content:space-between;padding-bottom:13px;border-bottom:1px solid #3a2d1b33;margin-bottom:13px}
.brand{font-family:'Fraunces',serif;font-weight:600;font-size:19px;letter-spacing:.2px;color:#f3ead9}
.brand em{font-style:italic;font-weight:500;color:#c9a35a}
.serial{font-size:9.5px;color:#8a7a5c;letter-spacing:.3px}

.tabs{display:flex;gap:6px;margin-bottom:12px;padding:4px;border-radius:11px;background:#0e0b06;box-shadow:inset 0 1px 3px #0009}
.tab{flex:1;text-align:center;padding:8px 4px;border-radius:8px;font-size:10.5px;letter-spacing:.3px;color:#8a7a5c;cursor:pointer;transition:background .15s,color .15s}
.tab.on{background:linear-gradient(#2c2314,#221a0e);color:#e8c877;box-shadow:inset 0 0 0 1px #4d3c22,0 1px 2px #000a}

.readout{display:flex;align-items:center;justify-content:space-between;padding:9px 12px;margin-bottom:12px;border-radius:11px;background:#0e0b06;box-shadow:inset 0 1px 3px #0009}
.readout .now{font-size:10.5px;color:#8a7a5c;letter-spacing:.3px}
.readout .note{font-family:'Fraunces',serif;font-size:16px;font-weight:600;color:#c9a35a;min-width:34px;text-align:right}

.piano{position:relative;height:172px;border-radius:12px;overflow:hidden;background:#050403;box-shadow:inset 0 0 0 1px #3a2d1b,inset 0 10px 18px #0009,inset 0 -6px 12px #0009;display:flex;margin-bottom:14px}
.wkey{position:relative;flex:1;border-right:1px solid #cabf9d;background:linear-gradient(180deg,#faf5e9 0%,#f0e7d3 78%,#e2d3ab 100%);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:10px;cursor:pointer;transition:background .06s,transform .06s}
.wkey:last-child{border-right:none}
.wkey:first-child{border-radius:0 0 0 10px}
.wkey:last-child{border-radius:0 0 10px 0}
.wkey.active{background:linear-gradient(180deg,#e8c877 0%,#c9a35a 78%,#a9813e 100%);transform:translateY(1px)}
.wkey b{font-family:'Fraunces',serif;font-size:12px;font-weight:600;color:#2a2213}
.wkey small{font-size:8.5px;color:#6b6046;margin-top:1px;letter-spacing:.2px}
.wkey.active b{color:#2a1c05}
.wkey.active small{color:#4a3610}

.bkeys{position:absolute;top:0;left:0;right:0;height:58%;display:flex;pointer-events:none}
.bkey{position:relative;width:0;pointer-events:auto}
.bkey i{position:absolute;top:0;width:62%;height:100%;transform:translateX(-50%);border-radius:0 0 5px 5px;background:linear-gradient(180deg,#3a3126 0%,#1a1610 85%,#0d0a06 100%);box-shadow:0 3px 5px #000c,inset 0 1px 0 #5a4c33;font-style:normal;font-size:8px;letter-spacing:.2px;color:#9a8862;display:flex;align-items:flex-end;justify-content:center;padding-bottom:6px;cursor:pointer;transition:background .06s}
.bkey.active i{background:linear-gradient(180deg,#8a6a2e 0%,#5c4318 85%,#3a2a0d 100%);color:#f3ead9}

.section-lbl{display:flex;align-items:center;gap:8px;margin-bottom:9px}
.section-lbl .ln{flex:1;height:1px;background:#3a2d1b}
.section-lbl span{font-size:10px;letter-spacing:.3px;color:#8a7a5c;white-space:nowrap}

.pads{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.pad{position:relative;height:46px;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;cursor:pointer;font-size:9px;letter-spacing:.3px;color:#c2b592;background:linear-gradient(180deg,#221b10,#171208);box-shadow:inset 0 0 0 1px #3a2d1b,inset 0 1px 0 #4d3c2255;transition:transform .05s,box-shadow .05s}
.pad .ic{font-size:15px;line-height:1;margin-bottom:2px}
.pad.active{transform:translateY(1px) scale(.97);box-shadow:inset 0 0 0 1px #c9a35a,inset 0 2px 6px #000a}

.foot{display:flex;align-items:center;justify-content:space-between;margin-top:13px;font-size:9px;color:#5c5138;letter-spacing:.2px}
.foot .ready{display:flex;align-items:center;gap:5px;color:#7a8f6c}
.foot .ready i{width:6px;height:6px;border-radius:50%;background:#7a8f6c;display:inline-block;box-shadow:0 0 6px #7a8f6c}
</style>

<div class="unit" id="unit">
  <div class="head">
    <div class="brand">Lunar <em>Piano</em></div>
    <div class="serial">MODEL LP-1 · STUDIO</div>
  </div>

  <div class="tabs" id="tabs"></div>

  <div class="readout">
    <div class="now">Nada terakhir</div>
    <div class="note" id="lastNote">—</div>
  </div>

  <div class="piano" id="piano"></div>

  <div class="section-lbl"><span>PERKUSI</span><div class="ln"></div></div>
  <div class="pads" id="pads"></div>

  <div class="foot">
    <span>Ketuk tuts atau pad untuk membunyikan</span>
    <span class="ready"><i></i>siap</span>
  </div>
</div>

<script>
(function(){
var AC=null;
function ac(){
  if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){return null}}
  if(AC.state==='suspended'){try{AC.resume()}catch(e){}}
  return AC;
}
document.addEventListener('pointerdown',function(){ac()},{once:true});

function env(g,t,vol,attack,decay){
  g.gain.setValueAtTime(0,t);
  g.gain.linearRampToValueAtTime(vol,t+attack);
  g.gain.exponentialRampToValueAtTime(.0001,t+attack+decay);
}

function playPiano(f){
  var a=ac();if(!a)return;
  try{
    var t=a.currentTime;
    [1,2,2.99,4.01].forEach(function(mult,i){
      var o=a.createOscillator(),g=a.createGain();
      o.type=i===0?'triangle':'sine';
      o.frequency.setValueAtTime(f*mult,t);
      var vol=[.26,.09,.05,.03][i];
      env(g,t,vol,.006,1.1-i*.15);
      o.connect(g);g.connect(a.destination);
      o.start(t);o.stop(t+1.3);
    });
  }catch(e){}
}

function playKalimba(f){
  var a=ac();if(!a)return;
  try{
    var t=a.currentTime;
    var o=a.createOscillator(),g=a.createGain();
    o.type='sine';
    o.frequency.setValueAtTime(f*2,t);
    o.frequency.exponentialRampToValueAtTime(f,t+.05);
    env(g,t,.3,.002,.9);
    var o2=a.createOscillator(),g2=a.createGain();
    o2.type='sine';o2.frequency.setValueAtTime(f*4,t);
    env(g2,t,.08,.001,.15);
    o.connect(g);g.connect(a.destination);
    o2.connect(g2);g2.connect(a.destination);
    o.start(t);o.stop(t+1);
    o2.start(t);o2.stop(t+.2);
  }catch(e){}
}

function playMarimba(f){
  var a=ac();if(!a)return;
  try{
    var t=a.currentTime;
    var o=a.createOscillator(),g=a.createGain();
    o.type='sine';o.frequency.setValueAtTime(f,t);
    env(g,t,.3,.004,.5);
    var o2=a.createOscillator(),g2=a.createGain();
    o2.type='sine';o2.frequency.setValueAtTime(f*3.98,t);
    env(g2,t,.06,.002,.08);
    o.connect(g);g.connect(a.destination);
    o2.connect(g2);g2.connect(a.destination);
    o.start(t);o.stop(t+.6);
    o2.start(t);o2.stop(t+.1);
  }catch(e){}
}

function playMusicBox(f){
  var a=ac();if(!a)return;
  try{
    var t=a.currentTime;
    [1,4,8.01].forEach(function(mult,i){
      var o=a.createOscillator(),g=a.createGain();
      o.type='sine';o.frequency.setValueAtTime(f*mult,t);
      env(g,t,[.24,.07,.03][i],.001,.7-i*.15);
      o.connect(g);g.connect(a.destination);
      o.start(t);o.stop(t+.8);
    });
  }catch(e){}
}

function playEPiano(f){
  var a=ac();if(!a)return;
  try{
    var t=a.currentTime;
    var o=a.createOscillator(),g=a.createGain();
    o.type='sine';o.frequency.setValueAtTime(f,t);
    env(g,t,.28,.01,1.4);
    var o2=a.createOscillator(),g2=a.createGain();
    o2.type='triangle';o2.frequency.setValueAtTime(f*2.01,t);
    env(g2,t,.09,.01,.6);
    o.connect(g);g.connect(a.destination);
    o2.connect(g2);g2.connect(a.destination);
    o.start(t);o.stop(t+1.5);
    o2.start(t);o2.stop(t+.7);
  }catch(e){}
}

var INSTRUMENTS={
  piano:{label:'Piano',fn:playPiano},
  kalimba:{label:'Kalimba',fn:playKalimba},
  marimba:{label:'Marimba',fn:playMarimba},
  musicbox:{label:'Music Box',fn:playMusicBox},
  epiano:{label:'E-Piano',fn:playEPiano}
};
var currentInstrument='piano';

function noise(dur,vol,filterFreq,filterType){
  var a=ac();if(!a)return;
  try{
    var t=a.currentTime;
    var bufSize=a.sampleRate*dur;
    var buf=a.createBuffer(1,bufSize,a.sampleRate);
    var data=buf.getChannelData(0);
    for(var i=0;i<bufSize;i++)data[i]=Math.random()*2-1;
    var src=a.createBufferSource();src.buffer=buf;
    var f=a.createBiquadFilter();f.type=filterType||'bandpass';f.frequency.value=filterFreq||1100;
    var g=a.createGain();g.gain.setValueAtTime(vol||.3,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
    src.connect(f);f.connect(g);g.connect(a.destination);
    src.start(t);src.stop(t+dur);
  }catch(e){}
}
function sndKick(){var a=ac();if(!a)return;var t=a.currentTime;var o=a.createOscillator(),g=a.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.35);env(g,t,.5,.001,.35);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+.4)}
function sndSnare(){noise(.18,.4,1800,'bandpass')}
function sndHihat(){noise(.06,.22,8000,'highpass')}
function sndClap(){noise(.14,.32,1100,'bandpass');setTimeout(function(){noise(.14,.24,1100,'bandpass')},22)}
var DRUM_SND={kick:sndKick,snare:sndSnare,hihat:sndHihat,clap:sndClap};

var WHITE=[
  {n:'C4',f:261.63,d:'Do',oct:'C4'},
  {n:'D4',f:293.66,d:'Re',oct:'D4'},
  {n:'E4',f:329.63,d:'Mi',oct:'E4'},
  {n:'F4',f:349.23,d:'Fa',oct:'F4'},
  {n:'G4',f:392.00,d:'Sol',oct:'G4'},
  {n:'A4',f:440.00,d:'La',oct:'A4'},
  {n:'B4',f:493.88,d:'Si',oct:'B4'},
  {n:'C5',f:523.25,d:"Do'",oct:'C5'}
];
var BLACK=[
  {after:0,n:'C#4',f:277.18},
  {after:1,n:'D#4',f:311.13},
  {after:3,n:'F#4',f:369.99},
  {after:4,n:'G#4',f:415.30},
  {after:5,n:'A#4',f:466.16}
];

var piano=document.getElementById('piano');
var lastNote=document.getElementById('lastNote');
var tabsEl=document.getElementById('tabs');
var padsEl=document.getElementById('pads');

function triggerNote(f,label,el){
  INSTRUMENTS[currentInstrument].fn(f);
  el.classList.add('active');
  lastNote.textContent=label;
  setTimeout(function(){el.classList.remove('active')},170);
}

WHITE.forEach(function(k){
  var el=document.createElement('div');
  el.className='wkey';
  el.innerHTML='<b>'+k.d+'</b><small>'+k.oct+'</small>';
  el.addEventListener('pointerdown',function(){triggerNote(k.f,k.oct,el)});
  piano.appendChild(el);
});

var bwrap=document.createElement('div');
bwrap.className='bkeys';
piano.appendChild(bwrap);

var whiteW=100/WHITE.length;
BLACK.forEach(function(k){
  var bk=document.createElement('div');
  bk.className='bkey';
  bk.style.left=(whiteW*(k.after+1))+'%';
  bk.style.width=whiteW+'%';
  var inner=document.createElement('i');
  inner.textContent=k.n.replace('4','');
  bk.appendChild(inner);
  bk.addEventListener('pointerdown',function(e){
    e.stopPropagation();
    triggerNote(k.f,k.n,bk);
  });
  bwrap.appendChild(bk);
});

var DRUMS=[
  {id:'kick',ic:'\\u{1F941}',label:'Kick'},
  {id:'snare',ic:'\\u26A1',label:'Snare'},
  {id:'hihat',ic:'\\u{1F3A9}',label:'Hi-Hat'},
  {id:'clap',ic:'\\u{1F44F}',label:'Clap'}
];
DRUMS.forEach(function(d){
  var pad=document.createElement('div');
  pad.className='pad';
  pad.innerHTML='<span class="ic">'+d.ic+'</span>'+d.label;
  pad.addEventListener('pointerdown',function(){
    DRUM_SND[d.id]();
    pad.classList.add('active');
    setTimeout(function(){pad.classList.remove('active')},110);
  });
  padsEl.appendChild(pad);
});

Object.keys(INSTRUMENTS).forEach(function(key){
  var tab=document.createElement('div');
  tab.className='tab'+(key===currentInstrument?' on':'');
  tab.textContent=INSTRUMENTS[key].label;
  tab.addEventListener('pointerdown',function(){
    currentInstrument=key;
    tabsEl.querySelectorAll('.tab').forEach(function(t){t.classList.remove('on')});
    tab.classList.add('on');
  });
  tabsEl.appendChild(tab);
});
})();
</script>`;

export default {
  command: 'lunarpiano',
  alias: ['piano', 'kalimba', 'pianopro'],
  category: 'interactive',
  description: '🎹 Lunar Piano — instrumen synth premium dengan pilihan suara (Piano, Kalimba, Marimba, Music Box, E-Piano) dan perkusi, langsung dimainkan tanpa reply!\n\n*Cara Main:*\n> .lunarpiano - Buka instrumen\n> Pilih jenis suara di bagian tab atas\n> Ketuk tuts (Do–Do 1 oktaf + nada kres) untuk bunyi\n> Ketuk pad KICK/SNARE/HI-HAT/CLAP untuk perkusi',
  help: 'Tanpa argumen, langsung tampil.',
  typing: true,

  async execute(m, { sock }) {
    try {
      const targetChat = m.chat;

      const responseData = {
        response_id: "lunarpiano-" + Date.now(),
        sections: [{
          view_model: {
            primitive: {
              __typename: "GenAIaeacdsnwHtmlPrimitive",
              payload: PIANO_HTML,
              trusted_sources: ["https://justinelouise-dev.github.io"]
            },
            __typename: "GenAISingleLayoutViewModel"
          }
        }]
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
                  messageText: "🎹 LUNAR PIANO"
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
        additionalAttributes: { "type": "text" }
      });

    } catch (error) {
      console.error('[LUNAR PIANO ERROR]', error);
      await sock.message.send(m.chat, {
        text: `❌ *Gagal memuat Lunar Piano!*\n\n${error?.message || 'Unknown error'}`
      });
    }
  }
};
