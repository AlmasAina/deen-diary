/* Admin panel (only for accounts listed in public.admin_emails; every action is re-checked by the database).
   Also loads admin-managed questions into the quiz bank. Loaded before app.js; uses its globals only when called. */
let isAdmin=false;
let DBQ={};try{DBQ=JSON.parse(localStorage.getItem("deen-diary-dbq")||"{}")}catch(e){}
async function loadDbQuestions(){if(!sb)return;try{const{data,error}=await sb.from("questions").select("*").in("status",["published","hidden"]);
  if(error)return;DBQ={};data.forEach(r=>DBQ[r.id]=r);try{localStorage.setItem("deen-diary-dbq",JSON.stringify(DBQ))}catch(e){}_bank=null}catch(e){}}
async function checkAdmin(){isAdmin=false;if(!sb||!me)return;try{const{data}=await sb.rpc("is_admin");isAdmin=data===true}catch(e){}}
/* a database row in the shape the quiz engine uses */
function rowToQ(r){return{id:r.id,cat:r.cat,src:r.src,ref:r.ref,ans:String(r.correct),opts:shuffled(["0","1","2","3"],r.id),
  cur:{q:r.q,o:r.options,e:r.expl},db:true}}

let adm={sec:"overview",stats:null,users:null,uq:"",qs:null,qf:{text:"",cat:"all",status:"all",page:0},edit:null,log:null,busy:false,msg:""};
const A=()=>T().adm;
async function admLoad(what){if(!isAdmin)return;adm.busy=true;adm.msg="";
  try{
    if(what==="stats"){const{data,error}=await sb.rpc("admin_stats");if(error)throw error;adm.stats=data}
    if(what==="users"){const{data,error}=await sb.rpc("admin_users",{search:adm.uq});if(error)throw error;adm.users=data}
    if(what==="qs"){const{data,error}=await sb.from("questions").select("*").order("updated_at",{ascending:false});if(error)throw error;adm.qs={};data.forEach(r=>adm.qs[r.id]=r)}
    if(what==="log"){const{data,error}=await sb.from("admin_log").select("*").order("at",{ascending:false}).limit(100);if(error)throw error;adm.log=data}
  }catch(e){adm.msg=(e&&e.message)||A().err}
  adm.busy=false;if(tab==="admin")render()}

function vAdmin(){const a=A();
  if(!isAdmin)return`<div class="card"><b>${a.noAccess}</b></div>`;
  const nav=`<div class="card"><div class="chips admnav">${["overview","users","questions","analytics","log"].map(s=>`<button class="chip${adm.sec===s||(s==="questions"&&adm.sec==="edit")?" on":""}" data-adm="${s}">${a.sec[s]}</button>`).join("")}</div>
    ${adm.msg?`<div class="err">${esc(adm.msg)}</div>`:""}${adm.busy?`<div class="muted">${a.loading}</div>`:""}</div>`;
  return nav+({overview:admOverview,users:admUsers,questions:admQuestions,edit:admEdit,analytics:admAnalytics,log:admLog}[adm.sec]||admOverview)()}

function stat(n,l){return`<div class="stat"><b>${n??"–"}</b><span>${l}</span></div>`}
function admOverview(){const a=A(),s=adm.stats;if(!s){if(!adm.busy)admLoad("stats");return""}
  const q=s.questions||{},bank=quizBank();
  return`<div class="card"><h2>${a.sec.overview}<button class="btn small" data-admreload="stats">↻</button></h2><div class="stats">
    ${stat(s.users,a.users)}${stat(s.verified,a.verified)}${stat(s.new7,a.new7)}${stat(s.new30,a.new30)}${stat(s.active1,a.active1)}${stat(s.active7,a.active7)}${stat(s.suspended,a.suspended)}
    ${stat(bank.length,a.liveQs)}${stat(q.published||0,a.pub)}${stat((q.draft||0)+(q.review||0),a.drafts)}${stat(s.attempts,a.attempts)}${stat(s.attempts?Math.round(s.correct/s.attempts*100)+"%":"–",a.correctPct)}${stat(s.challenges,a.challenges)}
  </div><div class="muted small">${a.privacy}</div></div>`}

