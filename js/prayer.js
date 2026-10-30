/* Prayer times (standard astronomical method), azkar reader and prayer reminders.
   Loaded before app.js; uses its globals only when called. Times are in the phone's own time zone. */
const PT_METHODS={
  karachi:{fajr:18,isha:18},      // University of Islamic Sciences, Karachi
  mwl:{fajr:18,isha:17},          // Muslim World League
  isna:{fajr:15,isha:15},         // Islamic Society of North America
  egypt:{fajr:19.5,isha:17.5},    // Egyptian General Authority of Survey
  makkah:{fajr:18.5,ishaMin:90},  // Umm al-Qura, Makkah
};
const PT_CITIES=[["Karachi",24.8607,67.0011],["Lahore",31.5204,74.3587],["Islamabad",33.6844,73.0479],["Rawalpindi",33.5651,73.0169],["Faisalabad",31.4504,73.135],
  ["Multan",30.1575,71.5249],["Peshawar",34.0151,71.5249],["Quetta",30.1798,66.975],["Hyderabad",25.396,68.3578],["Sialkot",32.4945,74.5229],["Gujranwala",32.1877,74.1945],
  ["Sukkur",27.7052,68.8574],["Bahawalpur",29.3956,71.6836],["Abbottabad",34.1688,73.2215],["Mardan",34.198,72.0404],["Muzaffarabad",34.3700,73.4711]];
const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI,fixH=h=>((h%24)+24)%24;
function sunPos(jd){const D=jd-2451545,g=rad(357.529+.98560028*D),q=((280.459+.98564736*D)%360+360)%360;
  const L=rad(q+1.915*Math.sin(g)+.02*Math.sin(2*g)),e=rad(23.439-.00000036*D);
  const RA=deg(Math.atan2(Math.cos(e)*Math.sin(L),Math.cos(L)))/15;return{decl:Math.asin(Math.sin(e)*Math.sin(L)),eqt:q/15-fixH(RA)}}
function prayerTimes(date,lat,lng,method,asrFactor){const y=date.getFullYear(),m=date.getMonth()+1,d=date.getDate();
  const A=Math.floor((14-m)/12),Y=y+4800-A,M=m+12*A-3,jdn=d+Math.floor((153*M+2)/5)+365*Y+Math.floor(Y/4)-Math.floor(Y/100)+Math.floor(Y/400)-32045;
  const jd=jdn-.5-lng/360+.5,tz=-new Date(y,m-1,d,12).getTimezoneOffset()/60,{decl,eqt}=sunPos(jd),la=rad(lat);
  const noon=fixH(12-eqt)+tz-lng/15;
  const T=a=>deg(Math.acos((-Math.sin(rad(a))-Math.sin(decl)*Math.sin(la))/(Math.cos(decl)*Math.cos(la))))/15;
  const asrAlt=deg(Math.atan(1/(asrFactor+Math.tan(Math.abs(la-decl)))));
  const asr=noon+deg(Math.acos((Math.sin(rad(asrAlt))-Math.sin(decl)*Math.sin(la))/(Math.cos(decl)*Math.cos(la))))/15;
  const M2=PT_METHODS[method]||PT_METHODS.karachi,sunset=noon+T(.833);
  return{fajr:noon-T(M2.fajr),sunrise:noon-T(.833),zuhr:noon+1/60,asr,maghrib:sunset,isha:M2.ishaMin?sunset+M2.ishaMin/60:noon+T(M2.isha)}}
const fmtH=h=>{if(!isFinite(h))return"–";const mins=Math.round(fixH(h)*60)%1440,H=Math.floor(mins/60),Mi=mins%60;return`${(H%12)||12}:${String(Mi).padStart(2,"0")} ${H<12?"AM":"PM"}`};
const PS=()=>S.prayerSet||(S.prayerSet={method:"karachi",asr:2,city:"",lat:null,lng:null,notify:false});
function todayTimes(k){const p=PS();if(p.lat==null)return null;return prayerTimes(parse(k||TODAY()),p.lat,p.lng,p.method,p.asr)}
function nextPrayer(){const tt=todayTimes();if(!tt)return null;const now=new Date(),h=now.getHours()+now.getMinutes()/60+now.getSeconds()/3600;
  for(const[p]of PRAYERS)if(tt[p]>h)return{p,at:tt[p],inMin:Math.round((tt[p]-h)*60)};
  const tm=prayerTimes(add(new Date(),1),PS().lat,PS().lng,PS().method,PS().asr);return{p:"fajr",at:tm.fajr,inMin:Math.round((24-h+tm.fajr)*60)}}

