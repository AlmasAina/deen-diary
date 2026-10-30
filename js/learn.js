/* Learning goals: Quran activities (by ayah or ruku), revision, Seerat and Islamic literature.
   Loaded before app.js; uses app.js globals (S, T, dayOf, esc, uid, SURAH, AYAT, RUKU_STARTS) only when called. */
const ACTS=[["read","تلاوت"],["taj","تجوید"],["taf","تفسیر"],["tar","ترجمہ"]];
const LEGACY_FIELD={read:"reading",taj:"tajweed",tar:"tarjuma"};
const PRESETS={ayah:[1,2,3,4,5,7,10,15,20,30],ruku:[1,2,3,4,5]};
const LIMITS={ayah:286,ruku:40};
const REV_DAYS=[1,2,3,5,7,10,15];
const MINUTES=[10,15,20,30,45,60];
const SEERAT_MINUTES=[10,15,20,30,45];
const LIT_SUGGEST=[
  {en:"Seerat-un-Nabi ﷺ",roman:"Seerat-un-Nabi ﷺ",ur:"سیرت النبی ﷺ"},
  {en:"Seerat-ul-Ambiya",roman:"Seerat-ul-Ambiya",ur:"سیرت الانبیاء"},
  {en:"Seerat-us-Sahabah",roman:"Seerat-us-Sahabah",ur:"سیرت الصحابہ"},
  {en:"Islamic History",roman:"Islami Tareekh",ur:"اسلامی تاریخ"},
  {en:"Hadith Studies",roman:"Hadith ka mutala",ur:"مطالعۂ حدیث"},
  {en:"Stories of the Prophets",roman:"Qasas-ul-Ambiya",ur:"قصص الانبیاء"},
  {en:"Islamic Civilization",roman:"Islami Tehzeeb",ur:"اسلامی تہذیب"},
  {en:"Arabic Language and Grammar",roman:"Arabi zaban aur grammar",ur:"عربی زبان و قواعد"},
];
const actDefaults={read:{on:false,unit:"ayah",n:5},taj:{on:true,unit:"ruku",n:1},taf:{on:false,unit:"ayah",n:3},tar:{on:true,unit:"ayah",n:4}};

/* bring older saved goals (fixed tarjuma/tajweed settings) into the new shape without losing positions */
function migrateGoals(g){
  for(const[a]of ACTS){const old=g[a]||{},def=actDefaults[a];
    if(!g[a]||!g[a].unit){g[a]={on:old.on!==undefined?!!old.on:def.on,unit:a==="taj"&&old.days?"ruku":def.unit,n:a!=="taj"&&old.n?old.n:def.n}}
    if(!g[a].rev)g[a].rev={on:false,days:1}}
  if(!g.seerat)g.seerat={on:false,min:15};
  if(!S.qpos){S.qpos={read:S.readPos||{surah:1,ayah:1},tar:S.tarjumaPos||{surah:1,ayah:1},taf:{surah:1,ayah:1},
    taj:S.tajweedPos?{surah:S.tajweedPos.surah,ayah:rukuStart(S.tajweedPos.surah,S.tajweedPos.ruku)}:{surah:1,ayah:1}}}
  for(const[a]of ACTS)if(!S.qpos[a])S.qpos[a]={surah:1,ayah:1};
  if(!S.lit)S.lit=[];if(!S.lastRev)S.lastRev={};
  return g}

/* ---- ruku helpers ---- */
const rukuStart=(s,r)=>{const st=RUKU_STARTS[s-1];return st[Math.min(Math.max(1,r),st.length)-1]};
function rukuOf(s,a){const st=RUKU_STARTS[s-1];let i=0;while(i+1<st.length&&st[i+1]<=a)i++;return i}
const rukuEnd=(s,i)=>{const st=RUKU_STARTS[s-1];return i+1<st.length?st[i+1]-1:AYAT[s-1]};
function normPos(p){let s=p.surah,a=p.ayah;if(a>AYAT[s-1]){s=s>=114?1:s+1;a=1}return{surah:s,ayah:Math.max(1,a)}}
/* today's target for one activity, never crossing the end of a surah */
function nextRange(act){const g=G()[act],{surah,ayah}=normPos(S.qpos[act]),n=Math.max(1,+g.n||1);
  if(g.unit==="ruku"){const i=rukuOf(surah,ayah),j=Math.min(i+n-1,RUKU_STARTS[surah-1].length-1);return{surah,from:ayah,to:rukuEnd(surah,j),r1:i+1,r2:j+1}}
  const to=Math.min(AYAT[surah-1],ayah+n-1);return{surah,from:ayah,to,r1:rukuOf(surah,ayah)+1,r2:rukuOf(surah,to)+1}}
