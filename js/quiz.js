/* Knowledge Journey: question bank, two-day challenges, daily question and "My Questions" history.
   Quran questions are generated from Tanzil metadata (so every answer is checked against the data); others come from quiz-data.js.
   Loaded before app.js; uses its globals only when called. */
function seedRand(str){let h=2166136261;for(const c of str)h=Math.imul(h^c.charCodeAt(0),16777619);return()=>{h=Math.imul(h^(h>>>15),2246822507);h=Math.imul(h^(h>>>13),3266489909);return((h^=h>>>16)>>>0)/4294967296}}
function shuffled(arr,seed){const a=arr.slice(),r=seedRand(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
/* pick 3 distinct wrong values from candidates, deterministic per question */
function wrongs(correct,cands,seed){return shuffled([...new Set(cands.filter(x=>x!==correct))],seed).slice(0,3)}
const nearNums=(n,lo,hi,spread)=>{const out=[];for(let d=1;d<=spread;d++){if(n-d>=lo)out.push(n-d);if(n+d<=hi)out.push(n+d)}return out};

let _bank=null;
function quizBank(){if(_bank)return _bank;const B=[],S_=i=>SURAH[i-1];
  const gen=(id,kind,args,ans,opts,ref)=>B.push({id,cat:"quran",src:"meta",kind,args,ans:String(ans),opts:shuffled([ans,...opts].map(String),id),ref});
  for(let s=1;s<=114;s++){const n=AYAT[s-1],rk=RUKU_STARTS[s-1].length,jz=Q_SURAH_JUZ[s-1];
    gen("ayat-"+s,"ayat",[S_(s)],n,wrongs(n,nearNums(n,3,286,6),"ay"+s),"Tanzil");
    gen("num-"+s,"num",[S_(s)],s,wrongs(s,nearNums(s,1,114,4),"nu"+s),"Tanzil");
    gen("juz-"+s,"juz",[S_(s)],jz,wrongs(jz,nearNums(jz,1,30,3),"jz"+s),"Tanzil");
    gen("ruku-"+s,"ruku",[S_(s)],rk,wrongs(rk,nearNums(rk,1,40,4),"rk"+s),"Tanzil");
    const mad=Q_REV[s-1]==="d",other=[];for(let x=1;x<=114;x++)if(Q_REV[x-1]!==Q_REV[s-1])other.push(S_(x));
    gen("rev-"+s,mad?"madani":"makki",[],S_(s),wrongs(S_(s),other,"rv"+s),"Tanzil");
    const diff=[];for(let x=1;x<=114;x++)if(AYAT[x-1]!==n)diff.push(S_(x));
    gen("has-"+s,"has",[n],S_(s),wrongs(S_(s),diff,"hs"+s),"Tanzil");
    if(s<114)gen("next-"+s,"next",[S_(s)],S_(s+1),wrongs(S_(s+1),[s-1,s-2,s-3,s+2,s+3,s+4].filter(x=>x>=1&&x<=114&&x!==s&&x!==s+1).map(S_),"nx"+s),"Tanzil");
    if(rk>=2){const a2=RUKU_STARTS[s-1][1];gen("r2-"+s,"ruku2",[S_(s)],a2,wrongs(a2,nearNums(a2,2,AYAT[s-1],5),"r2"+s),"Tanzil")}
    if(rk>=3){const a3=RUKU_STARTS[s-1][2];gen("r3-"+s,"ruku3",[S_(s)],a3,wrongs(a3,nearNums(a3,2,AYAT[s-1],5),"r3"+s),"Tanzil")}}
  Q_SAJDAS.forEach(([c,v],i)=>{const pool=Q_SAJDAS.filter(([c2,v2])=>c2!==c&&v2!==v).map(([c2])=>S_(c2));gen("saj-"+(i+1),"sajda",[v],S_(c),wrongs(S_(c),pool,"sj"+i),"Tanzil")});
  Q_JUZ_START.forEach(([c,v],i)=>{gen("jst-"+(i+1),"juzstart",[i+1],S_(c),wrongs(S_(c),[c-1,c+1,c+2,c-2,c+3].filter(x=>x>=1&&x<=114&&x!==c).map(S_),"js"+i),"Tanzil")});
  B.length=0; /* generated fact questions (ayah counts etc.) are too simple; keep only reflective ones */
  QUIZ_CURATED.forEach(q=>B.push({id:q.id,cat:q.cat,src:q.src,cur:q,ans:"0",opts:shuffled(["0","1","2","3"],q.id),ref:q.ref}));
  /* admin-managed rows replace built-in questions with the same id; anything not published is left out */
  const dbq=typeof DBQ==="object"&&DBQ?Object.values(DBQ).filter(r=>r.cat!=="quran"):[]; /* old generated Quran-fact rows are retired */
  if(dbq.length){const ids=new Set(dbq.map(r=>r.id));const kept=B.filter(q=>!ids.has(q.id));dbq.filter(r=>r.status==="published").forEach(r=>kept.push(rowToQ(r)));_bank=kept;return kept}
  _bank=B;return B}
const qById=id=>quizBank().find(q=>q.id===id);
/* text of a question, its options and explanation in the current language */
function qText(q){const t=T();if(q.cur)return q.cur.q[S.lang]||q.cur.q.en||"";return t.qz[q.kind](...q.args)}
function qOpt(q,o){if(q.cur){const x=q.cur.o[+o];if(!x)return"";if(Array.isArray(x))return S.lang==="ur"?x[1]:x[0];return x[S.lang]||x.en||""}return o}
function qExpl(q){const t=T();if(q.cur)return esc((q.cur.e||{})[S.lang]||(q.cur.e||{}).en||"");return t.qzExpl(q.kind,q.args,q.ans)}
function catOf(q){return q.cat}

/* ---- state ---- */
const QZ=()=>S.quiz||(S.quiz={att:{},ch:{},daily:{}});
const CH_SIZE=5, GAP_DAYS=1;
function catQuestions(cat){return shuffled(quizBank().filter(q=>q.cat===cat).map(q=>q.id),"cat-"+cat)}
function chState(cat){const c=QZ().ch[cat]||(QZ().ch[cat]={level:0});return c}
function chIds(cat,level){const ids=catQuestions(cat),start=level*CH_SIZE;return ids.slice(start,start+CH_SIZE)}
const levelsIn=cat=>Math.floor(catQuestions(cat).length/CH_SIZE);
const plusDays=(k,n)=>key(add(parse(k),n));
/* the next unanswered question of the current level and the date it opens */
function chNext(cat){const c=chState(cat),ids=chIds(cat,c.level),z=QZ();
  const i=ids.findIndex(id=>!z.att[id]);if(i<0)return{i:-1,ids};
  const prev=i?z.att[ids[i-1]]:null,opens=prev?plusDays(prev.date,GAP_DAYS):TODAY();return{i,ids,id:ids[i],opens,ready:opens<=TODAY()}}
function answer(qid,o,ctx){const z=QZ(),q=qById(qid),ok=o===q.ans,prev=z.att[qid];
  if(prev&&!ctx.retry)return prev;
  if(prev&&ctx.retry){prev.retrySel=o;prev.retryOk=ok;prev.retryPts=ok&&!prev.ok&&!prev.retryPts?3:0;prev.retryDate=TODAY();return prev}
  return z.att[qid]={sel:o,ok,date:TODAY(),pts:ok?10:0,cat:q.cat,via:ctx.via||""}}
function quizPoints(){const z=QZ();let p=0;Object.values(z.att).forEach(a=>p+=(a.pts||0)+(a.retryPts||0));Object.values(z.ch).forEach(c=>p+=(c.done||0)*20);return p}
function dailyQid(){const z=QZ(),k=TODAY();if(z.daily[k])return z.daily[k];
  const last=Object.keys(z.daily).sort().pop();
  if(last&&!z.att[z.daily[last]])return z.daily[last];
  const pool=quizBank().filter(q=>!z.att[q.id]);if(!pool.length)return null;const r=seedRand("daily"+k)();return z.daily[k]=pool[Math.floor(r*pool.length)].id}
function nextDailyDate(){const z=QZ(),last=Object.keys(z.daily).sort().pop();return last?plusDays(last,GAP_DAYS):TODAY()}

/* ---- views ---- */
let qz={mode:"home",cat:null,day:1,show:null,filter:{cat:"all",res:"all"},retry:null};
function optionsHtml(q,att,via){const t=T();
  return`<div class="qopts">${q.opts.map((o,i)=>{let cls="";if(att){if(o===q.ans)cls=" right";else if(o===att.sel)cls=" wrong"}
    return`<button class="qopt${cls}" data-qans="${q.id}|${esc(o)}|${via}"${att?" disabled":""}><span>${"ABCD"[i]}</span>${esc(qOpt(q,o))}</button>`}).join("")}</div>`}
function feedbackHtml(q,att){const t=T();if(!att)return"";
  return`<div class="qfeed ${att.ok?"ok":"no"}"><b>${att.ok?t.qzRight(att.pts):t.qzWrong(esc(qOpt(q,q.ans)))}</b><div>${qExpl(q)}</div><div class="muted small">${t.qzRef}: ${esc(q.src==="meta"?t.qzMetaRef:q.ref)}${q.src==="quran"?" · "+t.qzSrc.quran:q.src==="seerah"?" · "+t.qzSrc.seerah:""}</div></div>`}
function questionCard(qid,via,head){const q=qById(qid),att=QZ().att[qid];
  return`<div class="card qcard">${head||""}<div class="qtext">${esc(qText(q))}</div>${optionsHtml(q,att,via)}${feedbackHtml(q,att)}</div>`}
function dailyCard(){const t=T(),z=QZ(),id=dailyQid(),head=`<h2><span>${t.qzDaily}<span class="ar">سوال</span></span><span class="qscore">${t.qzScore}: <b>${quizPoints()}</b></span></h2><button class="linkbtn qlink" data-goto="quiz">${t.qzJourney} ›</button>`;
  if(!id)return`<div class="card">${head}<div class="muted">${t.qzNextOn(fmtDay(nextDailyDate()))}</div></div>`;
  const att=z.att[id];z.hide=z.hide||{};
  if(att&&z.hide[TODAY()])return`<div class="card qmini">${head}<div class="row" style="justify-content:space-between"><span class="muted">${att.ok?"✓ "+t.qzCorrect:"✗ "+t.qzIncorrect} · ${t.qzNextOn(fmtDay(nextDailyDate()))}</span><button class="linkbtn" data-qzshow="1">${t.qzShow}</button></div></div>`;
  return questionCard(id,"daily",head)+(att?`<div class="row"><button class="btn small" data-qzhide="1">${t.qzHide}</button></div>`:"")}

function vQuiz(){const t=T(),z=QZ();
  if(qz.mode==="play")return vChallenge();
  if(qz.mode==="history")return vHistory();
  const total=quizBank().length,tried=Object.keys(z.att).length,right=Object.values(z.att).filter(a=>a.ok).length;
  return`<div class="card"><h2><span>${t.qzJourney}<span class="ar">علم کا سفر</span></span><small>${t.qzCount(total)}</small></h2>
    <div class="garden-stats"><div><b>${tried}</b><span>${t.qzTried}</span></div><div><b>${tried?Math.round(right/tried*100):0}%</b><span>${t.qzCorrectPct}</span></div><div><b>${quizPoints()}</b><span>${t.qzScore}</span></div></div>
    <div class="muted small">${t.qzHow}</div>
    <button class="btn" data-qzmode="history">📜 ${t.qzMine}</button></div>
  <div class="card"><h2>${t.qzByCat}</h2>${QUIZ_CATS.map(cat=>{const all=quizBank().filter(q=>q.cat===cat),done=all.filter(q=>z.att[q.id]),ok=done.filter(q=>z.att[q.id].ok).length;
    return all.length?`<div class="lrow"><div class="lhead"><b>${t.qzCats[cat]}</b><span class="muted">${done.length}/${all.length} · ${t.qzOk(ok)}</span></div><div class="nextgoal"><i style="width:${done.length/all.length*100}%"></i></div></div>`:""}).join("")}</div>`}

function vChallenge(){const t=T(),c=chState(qz.cat),z=QZ(),n=chNext(qz.cat),ids=n.ids;
  const head=`<div class="row" style="justify-content:space-between"><button class="btn small" data-qzmode="home">‹ ${t.back}</button><span class="muted">${t.qzCats[qz.cat]} · ${t.qzLevel(c.level+1,levelsIn(qz.cat))}</span></div>
    <div class="pips">${ids.map(id=>`<span class="pip${z.att[id]?(z.att[id].ok?" on":" bad"):""}"></span>`).join("")}</div>`;
  const cur=qz.show||(n.ready?n.id:null);
  if(cur){const i=ids.indexOf(cur);
    return`<div class="card">${head}</div>${questionCard(cur,"ch",`<div class="muted">${t.qzQn(i+1,ids.length)}</div>`)}
      ${z.att[cur]?`<div class="card muted">${i<ids.length-1?t.qzQOpens(i+2,fmtDay(plusDays(z.att[cur].date,GAP_DAYS))):t.qzLastDone}</div><button class="btn primary" data-qzmode="home">${t.finish}</button>`:""}`}
  if(n.i>=0)return`<div class="card">${head}<div class="muted">${t.qzQOpens(n.i+1,fmtDay(n.opens))}</div></div>`;
  /* all five answered: results, then the next level */
  const right=ids.filter(id=>z.att[id].ok).length;
  return`<div class="card">${head}<h2>${t.qzFinal}</h2>
    <div class="garden-stats"><div><b>${right}/${ids.length}</b><span>${t.qzCorrect}</span></div><div><b>${ids.length-right}</b><span>${t.qzIncorrect}</span></div><div><b>${ids.reduce((a,id)=>a+(z.att[id].pts||0),0)+20}</b><span>${t.pts}</span></div></div>
    <div class="muted">${t.qzUnlocked}</div><button class="btn primary" data-qzfinish="1">${t.finish}</button></div>
  ${ids.map(id=>{const q=qById(id),a=z.att[id];return`<div class="card qhist ${a.ok?"ok":"no"}"><div class="qtext small">${esc(qText(q))}</div>${feedbackHtml(q,a)}</div>`}).join("")}`}
function finishDay(){const c=chState(qz.cat);if(chNext(qz.cat).i<0){c.level++;c.done=(c.done||0)+1}qz.mode="home"}
const fmtDay=k=>parse(k).toLocaleDateString(S.lang==="ur"?"ur-PK":"en-GB",{weekday:"short",day:"numeric",month:"short"});

function vHistory(){const t=T(),z=QZ(),f=qz.filter;
  z.hid=z.hid||{};const rows=Object.entries(z.att).filter(([id,a])=>(f.showHidden||!z.hid[id])&&(f.cat==="all"||a.cat===f.cat)&&(f.res==="all"||(f.res==="ok")===a.ok)).sort((a,b)=>b[1].date.localeCompare(a[1].date));
  return`<div class="card"><div class="row" style="justify-content:space-between"><button class="btn small" data-qzmode="home">‹ ${t.back}</button><b>${t.qzMine}</b></div>
    <div class="row"><select id="qhCat" aria-label="${t.qzCategory}"><option value="all">${t.all}</option>${QUIZ_CATS.map(c=>`<option value="${c}"${f.cat===c?" selected":""}>${t.qzCats[c]}</option>`).join("")}</select>
    <select id="qhRes" aria-label="${t.qzResult}"><option value="all">${t.all}</option><option value="ok"${f.res==="ok"?" selected":""}>${t.qzCorrect}</option><option value="no"${f.res==="no"?" selected":""}>${t.qzIncorrect}</option></select></div>
    <label class="check2"><input type="checkbox" id="qhHidden" ${f.showHidden?"checked":""}> <span>${t.qzShowHidden(Object.keys(z.hid).length)}</span></label>
    <div class="muted small">${t.qzMineHelp}</div></div>
  ${rows.length?rows.map(([id,a])=>{const q=qById(id);if(!q)return"";const retrying=qz.retry===id;
    return`<div class="card qhist ${a.ok?"ok":"no"}"><div class="muted small">${t.qzCats[a.cat]} · ${a.date} · ${t.qzPtsEarned((a.pts||0)+(a.retryPts||0))}</div>
      <div class="qtext">${esc(qText(q))}</div>
      ${retrying?optionsHtml(q,a.retrySel!==undefined&&a.retryDate===TODAY()&&qz.retryDone?{sel:a.retrySel}:null,"retry"):`<div class="qopts">${q.opts.map((o,i)=>`<div class="qopt static${o===q.ans?" right":o===a.sel?" wrong":""}"><span>${"ABCD"[i]}</span>${esc(qOpt(q,o))}</div>`).join("")}</div>`}
      ${retrying&&!qz.retryDone?"":`<div class="muted small">${t.qzYour}: <b>${esc(qOpt(q,a.sel))}</b> ${a.ok?"✓":"✗"} · ${t.qzAnswer}: <b>${esc(qOpt(q,q.ans))}</b></div><div>${qExpl(q)}</div><div class="muted small">${t.qzRef}: ${esc(q.src==="meta"?t.qzMetaRef:q.ref)}</div>`}
      ${!a.ok&&!a.retryOk&&!retrying?`<button class="btn small" data-qzretry="${id}">${t.qzRetry}</button>`:""}
      ${a.retryOk?`<div class="muted small">✓ ${t.qzRetried}</div>`:""}<button class="linkbtn" data-qzhid="${id}">${z.hid[id]?t.qzShow:t.qzHide}</button></div>`}).join(""):`<div class="card muted">${t.qzNone}</div>`}`}

/* click handler (from app.js); returns true when handled */
function quizClick(el){const ds=el.dataset;
  if(ds.qans){const[id,o,via]=ds.qans.split("|");if(via==="retry"){const a=answer(id,o,{retry:true});qz.retry=null;toast(a.retryOk?T().qzRight(a.retryPts||0):T().qzWrong(qOpt(qById(id),qById(id).ans)))}else{answer(id,o,{via});if(via==="ch")qz.show=id}return true}
  if(ds.qzhide){const z=QZ();z.hide=z.hide||{};z.hide[TODAY()]=true;return true}
  if(ds.qzshow){const z=QZ();z.hide=z.hide||{};delete z.hide[TODAY()];return true}
  if(ds.qzhid){const z=QZ();z.hid=z.hid||{};if(z.hid[ds.qzhid])delete z.hid[ds.qzhid];else z.hid[ds.qzhid]=true;return true}
  if(ds.qzmode){qz.mode=ds.qzmode;qz.show=null;qz.retry=null;return true}
  if(ds.qzplay){qz.mode="play";qz.cat=ds.qzplay;qz.show=null;return true}
  if(ds.qznext){qz.show=null;return true}
  if(ds.qzfinish){finishDay();return true}
  if(ds.qzretry){qz.retry=ds.qzretry;qz.retryDone=false;return true}
  return false}
