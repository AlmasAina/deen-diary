/* Garden and house progression. Everything unlocks by the number of full days ever completed, so nothing earned is lost.
   Symbolic and motivational only. Loaded before app.js; uses its globals only when called. */
/* [full days, key, picture file name in garden/ (the day number), "in" = inside the house] */
const STAGES=[[1,"grass","1"],[3,"flowers","3"],[7,"beds","7"],[14,"fountain","14"],[30,"house","30"],[45,"details","45"],
  [60,"interior","60","in"],[90,"bench","90"],[120,"bedroom","120","in"],[180,"orchard","180"],[250,"rivers","250"],
  [365,"courtyard","365"],[500,"palace","500"],[700,"library","700","in"],[1000,"paradise","1000"]];
let gView="garden";
const has=(N,k)=>N>=STAGES.find(s=>s[1]===k)[0];
function nextStage(N){return STAGES.find(([d])=>d>N)||null}

/* behind the flowers: trees, house and vines on the far hill */
function backLayer(N,night){let o="";const wall=night?"#b9ad98":"#f3ead8",wallSh=night?"#9d927f":"#e2d5bc",roof=night?"#6d5a44":"#a0784f",glass=night?"#ffd98a":"#bcd9e8";
  if(has(N,"fountain"))o+=[[34,150,1],[322,148,1.1],[300,160,.8]].map(([x,y,s],i)=>`<g transform="translate(${x},${y}) scale(${s})"><g class="sway" style="animation-duration:${6+i}s">
    <rect x="-3" y="-4" width="6" height="26" rx="2" fill="#7a5638"/><circle cy="-14" r="17" fill="${night?"#1f5a3e":"#3f8f52"}"/><circle cx="-9" cy="-6" r="11" fill="${night?"#1b4d36":"#357d47"}"/><circle cx="10" cy="-8" r="12" fill="${night?"#24684a":"#4aa35e"}"/>
    ${has(N,"orchard")?`<circle cx="-6" cy="-16" r="2.4" fill="#e94b4b"/><circle cx="7" cy="-4" r="2.4" fill="#f2a33a"/><circle cx="2" cy="-22" r="2.4" fill="#e94b4b"/>`:""}</g></g>`).join("");
  if(has(N,"house")){const d=has(N,"details");
    o+=`<g transform="translate(180,92)" class="house">
      <ellipse cx="0" cy="78" rx="78" ry="6" fill="#000" opacity=".12"/>
      <rect x="-62" y="20" width="124" height="58" fill="${wall}"/><rect x="-62" y="20" width="10" height="58" fill="${wallSh}"/>
      <path d="M-70 22 L0 -14 L70 22z" fill="${roof}"/><path d="M-70 22 L0 -14 L0 -8 L-62 26z" fill="#000" opacity=".08"/>
      ${d?`<path d="M-14 -2 a14 14 0 0 1 28 0 v6 h-28z" fill="${wall}"/><circle cy="-6" r="2.5" fill="#d4af37"/>`:""}
      <path d="M-12 78 V48 a12 12 0 0 1 24 0 V78z" fill="${d?"#7b4f2e":"#8a6a4a"}"/>${d?`<path d="M-12 78 V48 a12 12 0 0 1 24 0 V78" fill="none" stroke="#d4af37" stroke-width="1.6"/><circle cx="6" cy="64" r="1.4" fill="#d4af37"/>`:""}
      ${[-44,26].map(x=>`<g transform="translate(${x},34)"><path d="M0 22 V8 a9 9 0 0 1 18 0 V22z" fill="${glass}"/>${d?`<path d="M9 22 V0 M0 13 H18" stroke="${wall}" stroke-width="1.5"/><path d="M0 22 V8 a9 9 0 0 1 18 0 V22z" fill="none" stroke="#c9a96e" stroke-width="1.6"/><rect x="-2" y="22" width="22" height="3" fill="#c9a96e"/>`:""}</g>`).join("")}
      ${d?`<path d="M-62 78 C-66 60 -56 50 -62 28" stroke="#3c8d4a" stroke-width="2.4" fill="none"/>${[30,40,52,64].map((y,i)=>`<circle cx="${-62+(i%2?3:-3)}" cy="${y}" r="2.4" fill="${i%2?"#f49ac1":"#ffffff"}"/>`).join("")}
        <path d="M62 78 C66 62 56 52 62 30" stroke="#3c8d4a" stroke-width="2.4" fill="none"/>${[34,46,58,70].map((y,i)=>`<circle cx="${62+(i%2?-3:3)}" cy="${y}" r="2.4" fill="${i%2?"#c81d4e":"#ffd166"}"/>`).join("")}`:""}
      ${night?`<rect x="-44" y="42" width="18" height="14" fill="#ffd98a" opacity=".35"/><rect x="26" y="42" width="18" height="14" fill="#ffd98a" opacity=".35"/>`:""}
    </g>`}
  return o}