function admUsers(){const a=A();if(!adm.users&&!adm.busy)admLoad("users");const list=adm.users||[];
  return`<div class="card"><form class="row" id="admUserForm"><input type="search" id="admUq" value="${esc(adm.uq)}" placeholder="${a.searchUsers}" style="flex:1"><button class="btn small primary">${T().search}</button></form>
    <div class="muted small">${a.usersCount(list.length)}</div></div>
  ${list.map(u=>`<div class="card urow"><div class="lhead"><b>${esc(u.name||"—")}</b><span class="tag ${u.suspended?"l":u.confirmed?"c":"r"}">${u.suspended?a.stSuspended:u.confirmed?a.stActive:a.stUnverified}</span></div>
    <div class="muted small">${esc(u.email)}</div>
    <div class="muted small">${a.joined}: ${(u.created_at||"").slice(0,10)} · ${a.lastActive}: ${u.last_active?u.last_active.slice(0,10):"–"}</div>
    ${u.id===me.id?"":`<div class="row"><button class="btn small ${u.suspended?"":"danger"}" data-admsusp="${u.id}|${u.suspended?0:1}">${u.suspended?a.reactivate:a.suspend}</button></div>`}</div>`).join("")}`}

/* every question the app knows: built-in (code) plus database rows */
function allAdminQs(){const rows=adm.qs||{},out=[],seen=new Set();
  Object.values(rows).forEach(r=>{seen.add(r.id);out.push({id:r.id,cat:r.cat,status:r.status,text:(r.q&&(r.q.en||r.q.roman||r.q.ur))||"",correct:r.options&&r.options[r.correct]?(r.options[r.correct].en||""):"",db:true,updated:r.updated_at,created:r.created_at,diff:r.difficulty})});
  const base=_bank?null:null;const saved=DBQ;DBQ={};_bank=null;const builtin=quizBank();DBQ=saved;_bank=null;
  builtin.forEach(q=>{if(seen.has(q.id))return;const L0=S.lang;S.lang="en";const text=qText(q),corr=qOpt(q,q.ans);S.lang=L0;
    out.push({id:q.id,cat:q.cat,status:"published",text,correct:corr,builtin:true,meta:!q.cur})});
  return out}
function admQuestions(){const a=A(),t=T();if(!adm.qs&&!adm.busy)admLoad("qs");const f=adm.qf,PER=40;
  let list=allAdminQs().filter(q=>(f.cat==="all"||q.cat===f.cat)&&(f.status==="all"||q.status===f.status)&&(!f.text||(q.text+" "+q.id).toLowerCase().includes(f.text.toLowerCase())));
  const pages=Math.max(1,Math.ceil(list.length/PER));f.page=Math.min(f.page,pages-1);const view=list.slice(f.page*PER,(f.page+1)*PER);
  return`<div class="card"><div class="row" style="justify-content:space-between"><b>${a.qList}</b><button class="btn small primary" data-admnew="1">+ ${a.addQ}</button></div>
    <div class="row"><input type="search" id="admQtext" value="${esc(f.text)}" placeholder="${t.search}" style="flex:1"></div>
    <div class="row"><select id="admQcat"><option value="all">${t.all}</option>${QUIZ_CATS.map(c=>`<option value="${c}"${f.cat===c?" selected":""}>${t.qzCats[c]}</option>`).join("")}</select>
      <select id="admQstatus"><option value="all">${t.all}</option>${["published","draft","review","hidden"].map(s=>`<option value="${s}"${f.status===s?" selected":""}>${a.st[s]}</option>`).join("")}</select></div>
    <div class="muted small">${a.qCount(list.length)} · ${a.builtinNote}</div></div>
  <div class="card tablewrap"><table class="qtable"><tr><th>ID</th><th>${a.question}</th><th>${a.category}</th><th>${a.answer}</th><th>${a.status}</th><th>${a.updated}</th><th></th></tr>
    ${view.map(q=>`<tr><td class="mono">${esc(q.id)}</td><td class="qcell">${esc(q.text)}</td><td>${t.qzCats[q.cat]||esc(q.cat)}</td><td class="qcell">${esc(q.correct)}</td>
      <td><span class="tag ${q.status==="published"?"c":q.status==="hidden"?"l":"r"}">${a.st[q.status]||q.status}${q.builtin?" · "+a.builtin:""}</span></td><td>${q.updated?q.updated.slice(0,10):"–"}</td>
      <td class="acts">${q.meta?"":`<button class="linkbtn" data-admedit="${esc(q.id)}">${a.edit}</button><button class="linkbtn" data-admdup="${esc(q.id)}">${a.dup}</button>`}
        ${q.status==="published"?`<button class="linkbtn" data-admstatus="${esc(q.id)}|${q.builtin||q.meta?"hidden":"draft"}">${a.unpublish}</button>`:`<button class="linkbtn" data-admstatus="${esc(q.id)}|published">${a.publish}</button>`}
        ${q.db?`<button class="linkbtn danger-link" data-admdel="${esc(q.id)}">${a.del}</button>`:""}</td></tr>`).join("")}</table>
    <div class="row" style="justify-content:space-between"><button class="btn small" data-admpage="-1"${f.page?"":" disabled"}>‹</button><span class="muted">${f.page+1} / ${pages}</span><button class="btn small" data-admpage="1"${f.page<pages-1?"":" disabled"}>›</button></div></div>`}

