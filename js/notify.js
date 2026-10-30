/* Reminder preferences (stored in notification_prefs so the server can read them) and the in-app notification center.
   Loaded before app.js; uses its globals only when called. */
let NP=null,NLOG=[],npMsg="";
const NP_DEFAULT=()=>({email_on:false,daily_hour:20,tz:(Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Karachi"),cats:{quran:true,azkar:true,habits:true,learning:true},weekly:false,weekly_day:5,inactivity:false,quiet_from:22,quiet_to:6});
async function loadNotify(){if(!sb||!me)return;
  try{const{data}=await sb.from("notification_prefs").select("*").eq("user_id",me.id).maybeSingle();NP=Object.assign(NP_DEFAULT(),data||{})}catch(e){NP=NP_DEFAULT()}
  try{const{data}=await sb.from("notification_log").select("id,kind,day,title,body,read,sent_at").order("sent_at",{ascending:false}).limit(60);NLOG=data||[]}catch(e){NLOG=[]}
  updateBell()}
async function saveNotify(){if(!sb||!me||!NP)return;const t=T();NP.tz=Intl.DateTimeFormat().resolvedOptions().timeZone||NP.tz;
  const row={user_id:me.id,email_on:!!NP.email_on,daily_hour:+NP.daily_hour,tz:NP.tz,cats:NP.cats,weekly:!!NP.weekly,weekly_day:+NP.weekly_day,inactivity:!!NP.inactivity,quiet_from:+NP.quiet_from,quiet_to:+NP.quiet_to,updated_at:new Date().toISOString()};
  const{error}=await sb.from("notification_prefs").upsert(row);npMsg=error?(navigator.onLine?t.authErr:t.offline):t.saved;if(tab==="profile")render()}
const hourLbl=h=>`${(h%12)||12}:00 ${h<12?"AM":"PM"}`;
function notifyCard(){const t=T(),n=t.nt;if(!sb)return"";if(!NP)return`<div class="card"><h2>${n.title}</h2><div class="muted">${t.adm.loading}</div></div>`;
  const hours=[...Array(24).keys()],days=[0,1,2,3,4,5,6];
  const ck=(id,on,l,help)=>`<label class="toggle"><input type="checkbox" id="${id}" ${on?"checked":""}> <span><b>${l}</b>${help?`<br><span class="muted">${help}</span>`:""}</span></label>`;
  return`<div class="card"><h2>${n.title}<small>✉️ ${esc(me.email)}</small></h2><div class="muted small">${n.intro}</div>
    ${ck("npEmail",NP.email_on,n.daily,n.dailyHelp)}
    ${NP.email_on?`<div class="field"><label for="npHour">${n.time}</label><select id="npHour">${hours.map(h=>`<option value="${h}"${+NP.daily_hour===h?" selected":""}>${hourLbl(h)}</option>`).join("")}</select></div>
      <div class="chips">${["quran","azkar","habits","learning"].map(c=>`<label class="chip jtype"><input type="checkbox" data-npcat="${c}" ${NP.cats[c]!==false?"checked":""}> ${n.cats[c]}</label>`).join("")}</div>`:""}
    ${ck("npWeekly",NP.weekly,n.weekly,n.weeklyHelp)}
    ${NP.weekly?`<div class="field"><label for="npDay">${n.day}</label><select id="npDay">${days.map(d=>`<option value="${d}"${+NP.weekly_day===d?" selected":""}>${n.days[d]}</option>`).join("")}</select></div>`:""}
    ${ck("npInactive",NP.inactivity,n.inactive,n.inactiveHelp)}
    <div class="field"><label>${n.quiet}</label><select id="npQf">${hours.map(h=>`<option value="${h}"${+NP.quiet_from===h?" selected":""}>${hourLbl(h)}</option>`).join("")}</select><span class="muted">–</span><select id="npQt">${hours.map(h=>`<option value="${h}"${+NP.quiet_to===h?" selected":""}>${hourLbl(h)}</option>`).join("")}</select></div>
    <div class="muted small">${n.privacy} ${n.tz(esc(NP.tz))}</div>${npMsg?`<div class="muted small">✓ ${npMsg}</div>`:""}</div>`}
function notifyChange(el){if(!NP)return false;const id=el.id;
  if(id==="npEmail")NP.email_on=el.checked;else if(id==="npHour")NP.daily_hour=+el.value;else if(id==="npWeekly")NP.weekly=el.checked;else if(id==="npDay")NP.weekly_day=+el.value;
  else if(id==="npInactive")NP.inactivity=el.checked;else if(id==="npQf")NP.quiet_from=+el.value;else if(id==="npQt")NP.quiet_to=+el.value;
  else if(el.dataset.npcat)NP.cats={...NP.cats,[el.dataset.npcat]:el.checked};else return false;
  npMsg="";saveNotify();render();return true}

/* in-app notification center: emails that were sent plus today's open goals on this device */
function localNotes(){const t=T(),n=t.nt,d=peek(TODAY())||{},g=G(),out=[];
  ACTS.forEach(([a])=>{if(g[a].on&&!qDone(d,a)&&!d.period)out.push(n.goalOpen(t.acts[a]))});
  if(g.dhikr.on&&!(d.azkar||{}).morning&&new Date().getHours()>=5&&new Date().getHours()<12)out.push(n.goalOpen(t.azSets.morning+" "+t.azkar));
  if(g.dhikr.on&&!(d.azkar||{}).evening&&new Date().getHours()>=16)out.push(n.goalOpen(t.azSets.evening+" "+t.azkar));
  const dq=typeof dailyQid==="function"&&dailyQid();if(dq&&!QZ().att[dq])out.push(n.quizReady);
  return out}
function vNotes(){const t=T(),n=t.nt,loc=localNotes();
  return`<div class="card"><div class="row" style="justify-content:space-between"><button class="btn small" data-goto="today">‹ ${t.back}</button><b>${n.center}</b></div></div>
  <div class="card"><h2>${n.today}</h2>${loc.length?loc.map(x=>`<div class="lrow"><span>${x}</span></div>`).join(""):`<div class="muted">${n.allClear}</div>`}</div>
  <div class="card"><h2>${n.history}</h2>${sb?(NLOG.length?NLOG.map(x=>`<div class="lrow note${x.read?"":" unread"}"><div class="lhead"><b>${esc(x.title)}</b><span class="muted small">${x.day}</span></div><div class="muted small">${esc(x.body)}</div>
      ${x.read?"":`<button class="linkbtn" data-ntread="${x.id}">${n.markRead}</button>`}</div>`).join(""):`<div class="muted">${n.none}</div>`):`<div class="muted">${n.needAccount}</div>`}</div>`}
function updateBell(){const b=document.getElementById("bell");if(!b)return;const n=me?NLOG.filter(x=>!x.read).length+localNotes().length:0;
  b.hidden=!me;b.querySelector("span").textContent=n?String(n):"";b.setAttribute("aria-label",T().nt.center+(n?` (${n})`:""))}
async function markRead(id){const x=NLOG.find(y=>String(y.id)===String(id));if(!x)return;x.read=true;try{await sb.from("notification_log").update({read:true}).eq("id",x.id)}catch(e){}updateBell();render()}