/* in front: flower beds, fountain, bench and birds */
function frontLayer(N,night){let o="";
  if(has(N,"beds"))o+=[[60,214],[300,214]].map(([x,y])=>`<g transform="translate(${x},${y})"><ellipse rx="34" ry="8" fill="#6b4a2a"/><ellipse rx="34" ry="8" fill="none" stroke="#bfa27a" stroke-width="2.5"/>
    ${Array.from({length:9},(_,i)=>{const px=-28+i*7,c=["#c81d4e","#ff5c8a","#ffffff","#f49ac1"][i%4];return`<g class="sway" style="animation-duration:${3+i%3}s"><path d="M${px} 0 v-9" stroke="#3c8d4a" stroke-width="1.4"/><circle cx="${px}" cy="-11" r="3.4" fill="${c}"/><circle cx="${px}" cy="-11" r="1.4" fill="rgba(0,0,0,.18)"/></g>`}).join("")}</g>`).join("");
  if(has(N,"fountain"))o+=`<g transform="translate(250,214)"><ellipse rx="22" ry="6" fill="#a9b4b8"/><ellipse rx="18" ry="4.2" fill="${night?"#3e6d8a":"#7cc4e6"}"/>
    <rect x="-2.5" y="-20" width="5" height="18" fill="#c9d1d4"/><ellipse cy="-20" rx="9" ry="2.6" fill="#c9d1d4"/>
    <g class="water"><path d="M0 -22 C-4 -34 -10 -26 -12 -8" stroke="#bfe6f7" stroke-width="1.6" fill="none"/><path d="M0 -22 C4 -34 10 -26 12 -8" stroke="#bfe6f7" stroke-width="1.6" fill="none"/><path d="M0 -22 V-36" stroke="#e6f7ff" stroke-width="1.8"/></g>
    <circle class="ripple" r="6" fill="none" stroke="#e6f7ff" stroke-width=".8"/></g>`;
  if(has(N,"bench"))o+=`<g transform="translate(112,206)"><rect x="-16" y="-6" width="32" height="4" rx="1.5" fill="#8a5a2b"/><rect x="-16" y="-14" width="32" height="3" rx="1.5" fill="#8a5a2b"/><rect x="-14" y="-2" width="2.5" height="8" fill="#5a3a1c"/><rect x="11.5" y="-2" width="2.5" height="8" fill="#5a3a1c"/></g>
    ${night?"":[0,1].map(i=>`<g class="bird" style="animation-delay:-${i*7}s"><path transform="translate(${60+i*40},${40+i*14})" d="M0 0 q4 -4 8 0 q4 -4 8 0" stroke="#3a3a3a" stroke-width="1.4" fill="none"/></g>`).join("")}`;
  return o}