/* editor: built-in questions are copied into the database when saved, so the app uses the edited version */
function editorDraft(id,dup){const r=(adm.qs||{})[id];if(r)return JSON.parse(JSON.stringify(r));
  const q=quizBank().find(x=>x.id===id);if(!q||!q.cur)return null;const c=q.cur,o=c.o.map(x=>Array.isArray(x)?{en:x[0],roman:x[0],ur:x[1]}:x);
  return{id,cat:q.cat,difficulty:"easy",status:"published",q:{...c.q},options:o,correct:+q.ans,expl:{...c.e},ref:q.ref||"",src:q.src==="meta"?"quran":q.src,topic:"",points:10}}
function admEdit(){const a=A(),t=T(),e=adm.edit;if(!e)return"";const L=["en","roman","ur"],LN={en:"English",roman:"Roman Urdu",ur:"اردو"};
  const tri=(name,obj,rows)=>L.map(l=>`<label class="small">${LN[l]}</label><textarea data-ed="${name}.${l}" rows="${rows}"${l==="ur"?' dir="rtl"':""}>${esc((obj||{})[l]||"")}</textarea>`).join("");
  return`<form class="card authform" id="admEditForm"><div class="row" style="justify-content:space-between"><button type="button" class="btn small" data-adm="questions">‹ ${t.back}</button><b>${e.isNew?a.addQ:a.editQ} <span class="mono">${esc(e.id||"")}</span></b></div>
    <div class="field"><label>${a.category}</label><select data-ed="cat">${QUIZ_CATS.map(c=>`<option value="${c}"${e.cat===c?" selected":""}>${t.qzCats[c]}</option>`).join("")}</select></div>
    <div class="field"><label>${a.difficulty}</label><select data-ed="difficulty">${["easy","medium","hard"].map(d=>`<option value="${d}"${e.difficulty===d?" selected":""}>${a.diff[d]}</option>`).join("")}</select></div>
    <div class="field"><label>${a.status}</label><select data-ed="status">${["draft","review","published","hidden"].map(s=>`<option value="${s}"${e.status===s?" selected":""}>${a.st[s]}</option>`).join("")}</select></div>
    <div class="field"><label>${a.sourceType}</label><select data-ed="src">${["quran","hadith","seerah","history"].map(s=>`<option value="${s}"${e.src===s?" selected":""}>${a.srcType[s]}</option>`).join("")}</select></div>
    <div class="field"><label>${a.points}</label><input type="number" data-ed="points" min="0" max="100" value="${e.points??10}" style="width:90px"></div>
    <label>${a.topic}</label><input type="text" data-ed="topic" value="${esc(e.topic||"")}" maxlength="120">
    <h3 class="subh">${a.question}</h3>${tri("q",e.q,2)}
    ${[0,1,2,3].map(i=>`<h3 class="subh"><label class="check2"><input type="radio" name="edCorrect" value="${i}" ${e.correct===i?"checked":""}> ${a.option} ${"ABCD"[i]} ${e.correct===i?"✓ "+a.correctOpt:""}</label></h3>${tri("o"+i,(e.options||[])[i],1)}`).join("")}
    <h3 class="subh">${a.explanation}</h3>${tri("expl",e.expl,3)}
    <label>${a.reference}</label><input type="text" data-ed="ref" value="${esc(e.ref||"")}" maxlength="300" placeholder="Quran 33:37 · Sahih al-Bukhari 3744 · Ibn Hisham">
    <div class="muted small">${a.qualityNote}</div>
    <div class="err" id="admEditErr" role="alert"></div>
    <div class="row"><button class="btn primary">${t.save}</button><button type="button" class="btn" data-adm="questions">${t.cancel}</button></div></form>`}