function qRec(d,act){if(!d)return null;if(d.q&&d.q[act])return d.q[act];const lf=LEGACY_FIELD[act],x=lf&&d[lf];
  if(!x)return null;return x.from?x:{surah:x.surah,from:rukuStart(x.surah,x.ruku),to:rukuEnd(x.surah,(x.ruku||1)-1)}}
const qDone=(d,act)=>!!qRec(d,act);
function toggleQ(k,act){const d=dayOf(k);d.q=d.q||{};const pos=S.qpos[act];
  if(!d.q[act]&&LEGACY_FIELD[act]&&d[LEGACY_FIELD[act]]){d[LEGACY_FIELD[act]]=null;return}
  if(d.q[act]){const r=d.q[act],np=normPos(pos);
    if((pos.surah===r.surah&&pos.ayah===r.to+1)||(np.surah!==r.surah&&normPos({surah:r.surah,ayah:r.to+1}).surah===np.surah&&np.ayah===1))S.qpos[act]={surah:r.surah,ayah:r.from};
    delete d.q[act];return}
  const r=nextRange(act);d.q[act]={surah:r.surah,from:r.from,to:r.to,unit:G()[act].unit};S.qpos[act]={surah:r.surah,ayah:r.to+1}}

/* ---- revision: content completed since the last revision, due every N days ---- */
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/864e5);
function revContent(act,upto){const last=S.lastRev[act]||"";const out=[];
  Object.keys(S.days).sort().forEach(k=>{if(k>last&&k<upto){const r=qRec(S.days[k],act);if(r)out.push(r)}});return out}
function revState(act,k){const g=G()[act];if(!g.on||!g.rev.on)return null;const d=peek(k);
  if(d&&d.rev&&d.rev[act])return{done:true,items:d.rev[act].items||[]};
  const items=revContent(act,k);if(!items.length)return null;
  const last=S.lastRev[act],since=last?daysBetween(last,k):daysBetween(Object.keys(S.days).sort().find(x=>qRec(S.days[x],act))||k,k);
  return since>=g.rev.days?{done:false,items}:null}
function toggleRev(k,act){const d=dayOf(k);d.rev=d.rev||{};
  if(d.rev[act]){S.lastRev[act]=d.rev[act].prev||"";delete d.rev[act];return}
  d.rev[act]={prev:S.lastRev[act]||"",items:revContent(act,k).slice(-10)};S.lastRev[act]=k}
function fmtRange(r){return`${SURAH[r.surah-1]} ${r.from}${r.to!==r.from?"–"+r.to:""}`}

/* ---- minutes for Seerat and literature topics ---- */
function addMinutes(k,kind,id,delta){const d=dayOf(k);
  if(kind==="seerat")d.seerat=Math.max(0,Math.min(600,(d.seerat||0)+delta));
  else{d.lit=d.lit||{};d.lit[id]=Math.max(0,Math.min(600,(d.lit[id]||0)+delta))}}
function learnGoalsMet(d){if(!d)return 0;let n=0;const g=G();
  if(g.seerat.on&&(d.seerat||0)>=g.seerat.min)n++;
  S.lit.forEach(x=>{if(((d.lit||{})[x.id]||0)>=x.min)n++});return n}
function learnGoalsCount(){return(G().seerat.on?1:0)+S.lit.length}

/* ---- today cards ---- */
function qCard(act,ar,d,dis){const t=T(),g=G()[act],rec=qRec(d,act),pos=normPos(S.qpos[act]),r=nextRange(act);
  const target=g.unit==="ruku"?t.rukuTarget(g.n):t.ayahTarget(g.n);
  const goal=rec?t.qDone(fmtRange(rec)):t.qGoal(SURAH[r.surah-1],r.from,r.to,r.r1===r.r2?r.r1:r.r1+"–"+r.r2);
  return`<div class="card"><h2><span>${t.acts[act]}<span class="ar">${ar}</span></span><small>${target}</small></h2>
    <div class="row"><select data-qsurah="${act}" aria-label="${t.acts[act]}: Surah"${dis}>${surahOptions(pos.surah)}</select>
      <input type="number" data-qayah="${act}" min="1" max="${AYAT[pos.surah-1]}" value="${pos.ayah}" style="width:80px" aria-label="${t.nextAyah}"${dis}></div>
    <div class="goal">${goal}</div>
    <button class="btn ${rec?"done":"primary"}" data-qdo="${act}"${dis}>${rec?t.tarUndo:t.markDone}</button></div>`}
