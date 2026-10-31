/* Phone reminders in the Android/iOS app, scheduled on the device so they arrive even when the app is closed:
   prayer times, a daily goal reminder and salawat reminders, refreshed for the next 7 days whenever the app opens.
   On the website this card explains that these reminders need the app. Loaded before app.js. */
const isNative=()=>!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform());
const LN=()=>isNative()&&window.Capacitor.Plugins&&window.Capacitor.Plugins.LocalNotifications;
const SALAWAT_SLOTS={1:[20],3:[9,15,21],5:[8,11,14,18,21]};
const PR=()=>S.phoneRemind||(S.phoneRemind={goal:false,goalHour:20,salawat:false,salawatPerDay:3});
let lnTimer=null,lnStatus="";
function queueLocalSchedule(){clearTimeout(lnTimer);lnTimer=setTimeout(scheduleLocal,800)}
async function scheduleLocal(){const ln=LN();if(!ln||!me)return;const t=T(),r=PR(),p=PS();
  try{
    const pending=await ln.getPending();if(pending.notifications&&pending.notifications.length)await ln.cancel({notifications:pending.notifications.map(n=>({id:n.id}))});
    if(!r.goal&&!r.salawat&&!p.notify){lnStatus="";return}
    let perm=await ln.checkPermissions();if(perm.display!=="granted")perm=await ln.requestPermissions();
    if(perm.display!=="granted"){lnStatus=t.ph.denied;return}
    const now=Date.now(),list=[];let id=1000;
    for(let i=0;i<7;i++){const day=add(new Date(),i),k=key(day);
      const at=h=>{const d=new Date(day);d.setHours(Math.floor(h),Math.round((h%1)*60),0,0);return d};
      if(p.notify&&p.lat!=null){const tt=prayerTimes(day,p.lat,p.lng,autoMethod(p.lat,p.lng),ASR_SHADOW);
        PRAYERS.forEach(([pk,name])=>{const d=at(fixH(tt[pk]));if(d.getTime()>now)list.push({id:id++,title:"Deen Say",body:t.ptNotifBody(name),schedule:{at:d,allowWhileIdle:true}})})}
      if(r.goal){const d=at(r.goalHour);if(d.getTime()>now)list.push({id:id++,title:"Deen Say",body:t.ph.goalBody,schedule:{at:d,allowWhileIdle:true}})}
      {const g=G().special;if(r.goal&&g.mulk){const d=at(21);if(d.getTime()>now)list.push({id:id++,title:"Deen Say",body:t.sp.mulkRemind,schedule:{at:d,allowWhileIdle:true}})}
       if(r.goal&&g.kahf&&day.getDay()===5){const d=at(9);if(d.getTime()>now)list.push({id:id++,title:"Deen Say",body:t.sp.kahfRemind,schedule:{at:d,allowWhileIdle:true}})}}
      if(r.salawat)(SALAWAT_SLOTS[r.salawatPerDay]||SALAWAT_SLOTS[3]).forEach(h=>{const d=at(h);if(d.getTime()>now)list.push({id:id++,title:"Deen Say",body:t.ph.salawatBody,schedule:{at:d,allowWhileIdle:true}})});
    }
    if(list.length)await ln.schedule({notifications:list.slice(0,60)});
    lnStatus=t.ph.scheduled(Math.min(list.length,60));
  }catch(e){lnStatus=t.ph.failed}
  if(tab==="profile")render()}

function phoneCard(){const t=T(),h=t.ph,r=PR(),hours=[...Array(24).keys()];
  if(!isNative())return`<div class="card"><h2>${h.title}</h2><div class="muted small">${h.webNote}</div></div>`;
  return`<div class="card"><h2>${h.title}</h2><div class="muted small">${h.intro}</div>
    <label class="toggle"><input type="checkbox" id="phGoal" ${r.goal?"checked":""}> <span><b>${h.goal}</b><br><span class="muted">${h.goalHelp}</span></span></label>
    ${r.goal?`<div class="field"><label for="phGoalHour">${t.nt.time}</label><select id="phGoalHour">${hours.map(x=>`<option value="${x}"${r.goalHour===x?" selected":""}>${hourLbl(x)}</option>`).join("")}</select></div>`:""}
    <label class="toggle"><input type="checkbox" id="phSalawat" ${r.salawat?"checked":""}> <span><b>${h.salawat}</b><br><span class="muted">${h.salawatHelp}</span></span></label>
    ${r.salawat?`<div class="field"><label for="phSalawatN">${h.perDay}</label><select id="phSalawatN">${[1,3,5].map(n=>`<option value="${n}"${r.salawatPerDay===n?" selected":""}>${h.times(n)}</option>`).join("")}</select></div>`:""}
    <div class="muted small">${h.prayerNote}</div>${lnStatus?`<div class="muted small">✓ ${lnStatus}</div>`:""}</div>`}
function phoneChange(el){const r=PR(),id=el.id;
  if(id==="phGoal")r.goal=el.checked;else if(id==="phGoalHour")r.goalHour=+el.value;else if(id==="phSalawat")r.salawat=el.checked;else if(id==="phSalawatN")r.salawatPerDay=+el.value;else return false;
  save();queueLocalSchedule();render();return true}

/* server push (Firebase Cloud Messaging): register this phone and save its token to the user's account */
let pushDone=false;
async function registerPush(){const P=isNative()&&window.Capacitor.Plugins&&window.Capacitor.Plugins.PushNotifications;if(!P||!sb||!me||pushDone)return;pushDone=true;
  try{let perm=await P.checkPermissions();if(perm.receive!=="granted")perm=await P.requestPermissions();if(perm.receive!=="granted")return;
    await P.addListener("registration",async tok=>{try{await sb.from("device_tokens").upsert({token:tok.value,user_id:me.id,platform:"android",updated_at:new Date().toISOString()});
      await sb.from("notification_prefs").upsert({user_id:me.id,tz:Intl.DateTimeFormat().resolvedOptions().timeZone||"Asia/Karachi"},{onConflict:"user_id",ignoreDuplicates:true})}catch(e){}});
    await P.addListener("pushNotificationActionPerformed",()=>{tab="notes";render()});
    await P.register()}catch(e){pushDone=false}}