/* inside the house (from day 60): a sitting room with a window onto the garden, a mirror, a reading corner and later a bedroom */
function interiorSVG(N){const bed=has(N,"bedroom");
  return`<svg viewBox="0 0 360 250" role="img" aria-label="House interior">
  <defs><linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f5ecdc"/><stop offset="1" stop-color="#e8dbc3"/></linearGradient>
    <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b98b5e"/><stop offset="1" stop-color="#8f6640"/></linearGradient>
    <linearGradient id="mirrorG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9f3f7"/><stop offset=".45" stop-color="#b7cbd4"/><stop offset=".55" stop-color="#d9e7ec"/><stop offset="1" stop-color="#9fb6c0"/></linearGradient>
    <linearGradient id="skyIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset="1" stop-color="#e8f7ff"/></linearGradient>
    <radialGradient id="lampG"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
    <clipPath id="winClip"><path d="M150 150 V78 a30 30 0 0 1 60 0 V150z"/></clipPath><clipPath id="mirClip"><path d="M262 132 V86 a18 18 0 0 1 36 0 V132z"/></clipPath></defs>
  <rect width="360" height="250" fill="url(#wallG)"/>
  <rect y="0" width="360" height="10" fill="#d9c7a4"/>${Array.from({length:12},(_,i)=>`<path d="M${i*30} 10 q15 10 30 0" fill="none" stroke="#c9a96e" stroke-width="1"/>`).join("")}
  <rect y="176" width="360" height="74" fill="url(#floorG)"/>${Array.from({length:8},(_,i)=>`<path d="M0 ${182+i*9} H360" stroke="#7a5535" stroke-width=".6" opacity=".5"/>`).join("")}
  <g clip-path="url(#winClip)"><rect x="150" y="48" width="60" height="102" fill="url(#skyIn)"/><path d="M150 132 Q180 118 210 130 V150 H150z" fill="#6cbf5f"/>
    <circle cx="166" cy="118" r="10" fill="#3f8f52"/><circle cx="196" cy="114" r="12" fill="#4aa35e"/><circle cx="172" cy="138" r="2.5" fill="#f49ac1"/><circle cx="188" cy="140" r="2.5" fill="#ffd166"/></g>
  <path d="M150 150 V78 a30 30 0 0 1 60 0 V150z" fill="none" stroke="#c9a96e" stroke-width="4"/><path d="M180 48 V150 M150 104 H210" stroke="#c9a96e" stroke-width="2"/>
  <path d="M136 40 Q140 110 132 172 L150 172 Q146 110 150 40z" fill="#7a9e86"/><path d="M224 40 Q220 110 228 172 L210 172 Q214 110 210 40z" fill="#7a9e86"/><rect x="128" y="36" width="104" height="5" rx="2" fill="#a07a4c"/>
  <ellipse cx="180" cy="214" rx="90" ry="16" fill="#9d3c3c" opacity=".85"/><ellipse cx="180" cy="214" rx="78" ry="12" fill="none" stroke="#e2b553" stroke-width="1.5"/>
  <g transform="translate(${bed?96:70},150)${bed?" scale(.8)":""}"><rect x="-44" y="8" width="88" height="26" rx="8" fill="#5d7a63"/><rect x="-44" y="-10" width="88" height="22" rx="8" fill="#6c8c72"/><rect x="-50" y="2" width="12" height="32" rx="5" fill="#5d7a63"/><rect x="38" y="2" width="12" height="32" rx="5" fill="#5d7a63"/>
    <rect x="-30" y="0" width="22" height="12" rx="4" fill="#e2b553"/><rect x="8" y="0" width="22" height="12" rx="4" fill="#f3ead8"/><rect x="-40" y="34" width="4" height="6" fill="#4a3220"/><rect x="36" y="34" width="4" height="6" fill="#4a3220"/></g>
  <g transform="translate(180,196)"><ellipse rx="20" ry="5" fill="#7a5535"/><rect x="-2" y="0" width="4" height="10" fill="#5a3a1c"/><path d="M-6 -6 h12 l-2 6 h-8z" fill="#f3ead8"/><circle cx="-2" cy="-9" r="2.4" fill="#f49ac1"/><circle cx="2.5" cy="-10" r="2.4" fill="#c81d4e"/><circle cy="-13" r="2.2" fill="#fff"/></g>
  <g><path d="M262 132 V86 a18 18 0 0 1 36 0 V132z" fill="url(#mirrorG)"/>
    <g clip-path="url(#mirClip)" opacity=".55"><rect x="262" y="100" width="20" height="30" fill="#8fd3f4"/><path d="M262 124 q10 -6 20 0 V132 H262z" fill="#6cbf5f"/><rect x="282" y="94" width="3" height="40" fill="#c9a96e"/><path d="M262 132 l40 -40" stroke="#fff" stroke-width="5" opacity=".35"/><path d="M270 132 l30 -30" stroke="#fff" stroke-width="2" opacity=".4"/></g>
    <path d="M262 132 V86 a18 18 0 0 1 36 0 V132z" fill="none" stroke="#c9a96e" stroke-width="3.5"/><rect x="258" y="132" width="44" height="6" rx="2" fill="#a07a4c"/></g>
  <g transform="translate(316,120)"><rect x="-14" y="0" width="28" height="56" fill="#8a5a2b"/>${[8,22,36].map(y=>`<rect x="-12" y="${y}" width="24" height="2" fill="#5a3a1c"/>${[0,1,2,3].map(i=>`<rect x="${-11+i*6}" y="${y-8}" width="4.5" height="8" fill="${["#9d3c3c","#5d7a63","#e2b553","#3460b8"][i]}"/>`).join("")}`).join("")}</g>
  <g transform="translate(286,176)"><path d="M-10 0 h20 l-3 -16 h-14z" fill="#b5652f"/><path d="M0 -16 C-14 -30 -12 -40 0 -46 C12 -40 14 -30 0 -16z" fill="#3f8f52"/><path d="M0 -16 C-6 -26 -16 -26 -18 -34" stroke="#4aa35e" stroke-width="3" fill="none"/></g>
  <g transform="translate(110,60)"><path d="M0 0 V22" stroke="#a07a4c" stroke-width="1.5"/><path d="M-8 22 h16 l-4 10 h-8z" fill="#e2b553"/><circle class="sunglow" cy="30" r="22" fill="url(#lampG)"/></g>
  ${bed?`<g transform="translate(20,96)"><rect x="0" y="40" width="46" height="18" rx="3" fill="#f3ead8"/><rect x="0" y="34" width="46" height="8" rx="3" fill="#7a9e86"/><rect x="-2" y="20" width="6" height="40" rx="2" fill="#8a5a2b"/><rect x="4" y="34" width="12" height="7" rx="3" fill="#fff"/></g>`:""}
  </svg>`}