function revCard(k,dis){const t=T(),rows=ACTS.map(([a])=>[a,revState(a,k)]).filter(x=>x[1]);if(!rows.length)return"";
  return`<div class="card rev"><h2><span>${t.revision}<span class="ar">دہرائی</span></span><small>${t.revWhy}</small></h2>
    ${rows.map(([a,st])=>`<div class="revrow${st.done?" done":""}"><div style="flex:1;min-width:0"><b>${t.acts[a]}</b><div class="muted">${st.items.slice(-6).map(fmtRange).join(" · ")||"–"}</div></div>
      <button class="btn small ${st.done?"done":"primary"}" data-revdo="${a}"${dis}>${st.done?"✓ "+t.revised:t.revDone}</button></div>`).join("")}</div>`}
function learnCard(d,dis){const t=T(),g=G(),rows=[];
  if(g.seerat.on)rows.push(["seerat","",t.seerat,g.seerat.min,d.seerat||0]);
  S.lit.forEach(x=>rows.push(["lit",x.id,esc(x.name),x.min,(d.lit||{})[x.id]||0]));
  if(!rows.length)return"";
  return`<div class="card"><h2><span>${t.learning}<span class="ar">مطالعہ</span></span><small>${t.minutesToday}</small></h2>
    ${rows.map(([kind,id,name,min,v])=>`<div class="lrow${v>=min?" done":""}"><div class="lhead"><b>${name}</b><span class="muted">${t.minOf(v,min)}</span></div>
      <div class="nextgoal"><i style="width:${Math.min(100,v/min*100)}%"></i></div>
      <div class="row"><button class="btn small" data-mins="${kind}|${id}|-5"${dis} aria-label="−5">−5</button><button class="btn small" data-mins="${kind}|${id}|5"${dis}>+5</button><button class="btn small" data-mins="${kind}|${id}|10"${dis}>+10</button>
        ${v<min?`<button class="btn small primary" data-mins="${kind}|${id}|${min-v}"${dis}>${t.goalReached}</button>`:`<span class="muted">✓ ${t.goalMet}</span>`}</div></div>`).join("")}</div>`}

/* ---- preferences (Profile and first-run setup) ---- */
function prefsCard(wizard){const t=T(),g=G();
  const sel=(attr,v,opts,fmt)=>`<select ${attr}>${opts.map(o=>`<option value="${o}"${String(v)===String(o)?" selected":""}>${fmt?fmt(o):o}</option>`).join("")}</select>`;
  const actBlock=([a,ar])=>{const x=g[a],custom=!PRESETS[x.unit].includes(+x.n);
    return`<details class="pref"${x.on&&!wizard?" open":""}><summary><label class="toggle" onclick="event.stopPropagation()"><input type="checkbox" data-gon="${a}" ${x.on?"checked":""}> <b>${t.acts[a]}</b> <span class="ar">${ar}</span></label><span class="muted">${x.on?(x.unit==="ruku"?t.rukuTarget(x.n):t.ayahTarget(x.n)):t.off}</span></summary>
      <div class="prefbody">
        <div class="muted">${t.actHelp[a]}</div>
        <div class="field"><label>${t.targetBy}</label>${sel(`data-gunit="${a}"`,x.unit,["ayah","ruku"],u=>u==="ayah"?t.ayahs:t.rukus)}</div>
        <div class="field"><label>${x.unit==="ruku"?t.howManyRukus:t.howManyAyahs}</label>${sel(`data-gn="${a}"`,custom?"custom":x.n,[...PRESETS[x.unit],"custom"],o=>o==="custom"?t.custom:o)}
          ${custom?`<input type="number" data-gcustom="${a}" min="1" max="${LIMITS[x.unit]}" value="${x.n}" style="width:90px" aria-label="${t.custom}">`:""}</div>
        <div class="muted small">${x.unit==="ruku"?t.rukuExample:t.ayahExample}</div>
        <div class="field"><label class="toggle"><input type="checkbox" data-grev="${a}" ${x.rev.on?"checked":""}> <span>${t.revision}</span></label>
          ${sel(`data-grevd="${a}" aria-label="${t.revFreq}"`,x.rev.days,REV_DAYS,o=>t.everyDays(o))}</div>
        <div class="muted small">${t.revHelp(x.rev.days)}</div>
      </div></details>`};
  const used=new Set(S.lit.map(x=>x.name.toLowerCase()));
  const sugg=LIT_SUGGEST.filter(s=>!used.has((s[S.lang]||s.en).toLowerCase()));
  return`<div class="card${wizard?" wizard":""}"><h2>${wizard?t.wizTitle:t.myGoals}</h2><div class="muted">${wizard?t.wizSub:t.goalsNote}</div>
    <h3 class="subh">${t.quranSection}</h3>
    ${ACTS.map(actBlock).join("")}
    <h3 class="subh">${t.seerat}</h3>
    <div class="pref flat"><label class="toggle"><input type="checkbox" id="gSeeratOn" ${g.seerat.on?"checked":""}> <b>${t.seeratGoal}</b></label>
      <div class="field"><label for="gSeeratMin">${t.dailyTime}</label>${sel('id="gSeeratMin"',g.seerat.min,SEERAT_MINUTES,o=>t.mins(o))}</div>
      <div class="muted small">${t.seeratHelp}</div></div>
    <h3 class="subh">${t.literature}</h3>
    <div class="muted small">${t.litHelp}</div>
    ${S.lit.map(x=>`<div class="topic"><input type="text" data-litname="${x.id}" value="${esc(x.name)}" maxlength="60" aria-label="${t.topicName}">
      ${sel(`data-litmin="${x.id}" aria-label="${t.dailyTime}"`,x.min,MINUTES,o=>t.mins(o))}<button class="x" data-litdel="${x.id}" aria-label="${t.remove}">×</button></div>`).join("")}
    ${sugg.length?`<div class="chips">${sugg.map(s=>`<button type="button" class="chip" data-litadd="${esc(s[S.lang]||s.en)}">+ ${esc(s[S.lang]||s.en)}</button>`).join("")}</div>`:""}
    <form class="topic add" id="litForm"><input type="text" id="litName" maxlength="60" placeholder="${t.addOwnTopic}" aria-label="${t.addOwnTopic}">
      ${sel('id="litMin" aria-label="'+t.dailyTime+'"',15,MINUTES,o=>t.mins(o))}<button class="btn small primary" id="litAddBtn" disabled>${t.add}</button></form>
    <div class="err" id="litErr" role="alert"></div>
    <h3 class="subh">${t.dhikr}</h3>
    <div class="pref flat"><label class="toggle"><input type="checkbox" data-goal="dhikr" ${g.dhikr.on?"checked":""}> <b>${t.dhikr}</b></label></div>
    ${wizard?`<div class="row"><button class="btn primary" id="wizDone">${t.wizStart}</button><button class="linkbtn" id="wizSkip">${t.skip}</button></div>`:""}</div>`}