function timesCard(){const t=T(),p=PS(),tt=todayTimes();
  if(!tt)return`<div class="card empty"><b>${t.ptTitle}</b><div class="muted">${t.ptSetup}</div><button class="btn primary" data-goto="profile">${t.ptChoose}</button></div>`;
  const nx=nextPrayer(),rows=[["fajr","Fajr"],["sunrise",t.sunrise],["zuhr","Zuhr"],["asr","Asr"],["maghrib","Maghrib"],["isha","Isha"]];
  return`<div class="card"><h2><span>${t.ptTitle}<span class="ar">اوقاتِ نماز</span></span><small>${esc(p.city||t.myLocation)}</small></h2>
    ${nx?`<div class="goal">${t.ptNext(PRAYERS.find(x=>x[0]===nx.p)[1],fmtH(nx.at),nx.inMin)}</div>`:""}
    <div class="ptgrid">${rows.map(([k,n])=>`<div class="pt${nx&&nx.p===k?" next":""}"><span>${n}</span><b>${fmtH(tt[k])}</b></div>`).join("")}</div></div>`}

function prayerSettingsCard(){const t=T(),p=PS(),cityOpts=PT_CITIES.map(([n])=>`<option value="${n}"${p.city===n?" selected":""}>${n}</option>`).join("");
  return`<div class="card"><h2>${t.ptTitle}</h2>
    <div class="field"><label for="ptCity">${t.ptCity}</label><select id="ptCity"><option value="">${p.lat!=null&&!p.city?t.myLocation:"—"}</option>${cityOpts}</select></div>
    <div class="row"><button class="btn small" id="ptGeo">📍 ${t.ptUseLoc}</button><span class="muted small" id="ptGeoMsg"></span></div>
    <div class="field"><label for="ptMethod">${t.ptMethod}</label><select id="ptMethod">${Object.keys(PT_METHODS).map(m=>`<option value="${m}"${p.method===m?" selected":""}>${t.ptMethods[m]}</option>`).join("")}</select></div>
    <div class="field"><label for="ptAsr">${t.ptAsr}</label><select id="ptAsr"><option value="2"${p.asr===2?" selected":""}>${t.hanafi}</option><option value="1"${p.asr===1?" selected":""}>${t.shafii}</option></select></div>
    <div class="muted small">${t.ptHelp}</div>
    <label class="toggle"><input type="checkbox" id="ptNotify" ${p.notify?"checked":""}> <span><b>${t.ptRemind}</b><br><span class="muted">${t.ptRemindHelp}</span></span></label>
    <div class="muted small" id="ptNotifyMsg"></div></div>`}

/* reminders: a notification at each prayer time while the app is open (phone/browser permission required) */
let ptTimer=null;
function schedulePrayerReminder(){clearTimeout(ptTimer);if(!me||!PS().notify||!("Notification"in window)||Notification.permission!=="granted")return;
  const nx=nextPrayer();if(!nx)return;const ms=Math.max(1000,nx.inMin*60000);if(ms>6*3600000){ptTimer=setTimeout(schedulePrayerReminder,6*3600000);return}
  ptTimer=setTimeout(()=>{const t=T(),name=PRAYERS.find(x=>x[0]===nx.p)[1];
    try{const n=new Notification("Deen Diary",{body:t.ptNotifBody(name),icon:"icon.svg",tag:"prayer-"+nx.p+"-"+TODAY()});n.onclick=()=>{window.focus();n.close()}}catch(e){}
    setTimeout(schedulePrayerReminder,60000)},ms)}

/* ---- azkar ---- */
const AZ_SETS=["morning","evening","afterSalah","sleep","waking"];
let azOpen=null;
function azkarCard(d,dis){const t=T(),done=d.azkar||{};
  return`<div class="card"><h2><span>${t.azkar}<span class="ar">اذکار</span></span><small>${t.azkarSub}</small></h2>
    <div class="azsets">${AZ_SETS.map(k=>`<button class="azset${done[k]?" done":""}" data-azopen="${k}"${dis}>${done[k]?"✓ ":""}${t.azSets[k]}</button>`).join("")}</div></div>`}
function azkarView(){const t=T(),k=azOpen,list=AZKAR[k],d=peek(sel)||{},prog=(d.azprog||{})[k]||{},doneN=list.filter((x,i)=>(prog[i]||0)>=x.c).length;
  return`<div class="card"><div class="row" style="justify-content:space-between"><button class="btn small" id="azBack">‹ ${t.back}</button><span class="muted">${doneN} / ${list.length}</span></div>
    <h2>${t.azSets[k]}</h2><div class="muted small">${t.azSource}</div>
    <div class="nextgoal"><i style="width:${doneN/list.length*100}%"></i></div></div>
  ${list.map((x,i)=>{const v=prog[i]||0,ok=v>=x.c;return`<div class="card azitem${ok?" done":""}"><div class="aztext" lang="ar" dir="rtl">${esc(x.t)}</div>
    <div class="row" style="justify-content:space-between"><span class="muted">${t.azTimes(x.c)}</span>
    <button class="btn ${ok?"done":"primary"}" data-aztap="${i}"${editable(sel)?"":" disabled"}>${ok?"✓":`${v} / ${x.c}`}</button></div></div>`}).join("")}`}
function azTap(i){const d=dayOf(sel),k=azOpen,list=AZKAR[k];d.azprog=d.azprog||{};const pr=d.azprog[k]=d.azprog[k]||{};
  pr[i]=Math.min(list[i].c,(pr[i]||0)+1);d.azkar=d.azkar||{};d.azkar[k]=list.every((x,j)=>(pr[j]||0)>=x.c)}
