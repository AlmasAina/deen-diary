/* Private journal, Ramadan tracker and longest streak. Loaded before app.js; uses its globals only when called. */
const JTYPES=["reflection","gratitude","dua","goal","note"];
let jFilter="all",jQuery="",jEdit=null;

function vJournal(){const t=T(),list=(S.journal||[]).slice().sort((a,b)=>b.ts-a.ts)
    .filter(e=>(jFilter==="all"||e.type===jFilter)&&(!jQuery||e.text.toLowerCase().includes(jQuery.toLowerCase())));
  const edit=jEdit&&(S.journal||[]).find(e=>e.id===jEdit);
  const byDate={};list.forEach(e=>(byDate[e.date]=byDate[e.date]||[]).push(e));
  return`<div class="card"><h2><span>${t.journal}<span class="ar">روزنامچہ</span></span><small>🔒 ${t.private}</small></h2>
    <form id="jForm" class="authform">
      <div class="chips" role="radiogroup" aria-label="${t.jType}">${JTYPES.map(x=>`<label class="chip jtype"><input type="radio" name="jtype" value="${x}" ${(edit?edit.type:"reflection")===x?"checked":""}> ${t.jTypes[x]}</label>`).join("")}</div>
      <textarea id="jText" maxlength="4000" placeholder="${t.jPh}" style="min-height:110px;font-family:var(--body);font-size:.95rem">${edit?esc(edit.text):""}</textarea>
      <div class="err" id="jErr" role="alert"></div>
      <div class="row"><button class="btn primary">${edit?t.save:t.jAdd}</button>${edit?`<button type="button" class="btn" id="jCancel">${t.cancel}</button>`:""}</div></form></div>
  <div class="card"><div class="row"><input type="search" id="jSearch" value="${esc(jQuery)}" placeholder="${t.search}" aria-label="${t.search}" style="flex:1">
      <select id="jFilter" aria-label="${t.jType}"><option value="all">${t.all}</option>${JTYPES.map(x=>`<option value="${x}"${jFilter===x?" selected":""}>${t.jTypes[x]}</option>`).join("")}</select></div>
    ${list.length?Object.keys(byDate).map(dk=>`<div class="jday"><div class="muted"><b>${parse(dk).toLocaleDateString(S.lang==="ur"?"ur-PK":"en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}</b> · ${hijri(parse(dk))}</div>
      ${byDate[dk].map(e=>`<div class="jentry"><span class="tag c">${t.jTypes[e.type]||e.type}</span><div class="jtext">${esc(e.text).replace(/\n/g,"<br>")}</div>
        <div class="row"><button class="linkbtn" data-jedit="${e.id}">${t.edit}</button><button class="linkbtn danger-link" data-jdel="${e.id}">${t.remove}</button></div></div>`).join("")}</div>`).join("")
      :`<div class="muted">${(S.journal||[]).length?t.noMatch:t.jEmpty}</div>`}</div>`}

function saveJournal(){const t=T(),txt=document.getElementById("jText").value.trim(),type=(document.querySelector("input[name=jtype]:checked")||{}).value||"note",er=document.getElementById("jErr");
  if(!txt){er.textContent=t.jEmptyErr;return false}
  S.journal=S.journal||[];
  if(jEdit){const e=S.journal.find(x=>x.id===jEdit);if(e){e.text=txt;e.type=type;e.edited=Date.now()}jEdit=null}
  else S.journal.push({id:uid(),date:TODAY(),type,text:txt,ts:Date.now()});
  toast(t.saved);return true}

/* ---- Ramadan: shown automatically in Ramadan (Umm al-Qura month 9), or when turned on in Profile ---- */
let hijriNum;try{hijriNum=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn",{month:"numeric",day:"numeric"})}catch(e){}
function hijriMD(d){if(!hijriNum)return null;const p=hijriNum.formatToParts(d),m=+(p.find(x=>x.type==="month")||{}).value,dd=+(p.find(x=>x.type==="day")||{}).value;return m?{m,d:dd}:null}
function isRamadan(k){const h=hijriMD(parse(k));return!!h&&h.m===9}
function ramadanOn(k){const mode=S.ramadanMode||"auto";return mode==="on"||(mode==="auto"&&isRamadan(k))}
let _ab;const AYAH_BEFORE=()=>_ab||(_ab=(()=>{const a=[0];for(let i=0;i<113;i++)a.push(a[i]+AYAT[i]);return a})());
function khatamPct(){const p=S.qpos&&S.qpos.read;if(!p)return 0;const done=AYAH_BEFORE()[p.surah-1]+Math.min(p.ayah,AYAT[p.surah-1]+1)-1;return Math.round(done/6236*1000)/10}
function ramadanCard(k,d,dis){if(!ramadanOn(k))return"";const t=T(),r=d.ramadan||{},h=hijriMD(parse(k));
  /* in Ramadan count this Ramadan's days; when switched on outside Ramadan, count the last 30 days */
  const from=key(add(parse(k),-30)),inR=isRamadan(k),scope=Object.keys(S.days).filter(x=>x<=k&&(inR?isRamadan(x)&&x>from:x>from)&&S.days[x].ramadan);
  const fasted=scope.filter(x=>S.days[x].ramadan.fast==="yes").length,tarw=scope.filter(x=>S.days[x].ramadan.taraweeh).length;
  const opt=(f,v,l)=>`<button class="${v===r[f]?"on "+v:""}" data-ram="${f}|${v}"${dis}>${l}</button>`;
  const chk=(f,l)=>`<label class="check2"><input type="checkbox" data-ramck="${f}" ${r[f]?"checked":""}${dis}> <span>${l}</span></label>`;
  return`<div class="card ramadan"><h2><span>${t.ramadan}<span class="ar">رمضان</span></span><small>${h&&h.m===9?t.ramDay(h.d):""}</small></h2>
    <div class="prayer"><span>${t.fast}</span><div class="seg">${opt("fast","yes",t.fastYes)}${opt("fast","no",t.fastNo)}${opt("fast","excused",t.fastExcused)}</div></div>
    <div class="ramgrid">${chk("suhoor",t.suhoor)}${chk("iftar",t.iftar)}${chk("taraweeh",t.taraweeh)}${chk("charity",t.charity)}</div>
    <div class="row"><input type="text" data-ramtxt="charityNote" value="${esc(r.charityNote||"")}" maxlength="80" placeholder="${t.charityPh}" style="flex:1"${dis}></div>
    <div class="garden-stats"><div><b>${fasted}</b><span>${t.fastsKept}</span></div><div><b>${khatamPct()}%</b><span>${t.khatam}</span></div><div><b>${tarw}</b><span>${t.taraweeh}</span></div></div>
    <div class="muted small">${t.ramHelp}</div></div>`}

/* ---- longest run of full days; period days pause the run instead of breaking it ---- */
function longestStreak(){const ks=Object.keys(S.days).sort();if(!ks.length)return 0;let best=0,cur=0,k=ks[0];const end=TODAY();
  while(k<=end){const d=peek(k);if(d&&d.period){}else if(fullOK(d)){cur++;best=Math.max(best,cur)}else cur=0;k=key(add(parse(k),1))}return best}