/* ---- preference events (called from app.js change/click/submit handlers); return true when handled ---- */
function learnChange(el){const g=G(),ds=el.dataset;
  if(ds.gon){g[ds.gon].on=el.checked;return true}
  if(ds.gunit){const x=g[ds.gunit];x.unit=el.value;x.n=PRESETS[x.unit].includes(+x.n)&&+x.n<=LIMITS[x.unit]?x.n:1;return true}
  if(ds.gn){const x=g[ds.gn];x.n=el.value==="custom"?(PRESETS[x.unit].includes(+x.n)?6:x.n):+el.value;return true}
  if(ds.gcustom){const x=g[ds.gcustom],v=Math.round(+el.value);if(!(v>=1&&v<=LIMITS[x.unit])){el.value=x.n;toast(T().rangeErr(LIMITS[x.unit]));return false}x.n=v;return true}
  if(ds.grev){g[ds.grev].rev.on=el.checked;return true}
  if(ds.grevd){g[ds.grevd].rev.days=+el.value;return true}
  if(el.id==="gSeeratOn"){g.seerat.on=el.checked;return true}
  if(el.id==="gSeeratMin"){g.seerat.min=+el.value;return true}
  if(ds.litname){const x=S.lit.find(y=>y.id===ds.litname),v=el.value.trim();if(!x)return false;
    if(!v||S.lit.some(y=>y.id!==x.id&&y.name.toLowerCase()===v.toLowerCase())){el.value=x.name;toast(v?T().topicDup:T().topicEmpty);return false}x.name=v;return true}
  if(ds.litmin){const x=S.lit.find(y=>y.id===ds.litmin);if(x)x.min=+el.value;return!!x}
  if(ds.qsurah){S.qpos[ds.qsurah]={surah:+el.value,ayah:1};return true}
  if(ds.qayah){const p=S.qpos[ds.qayah],s=normPos(p).surah;S.qpos[ds.qayah]={surah:s,ayah:Math.max(1,Math.min(AYAT[s-1],Math.round(+el.value)||1))};return true}
  return false}
function addTopic(name,min){const t=T(),v=(name||"").trim();
  if(!v)return t.topicEmpty;if(v.length>60)return t.topicLong;if(S.lit.some(y=>y.name.toLowerCase()===v.toLowerCase()))return t.topicDup;
  if(S.lit.length>=20)return t.topicMax;S.lit.push({id:uid(),name:v,min:MINUTES.includes(+min)?+min:15});return""}