function readEditor(){const e=adm.edit,f=document.getElementById("admEditForm");
  f.querySelectorAll("[data-ed]").forEach(el=>{const k=el.dataset.ed,v=el.value;
    if(k.includes(".")){const[o,l]=k.split(".");if(o.startsWith("o")&&o.length===2){e.options=e.options||[{},{},{},{}];e.options[+o[1]]=e.options[+o[1]]||{};e.options[+o[1]][l]=v.trim()}else{e[o]=e[o]||{};e[o][l]=v.trim()}}
    else e[k]=k==="points"?Math.max(0,Math.min(100,+v||0)):v.trim()});
  const c=f.querySelector("input[name=edCorrect]:checked");e.correct=c?+c.value:e.correct;return e}
function validateQ(e){const a=A();if(!e.q||!e.q.en)return a.vQ;if(!e.options||e.options.length!==4||e.options.some(o=>!o||!o.en))return a.vOpts;
  if(!(e.correct>=0&&e.correct<=3))return a.vCorrect;if(new Set(e.options.map(o=>o.en.toLowerCase())).size!==4)return a.vDupOpts;
  if(e.status==="published"&&(!e.expl||!e.expl.en||!e.ref))return a.vPublish;return""}
async function saveEditor(){const a=A(),e=readEditor(),er=document.getElementById("admEditErr"),bad=validateQ(e);if(bad){er.textContent=bad;return}
  const row={cat:e.cat,difficulty:e.difficulty,status:e.status,q:e.q,options:e.options,correct:e.correct,expl:e.expl||{},ref:e.ref||"",src:e.src,topic:e.topic||"",points:e.points??10};
  if(e.id)row.id=e.id;er.textContent=a.saving;
  const{error}=await sb.from("questions").upsert(row);if(error){er.textContent=error.message;return}
  toast(a.savedQ);adm.edit=null;adm.sec="questions";await Promise.all([admLoad("qs"),loadDbQuestions()]);render()}
async function setStatus(id,status){const a=A();let r=(adm.qs||{})[id];
  if(!r){const q=quizBank().find(x=>x.id===id);if(!q)return;
    if(q.cur)r=editorDraft(id);else{const L0=S.lang;S.lang="en";r={id,cat:q.cat,difficulty:"easy",q:{en:qText(q)},options:q.opts.map(o=>({en:String(qOpt(q,o))})),correct:q.opts.indexOf(q.ans),expl:{en:qExpl(q)},ref:"Tanzil",src:"meta",topic:"",points:10};S.lang=L0}}
  const row={...r,status};delete row.created_at;delete row.updated_at;delete row.created_by;delete row.isNew;
  const{error}=await sb.from("questions").upsert(row);if(error){toast(error.message);return}
  toast(a.st[status]);await Promise.all([admLoad("qs"),loadDbQuestions()])}