/* ---- picture garden: the latest unlocked picture, gently animated; falls back to the drawn garden if a picture is missing ---- */
const lastPic=(N,inside)=>[...STAGES].reverse().find(([d,,,w])=>d<=N&&(inside?w==="in":w!=="in"));
function picScene(N,inside,svgFallback){const st=lastPic(N,inside);if(!st)return svgFallback;
  const seen=S.picSeen||0,isNew=st[0]>seen&&!inside,prev=isNew?lastPic(Math.min(seen,st[0]-1),false):null;
  const petals=Array.from({length:12},(_,i)=>`<i class="petal" style="left:${(i*37)%100}%;animation-delay:-${(i*1.7).toFixed(1)}s;animation-duration:${9+(i%5)*2}s"></i>`).join("");
  const motes=Array.from({length:18},(_,i)=>`<i class="mote" style="left:${(i*53)%100}%;top:${(i*29)%80+10}%;animation-delay:-${(i*.9).toFixed(1)}s"></i>`).join("");
  return`<div class="pic${isNew?" unlocking":""}">
    ${prev?`<img class="pimg old" src="garden/${prev[2]}.jpg" alt="" aria-hidden="true">`:""}
    <img class="pimg kb" src="garden/${st[2]}.jpg" alt="${esc(T().hs.st[st[1]])}" onerror="if(!this.dataset.png){this.dataset.png=1;this.src=this.src.replace(/\\.jpg$/,'.png')}else this.closest('.scene').classList.add('nopic')">
    <div class="rays"></div><div class="fx">${petals}${motes}</div>
    ${isNew?`<div class="unlock-badge">✨ ${T().hs.unlocked}</div>`:""}</div>
  <div class="svgfb">${svgFallback}</div>`}
function markPicSeen(N){const st=lastPic(N,false);if(st&&st[0]>(S.picSeen||0)){setTimeout(()=>{S.picSeen=st[0];save()},4000)}}

/* what was unlocked most recently, the next secret and the countdown */
function stagesCard(N){const t=T(),nx=nextStage(N),cur=[...STAGES].reverse().find(([d])=>d<=N);
  const grace=typeof graceCard==="function"?graceCard():"";
  const td=peek(TODAY()),todayDone=fullOK(td),left=nx?nx[0]-N:0;
  return grace+`<div class="card gdesc">
    ${cur?`<div class="gnow"><span class="tag c">${t.hs.dayN(cur[0])}</span><h2 style="margin-top:6px">${t.hs.st[cur[1]]}</h2><p class="gtext">${t.hs.desc[cur[1]]}</p></div>`:`<p class="gtext">${t.hs.desc.start}</p>`}
    ${nx?`<div class="secret">
      <div class="lockpic">${nx[2]?`<img src="garden/${nx[2]}.jpg" alt="" aria-hidden="true" onerror="this.remove()">`:""}<span>🔒</span></div>
      <div style="flex:1;min-width:0"><b>${t.hs.secretTitle}</b><div class="muted small">${t.hs.tease[cur?cur[1]:"grass"]}</div>
        <div class="countdown"><b>${left}</b> <span>${t.hs.daysLeft(left)}</span></div>
        <div class="nextgoal"><i style="width:${Math.min(100,(N-(cur?cur[0]:0))/((nx[0]-(cur?cur[0]:0))||1)*100)}%"></i></div>
        <div class="muted small">${todayDone?t.hs.todayDone:t.hs.todayOpen}</div></div></div>`:`<div class="goal">${t.hs.allDone}</div>`}
    <details><summary class="muted small">${t.hs.allStages}</summary><div class="stages">${STAGES.map(([d,k])=>`<div class="stage${N>=d?" got":""}"><b>${N>=d?"✓":"🔒 "+d}</b><span>${N>=d?t.hs.st[k]:"???"}</span></div>`).join("")}</div></details>
    <div class="muted small">${t.hs.note}</div></div>`}