function admAnalytics(){const a=A(),t=T(),s=adm.stats;if(!s){if(!adm.busy)admLoad("stats");return""}
  const perq=(s.perq||[]).map(x=>({...x,q:quizBank().find(q=>q.id===x.id)}));
  const name=x=>x.q?esc(qText(x.q)):esc(x.id),pct=x=>x.n?Math.round(x.ok/x.n*100):0;
  const worst=perq.filter(x=>x.n>=2).sort((p,q)=>pct(p)-pct(q)).slice(0,10);
  return`<div class="card"><h2>${a.byCat}<button class="btn small" data-admreload="stats">↻</button></h2>
    ${(s.percat||[]).map(c=>`<div class="lrow"><div class="lhead"><b>${t.qzCats[c.cat]||esc(c.cat)}</b><span class="muted">${a.ofCorrect(c.ok,c.n)} · ${c.n?Math.round(c.ok/c.n*100):0}%</span></div><div class="nextgoal"><i style="width:${c.n?c.ok/c.n*100:0}%"></i></div></div>`).join("")||`<div class="muted">${a.noData}</div>`}</div>
  <div class="card"><h2>${a.mostWrong}</h2>${worst.map(x=>`<div class="lrow"><div class="lhead"><span>${name(x)}</span><b>${pct(x)}%</b></div><div class="muted small">${a.ofCorrect(x.ok,x.n)}</div></div>`).join("")||`<div class="muted">${a.noData}</div>`}</div>
  <div class="card"><h2>${a.mostTried}</h2>${perq.slice(0,10).map(x=>`<div class="lrow"><div class="lhead"><span>${name(x)}</span><b>${x.n}</b></div></div>`).join("")||`<div class="muted">${a.noData}</div>`}</div>`}

function admLog(){const a=A();if(!adm.log&&!adm.busy)admLoad("log");
  return`<div class="card"><h2>${a.sec.log}<button class="btn small" data-admreload="log">↻</button></h2>
    ${(adm.log||[]).map(l=>`<div class="lrow"><div class="lhead"><b>${esc(l.action)}</b><span class="muted small">${(l.at||"").replace("T"," ").slice(0,16)}</span></div><div class="muted small mono">${esc(l.target)} ${esc(l.detail||"")}</div></div>`).join("")||`<div class="muted">${a.noData}</div>`}</div>`}

/* event hooks called from app.js; return true when handled */
function adminClick(el){const ds=el.dataset;if(!isAdmin)return false;
  if(ds.adm){adm.sec=ds.adm;if(ds.adm!=="edit")adm.edit=null;render();return true}
  if(ds.admreload){adm[ds.admreload==="stats"?"stats":ds.admreload]=null;admLoad(ds.admreload);render();return true}
  if(ds.admnew){adm.edit={isNew:true,cat:"research",difficulty:"easy",status:"draft",src:"seerah",q:{},options:[{},{},{},{}],correct:0,expl:{},ref:"",points:10};adm.sec="edit";render();scrollTo(0,0);return true}
  if(ds.admedit){adm.edit=editorDraft(ds.admedit);if(!adm.edit)return true;adm.sec="edit";render();scrollTo(0,0);return true}
  if(ds.admdup){const d=editorDraft(ds.admdup);if(!d)return true;delete d.id;d.isNew=true;d.status="draft";adm.edit=d;adm.sec="edit";render();scrollTo(0,0);return true}
  if(ds.admstatus){const[id,st]=ds.admstatus.split("|");setStatus(id,st);return true}
  if(ds.admdel){if(!el.dataset.armed){el.dataset.armed="1";el.textContent=T().sure;return true}
    sb.from("questions").delete().eq("id",ds.admdel).then(async({error})=>{if(error)return toast(error.message);toast(A().deleted);await Promise.all([admLoad("qs"),loadDbQuestions()])});return true}
  if(ds.admsusp){const[id,s]=ds.admsusp.split("|");if(!el.dataset.armed){el.dataset.armed="1";el.textContent=T().sure;return true}
    sb.rpc("admin_set_suspended",{target:id,suspend:s==="1"}).then(({error})=>{if(error)return toast(error.message);adm.users=null;admLoad("users")});return true}
  if(ds.admpage){adm.qf.page+=+ds.admpage;render();return true}
  return false}
function adminChange(el){if(!isAdmin)return false;
  if(el.id==="admQtext"){adm.qf.text=el.value.trim();adm.qf.page=0;render();return true}
  if(el.id==="admQcat"){adm.qf.cat=el.value;adm.qf.page=0;render();return true}
  if(el.id==="admQstatus"){adm.qf.status=el.value;adm.qf.page=0;render();return true}
  return false}
function adminSubmit(form){if(!isAdmin)return false;
  if(form.id==="admEditForm"){saveEditor();return true}
  if(form.id==="admUserForm"){adm.uq=document.getElementById("admUq").value.trim();adm.users=null;admLoad("users");return true}
  return false}
