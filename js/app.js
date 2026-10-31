const SURAH="Al-Fatihah,Al-Baqarah,Aal-e-Imran,An-Nisa,Al-Ma'idah,Al-An'am,Al-A'raf,Al-Anfal,At-Tawbah,Yunus,Hud,Yusuf,Ar-Ra'd,Ibrahim,Al-Hijr,An-Nahl,Al-Isra,Al-Kahf,Maryam,Ta-Ha,Al-Anbiya,Al-Hajj,Al-Mu'minun,An-Nur,Al-Furqan,Ash-Shu'ara,An-Naml,Al-Qasas,Al-Ankabut,Ar-Rum,Luqman,As-Sajdah,Al-Ahzab,Saba,Fatir,Ya-Sin,As-Saffat,Sad,Az-Zumar,Ghafir,Fussilat,Ash-Shura,Az-Zukhruf,Ad-Dukhan,Al-Jathiyah,Al-Ahqaf,Muhammad,Al-Fath,Al-Hujurat,Qaf,Adh-Dhariyat,At-Tur,An-Najm,Al-Qamar,Ar-Rahman,Al-Waqi'ah,Al-Hadid,Al-Mujadilah,Al-Hashr,Al-Mumtahanah,As-Saff,Al-Jumu'ah,Al-Munafiqun,At-Taghabun,At-Talaq,At-Tahrim,Al-Mulk,Al-Qalam,Al-Haqqah,Al-Ma'arij,Nuh,Al-Jinn,Al-Muzzammil,Al-Muddaththir,Al-Qiyamah,Al-Insan,Al-Mursalat,An-Naba,An-Nazi'at,Abasa,At-Takwir,Al-Infitar,Al-Mutaffifin,Al-Inshiqaq,Al-Buruj,At-Tariq,Al-A'la,Al-Ghashiyah,Al-Fajr,Al-Balad,Ash-Shams,Al-Layl,Ad-Duha,Ash-Sharh,At-Tin,Al-Alaq,Al-Qadr,Al-Bayyinah,Az-Zalzalah,Al-Adiyat,Al-Qari'ah,At-Takathur,Al-Asr,Al-Humazah,Al-Fil,Quraysh,Al-Ma'un,Al-Kawthar,Al-Kafirun,An-Nasr,Al-Masad,Al-Ikhlas,Al-Falaq,An-Nas".split(",");
const AYAT=[7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const PRAYERS=[["fajr","Fajr","فجر"],["zuhr","Zuhr","ظہر"],["asr","Asr","عصر"],["maghrib","Maghrib","مغرب"],["isha","Isha","عشاء"]];
const BACKFILL=7, STORE="deen-diary-v1";
const DEFAULT_GOALS={dhikr:{on:true}};
/* dhikr phrases (Arabic as commonly written) with default daily targets */
const DHIKR=[{id:"subhan",ar:"سُبْحَانَ اللّٰهِ",n:33},{id:"hamd",ar:"اَلْحَمْدُ لِلّٰهِ",n:33},{id:"akbar",ar:"اَللّٰهُ أَكْبَرُ",n:34},{id:"durood",ar:"اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ",n:100}];
const MILESTONES=[[3,"🌱"],[7,"🌻"],[14,"🌷"],[30,"🌳"],[40,"🌴"],[100,"🏵️"]];
const RARITY={c:{w:70,bonus:0},r:{w:23,bonus:25},l:{w:7,bonus:75}};
/* flower species: shape decides how petals are drawn */
const SPECIES=[
  {id:"tulip",r:"c",shape:"cup",c1:"#e8455f",c2:"#ffd166",n:{roman:"Gul-e-Laala",en:"Tulip",ur:"گلِ لالہ"}},
  {id:"daisy",r:"c",shape:"ell",np:10,c1:"#ffffff",c2:"#f2c14e",n:{roman:"Gul-e-Daudi",en:"Daisy",ur:"گلِ داؤدی"}},
  {id:"pinkb",r:"c",shape:"ell",np:6,c1:"#f49ac1",c2:"#fff3b0",n:{roman:"Gulabi Kali",en:"Pink Blossom",ur:"گلابی کلی"}},
  {id:"marigold",r:"c",shape:"layer",c1:"#ff9f1c",c2:"#ffbf47",n:{roman:"Genda",en:"Marigold",ur:"گیندا"}},
  {id:"lavender",r:"c",shape:"spike",c1:"#9b7fe0",c2:"#c3b1f5",n:{roman:"Lavender",en:"Lavender",ur:"لیونڈر"}},
  {id:"hibiscus",r:"c",shape:"heart",np:5,c1:"#e94b4b",c2:"#ffe08a",n:{roman:"Gurhal",en:"Hibiscus",ur:"گڑہل"}},
  {id:"rose",r:"r",shape:"layer",c1:"#c81d4e",c2:"#ff5c8a",n:{roman:"Gulab",en:"Rose",ur:"گلاب"}},
  {id:"jasmine",r:"r",shape:"pointy",np:6,c1:"#fffdf5",c2:"#ffe9a8",n:{roman:"Chambeli",en:"Jasmine",ur:"چنبیلی"}},
  {id:"lotus",r:"r",shape:"pointy",np:8,c1:"#f7a8c8",c2:"#ffd36e",n:{roman:"Kanwal",en:"Lotus",ur:"کنول"}},
  {id:"bluepoppy",r:"r",shape:"heart",np:4,c1:"#5aa7ef",c2:"#2b2b52",n:{roman:"Neela Poppy",en:"Blue Poppy",ur:"نیلا پوست"}},
  {id:"goldrose",r:"l",shape:"layer",c1:"#e2a91f",c2:"#ffe27a",n:{roman:"Sunehra Gulab",en:"Golden Rose",ur:"سنہرا گلاب"}},
  {id:"moonflower",r:"l",shape:"pointy",np:10,c1:"#dfe9ff",c2:"#9fb8ff",n:{roman:"Chand Phool",en:"Moonflower",ur:"چاند پھول"}},
  {id:"crystal",r:"l",shape:"pointy",np:8,c1:"#9ff0e6",c2:"#e8fffb",n:{roman:"Heera Kanwal",en:"Crystal Lotus",ur:"ہیرا کنول"}},
];
const SPMAP=Object.fromEntries(SPECIES.map(s=>[s.id,s]));
/* Quran text: Tanzil (quran-simple). Translations: ur Fateh Muhammad Jalandhry, roman Abul A'la Maududi, en Sahih International. */
const REMINDERS=[{"ref": "94:6", "ar": "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "ur": "(اور) بے شک مشکل کے ساتھ آسانی ہے", "roman": "Beshak tangi kay saath farakhi bhi hai", "en": "Indeed, with hardship [will be] ease"}, {"ref": "2:152", "ar": "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", "ur": "سو تم مجھے یاد کرو۔ میں تمہیں یاد کیا کروں گا۔ اور میرے احسان مانتے رہنا اور ناشکری نہ کرنا", "roman": "Lihaza tum mujhey yaad rakkho main tumhein yaad rakhunga aur mera shukar ada karo, kufran e niyamat na karo", "en": "So remember Me; I will remember you. And be grateful to Me and do not deny Me"}, {"ref": "13:28", "ar": "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "ur": "(یعنی) جو لوگ ایمان لاتے اور جن کے دل یادِ خدا سے آرام پاتے ہیں (ان کو) اور سن رکھو کہ خدا کی یاد سے دل آرام پاتے ہیں", "roman": "Aisey hi log hain woh jinhon ne (is Nabi ki dawat ko) maan liya hai aur unke dilon ko Allah ki yaad se itminaan naseeb hota hai, khabardar raho! Allah ki yaad hi woh cheez hai jissey dilon ko itminaan naseeb hua karta hai", "en": "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured"}, {"ref": "2:45", "ar": "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ", "ur": "اور (رنج وتکلیف میں) صبر اور نماز سے مدد لیا کرو اور بے شک نماز گراں ہے، مگر ان لوگوں پر (گراں نہیں) جو عجز کرنے والے ہیں", "roman": "Sabar aur namaz se madad lo, beshak namaz ek sakht mushkil kaam hai", "en": "And seek help through patience and prayer, and indeed, it is difficult except for the humbly submissive [to Allah]"}, {"ref": "2:153", "ar": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "ur": "اے ایمان والو صبر اور نماز سے مدد لیا کرو بےشک خدا صبر کرنے والوں کے ساتھ ہے", "roman": "Aey logon jo iman laye ho sabr aur namaz se madad lo, Allah sabr karne walon ke saath hai", "en": "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient"}, {"ref": "20:14", "ar": "إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي", "ur": "بےشک میں ہی خدا ہوں۔ میرے سوا کوئی معبود نہیں تو میری عبادت کرو اور میری یاد کے لئے نماز پڑھا کرو", "roman": "Main hi Allah hoon, mere siwa koi khuda nahin hai, pas tu meri bandagi kar aur meri yaad ke liye namaz qayam kar", "en": "Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance"}, {"ref": "29:69", "ar": "وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا ۚ وَإِنَّ اللَّهَ لَمَعَ الْمُحْسِنِينَ", "ur": "اور جن لوگوں نے ہمارے لئے کوشش کی ہم اُن کو ضرور اپنے رستے دکھا دیں گے۔ اور خدا تو نیکو کاروں کے ساتھ ہے", "roman": "Jo log hamari khatir mujahida(strive) karenge unhein hum apne raaste dikhayenge, aur yaqeenan Allah neikukaron(who do good) hi ke saath hai", "en": "And those who strive for Us - We will surely guide them to Our ways. And indeed, Allah is with the doers of good"}];
const TRANSLATOR={ur:"Fateh Muhammad Jalandhry",roman:"Maulana Maududi",en:"Sahih International"};

/* ---- language ---- */
const L=window.DD_I18N;
const TABS=["today","calendar","garden","tasks","journal","profile"];

const pad=n=>String(n).padStart(2,"0");
const key=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=k=>{const[y,m,d]=k.split("-").map(Number);return new Date(y,m-1,d)};
const add=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const uid=()=>Math.random().toString(36).slice(2,9);
let hijriFmt,hijriDay,hijriMonth;
try{hijriFmt=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura",{day:"numeric",month:"long",year:"numeric"});
  hijriDay=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura",{day:"numeric"});
  hijriMonth=new Intl.DateTimeFormat("en-u-ca-islamic-umalqura",{month:"long",year:"numeric"})}catch(e){}
const hijri=d=>hijriFmt?hijriFmt.format(d).replace(/\s?AH$/,"")+" AH":"";
const gFmt=new Intl.DateTimeFormat("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

function fresh(){return{lang:"roman",days:{},goals:JSON.parse(JSON.stringify(DEFAULT_GOALS)),readPos:{surah:1,ayah:1},tarjumaPos:{surah:1,ayah:1},tajweedPos:{surah:1,ruku:1},
  routine:[{id:uid(),name:"Subah ke azkar"},{id:uid(),name:"Shaam ke azkar"},{id:uid(),name:"Walk / exercise"}],
  todos:[],badges:{},flowers:{},seenFlowers:0,periodOn:true}}
/* ---- accounts: each phone keeps its own accounts; data stored per account ---- */
const ACC="deen-diary-accounts",SES="deen-diary-session";
const ls={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
let accounts=[];try{accounts=JSON.parse(ls.get(ACC)||"[]")}catch(e){}
let me=null,S=fresh(),authMode=accounts.length?"in":"up";
async function hashPin(name,pin){const txt="dd:"+name.trim().toLowerCase()+":"+pin;
  try{const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(txt));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
  catch(e){let h=7;for(const c of txt)h=(h*31+c.charCodeAt(0))|0;return"s"+h}}
function loadAccount(id){me=accounts.find(a=>a.id===id);let d=null;try{d=JSON.parse(ls.get(STORE+":"+id)||"null")}catch(e){}
  const lang=S.lang;S=Object.assign(fresh(),d||{});if(!d)S.lang=lang;if(d&&Object.keys(S.days).length&&S.onboarded===undefined)S.onboarded=S.toured=true;ls.set(SES,id)}
function save(){if(!me)return;if(sb){S._updated=Date.now();Cloud.queue(S)}else ls.set(STORE+":"+me.id,JSON.stringify(S))}
/* first email sign-in on a phone that still has PIN-account data: carry that data over once */
function legacyData(){if(ls.get("deen-diary-migrated"))return null;
  const sid=ls.get(SES),id=sid&&accounts.some(a=>a.id===sid)?sid:accounts.length===1?accounts[0].id:null;
  const raw=id?ls.get(STORE+":"+id):ls.get(STORE);if(!raw)return null;ls.set("deen-diary-migrated","1");try{return JSON.parse(raw)}catch(e){return null}}
async function enterCloud(user){const m=user.user_metadata||{};Cloud.user=user;
  me={id:user.id,email:user.email,name:m.full_name||user.email.split("@")[0],gender:m.gender||""};
  document.getElementById("view").innerHTML=`<div class="card"><div class="muted" style="text-align:center">…</div></div>`;
  let d=await Cloud.load();if(!d)d=legacyData();
  const lang=S.lang;S=Object.assign(fresh(),d||{});if(!d){S.lang=lang;S.periodOn=me.gender==="female"}
  loadNotify().then(()=>{if(tab==="profile"||tab==="notes")render()});pingSeen();registerPush();checkAdmin().then(()=>{if(tab==="profile")render()});loadDbQuestions().then(()=>{if(tab==="quiz"||tab==="today")render()});if(!S.gender)S.gender=me.gender;if(d&&Object.keys(S.days).length&&S.onboarded===undefined){S.onboarded=S.toured=true}tab="today";sel=TODAY();save();render()}
{const sid=ls.get(SES);if(sid&&accounts.some(a=>a.id===sid))loadAccount(sid)}
const LANGS=["en","ur","roman"];
const T=()=>L[S.lang]||L.en;
const G=()=>{const g=S.goals||(S.goals={});for(const k in DEFAULT_GOALS)if(!g[k])g[k]=JSON.parse(JSON.stringify(DEFAULT_GOALS[k]));return migrateGoals(g)};

const TODAY=()=>key(new Date());
let sel=TODAY(), tab="today", calMonth=new Date(), reportRange=7, justBloomed=null;
const dayOf=k=>S.days[k]||(S.days[k]={prayers:{},period:false,tarjuma:null,tajweed:null,tasks:{},note:""});
const peek=k=>S.days[k];
const editable=k=>{const diff=Math.round((parse(TODAY())-parse(k))/864e5);return diff>=0&&diff<=BACKFILL};

/* ---- scoring ---- */
const prayed=d=>d?PRAYERS.filter(([p])=>["ontime","qaza"].includes(d.prayers[p])).length:0;
const namazOK=d=>prayed(d)===5;
const tarOK=d=>qDone(d,"tar");
const tajOK=d=>qDone(d,"taj");
const fullOK=d=>{const g=G();return namazOK(d)&&ACTS.every(([a])=>!g[a].on||qDone(d,a))};
function status(k){const d=peek(k);if(d&&d.period)return"period";if(fullOK(d))return"complete";
  if(d&&(prayed(d)||d.tarjuma||d.tajweed))return"partial";return k<TODAY()?"missed":"none"}
function points(d,k){if(!d)return 0;let p=0;
  PRAYERS.forEach(([x])=>{if(d.prayers[x]==="ontime")p+=10;else if(d.prayers[x]==="qaza")p+=5});
  p+=Object.values(d.azkar||{}).filter(Boolean).length*10+(d.ramadan&&d.ramadan.fast==="yes"?20:0)+(d.ramadan&&d.ramadan.taraweeh?10:0)+ACTS.filter(([a])=>qDone(d,a)).length*20+Object.keys(d.rev||{}).length*10+learnGoalsMet(d,k)*10;p+=DHIKR.filter(x=>((d.dhikr||{})[x.id]||0)>=x.n).length*5;p+=Object.values(d.tasks||{}).filter(Boolean).length*5;if(fullOK(d))p+=15;return p}
function earliest(){const ks=Object.keys(S.days).sort();return ks[0]||TODAY()}
/* Streak rules: a day marked "missed" or left incomplete breaks the streak; a day with nothing marked gets
   GRACE days to be filled in before it counts as broken. Period days pause the streak. */
const GRACE=2;
const explicitMiss=d=>!!d&&PRAYERS.some(([p])=>d.prayers&&d.prayers[p]==="missed");
const dayAge=k=>Math.round((parse(TODAY())-parse(k))/864e5);
function streakInfo(pred){const first=earliest();let k=TODAY(),n=0,start=null;const pending=[];
  while(k>=first){const d=peek(k),age=dayAge(k);
    if(d&&d.period){}
    else if(pred(d)){n++;start=k}
    else if(age<=GRACE&&!explicitMiss(d)){if(age>0)pending.push(k)}  /* today, or an unfinished day still inside the grace period */
    else break;
    k=key(add(parse(k),-1))}
  return{n,start,pending}}
function streak(pred){return streakInfo(pred).n}
const completeDays=()=>Object.keys(S.days).filter(k=>!S.days[k].period&&fullOK(S.days[k])).sort();
const flowerBonus=()=>Object.entries(S.flowers).reduce((a,[k,f])=>a+(S.days[k]&&fullOK(S.days[k])&&SPMAP[f.sp]?RARITY[SPMAP[f.sp].r].bonus:0),0);
const totalPoints=()=>Object.entries(S.days).reduce((a,[k,d])=>a+points(d,k),0)+S.todos.filter(t=>t.done).length*5+flowerBonus();

/* ---- quran positions ---- */
/* ---- rewards ---- */
function checkBadges(){const lines=[["full",T().sFull,streak(fullOK)],["namaz",T().sNamaz,streak(namazOK)]];const got=[];
  lines.forEach(([id,label,n])=>MILESTONES.forEach(([m,icon])=>{const b=id+m;if(n>=m&&!S.badges[b]){S.badges[b]=TODAY();got.push({icon,title:`${label}: ${T().ms(m)}`})}}));
  if(got.length){const g=got[got.length-1];popup(`<div class="big">${g.icon}</div><h2>${T().nice}</h2><p>${esc(T().badgeMsg(g.title))}</p><button class="btn primary" data-close>${T().close}</button>`);confetti()}}
function popup(html,extra=""){const r=document.getElementById("popRoot");r.innerHTML=`<div class="pop" role="dialog"><div class="card ${extra}">${html}</div></div>`}
document.getElementById("popRoot").addEventListener("click",e=>{const g=e.target.closest("[data-goto]");if(g){tab=g.dataset.goto;azOpen=null}if(e.target.closest("[data-close]")||e.target.classList.contains("pop")){e.currentTarget.innerHTML="";if(justBloomed||g)render()}});
function confetti(cols=["#e2b553","#17604a","#ff8fb1","#6ec3f0","#ffd166"],n=40){for(let i=0;i<n;i++){const c=document.createElement("i");c.className="confetti";
  c.style.cssText=`left:${Math.random()*100}vw;background:${cols[i%cols.length]};animation-delay:${Math.random()*.8}s;animation-duration:${2+Math.random()*1.5}s`;document.body.append(c);setTimeout(()=>c.remove(),4500)}}
let toastT;function toast(msg){let t=document.querySelector(".toast");if(!t){t=document.createElement("div");t.className="toast";document.body.append(t)}
  t.textContent=msg;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
function commit(){save();checkBadges();gardenFeedback();save();render();if(isNative())queueLocalSchedule()}
function gardenFeedback(){const t=T(),n=streak(fullOK),prev=S.streakSeen??n;S.streakSeen=n;
  if(n===prev)return;
  if(n<prev){if(prev>0)popup(`<div class="big">🍂</div><h2>${t.hs.brokeTitle}</h2><p>${t.hs.brokeText(prev)}</p><button class="btn primary" data-close>${t.close}</button>`);return}
  const st=lastPic(n,false),before=lastPic(prev,false);
  if(st&&(!before||st[0]>before[0])){popup(`<div class="reveal pop-garden"><img class="pimg" src="garden/${st[2]}.jpg" alt="" onerror="if(!this.dataset.png){this.dataset.png=1;this.src=this.src.replace(/\\.jpg$/,'.png')}else this.remove()"></div>
    <h2>✨ ${t.hs.st[st[1]]}</h2><p>${t.hs.desc[st[1]]}</p><button class="btn primary" data-close data-goto="garden">${t.hs.seeGarden}</button>`,"reveal-card");confetti(["#e2b553","#fff3b0","#f6c6d8","#ffffff"],70);return}
  toast(t.hs.flowerToday(n))}

/* ---- flower drawing (origin = flower head centre) ---- */
function headSVG(sp,s=1){const{shape,c1,c2,np=6}=sp,R=7*s;let p="";
  if(shape==="ell")for(let i=0;i<np;i++)p+=`<ellipse rx="${R*.42}" ry="${R}" cy="${-R}" fill="${c1}" stroke="rgba(0,0,0,.08)" stroke-width=".4" transform="rotate(${i*360/np})"/>`;
  if(shape==="pointy"){for(let i=0;i<np;i++)p+=`<path d="M0 0 C${R*.6} ${-R*.5} ${R*.35} ${-R*1.5} 0 ${-R*1.9} C${-R*.35} ${-R*1.5} ${-R*.6} ${-R*.5} 0 0z" fill="${c1}" stroke="${c2}" stroke-width=".6" transform="rotate(${i*360/np})"/>`;
    p+=`<circle r="${R*.45}" fill="${c2}"/>`;return p}
  if(shape==="heart")for(let i=0;i<np;i++)p+=`<path d="M0 0 C${R*1.3} ${-R*.4} ${R*1.1} ${-R*1.9} 0 ${-R*1.4} C${-R*1.1} ${-R*1.9} ${-R*1.3} ${-R*.4} 0 0z" fill="${c1}" transform="rotate(${i*360/np})"/>`;
  if(shape==="cup")return`<path d="M${-R} ${-R*.2} C${-R} ${R*1.1} ${R} ${R*1.1} ${R} ${-R*.2} L${R*.55} ${-R*.9} L${R*.2} ${-R*.1} L0 ${-R*1.1} L${-R*.2} ${-R*.1} L${-R*.55} ${-R*.9}z" fill="${c1}"/><path d="M${-R*.5} ${R*.2} Q0 ${R*.8} ${R*.5} ${R*.2}" stroke="${c2}" stroke-width="1" fill="none" opacity=".6"/>`;
  if(shape==="layer")return[1,.75,.5,.28].map((k,i)=>`<circle r="${R*1.15*k}" fill="${i%2?c2:c1}" stroke="rgba(0,0,0,.12)" stroke-width=".5"/>`).join("")+`<path d="M${-R*.3} 0 a${R*.3} ${R*.3} 0 1 1 ${R*.3} ${R*.3}" stroke="rgba(0,0,0,.25)" fill="none" stroke-width=".7"/>`;
  if(shape==="spike"){for(let i=0;i<6;i++)p+=`<ellipse cx="${i%2?2.2*s:-2.2*s}" cy="${-i*3.2*s+6*s}" rx="${2.6*s}" ry="${3.2*s}" fill="${i%3?c1:c2}"/>`;return p}
  return p+`<circle r="${R*.48}" fill="${c2}"/>`}
function sparkles(R){return[[-1.4,-1.2],[1.5,-.6],[.4,1.5]].map(([a,b],i)=>`<path class="sparkle" style="animation-delay:${i*.5}s" transform="translate(${a*R},${b*R})" d="M0 -3 L.8 -.8 3 0 .8 .8 0 3 -.8 .8 -3 0 -.8 -.8z" fill="#fff6c4"/>`).join("")}
function plantSVG(sp,h,s,flip){const leaf=flip?-1:1;
  return`<path class="stem" pathLength="1" d="M0 0 Q${4*leaf} ${-h/2} 0 ${-h}" stroke="#3c8d4a" stroke-width="${1.6+s*.6}" fill="none" stroke-linecap="round"/>
  <path class="leaf" d="M0 ${-h*.38} q${10*leaf} -8 ${16*leaf} 0 q${-8*leaf} 6 ${-16*leaf} 0z" fill="#4caf5e"/>
  <g transform="translate(0,${-h})"><g class="head">${sp.r==="l"?`<circle class="legend-glow" r="${14*s}" fill="${sp.c2}" opacity=".45"/>`:""}<g class="${sp.shape==="ell"||sp.shape==="pointy"?"spin":""}" style="animation-duration:${30+h}s">${headSVG(sp,s)}</g>${sp.r==="l"?sparkles(9*s):""}</g></g>`}
function miniSVG(sp){return`<svg viewBox="-22 -48 44 52" aria-hidden="true"><g transform="translate(0,2)">${plantSVG(sp,24,1.25,false)}</g></svg>`}
function budSVG(){return`<path d="M0 0 Q2 -10 0 -20" stroke="#3c8d4a" stroke-width="2" fill="none"/><path d="M0 -10 q-9 -6 -13 1 q7 2 13 -1z" fill="#5cbf6c"/>
  <g class="bob"><circle class="qglow" cy="-27" r="10" fill="#ffe9a8" opacity=".55"/><path d="M0 -18 C-8 -20 -8 -32 0 -38 C8 -32 8 -20 0 -18z" fill="#69b86f" stroke="#3c8d4a" stroke-width="1"/>
  <path d="M0 -19 C-3 -24 -3 -31 0 -37" stroke="#3c8d4a" stroke-width=".8" fill="none"/><text class="q" x="0" y="-25" text-anchor="middle" dy="2">?</text></g>`}

/* ---- views ---- */
const surahOptions=cur=>SURAH.map((n,i)=>`<option value="${i+1}"${i+1===cur?" selected":""}>${i+1}. ${n} (${AYAT[i]})</option>`).join("");
function streakRow(){const t=T();return`<div class="streaks">
  <div class="streak"><b>${streak(fullOK)}</b><span>${t.sFull}</span></div><div class="streak"><b>${streak(namazOK)}</b><span>${t.sNamaz}</span></div>
  <div class="streak"><b>${streak(tarOK)}</b><span>${t.sTar}</span></div><div class="streak"><b>${streak(tajOK)}</b><span>${t.sTaj}</span></div></div>`}
function reminderCard(){const t=T(),i=Math.floor(parse(TODAY())/864e5)%REMINDERS.length,r=REMINDERS[(i+REMINDERS.length)%REMINDERS.length];
  return`<div class="card reminder"><h2>${t.reminder}<small>${hijri(new Date())}</small></h2><div class="ayah" lang="ar" dir="rtl">${r.ar}</div><div class="q">“${r[S.lang]||r.en}”</div><div class="ref">QURAN ${r.ref} · ${TRANSLATOR[S.lang]||TRANSLATOR.en}</div></div>`}

function dhikrCard(d,dis){const t=T(),c=d.dhikr||{};
  return`<div class="card"><h2><span>${t.dhikr}<span class="ar">ذکر</span></span><small>${t.dhikrSub}</small></h2><div class="dhikr">
    ${DHIKR.map(x=>{const v=c[x.id]||0,done=v>=x.n;return`<div class="dz${done?" done":""}"><button class="dzbtn" data-dz="${x.id}"${dis} aria-label="${x.ar} +1">
      <span class="ar" lang="ar">${x.ar}</span><b>${v}<small>/${x.n}</small></b><i style="width:${Math.min(100,v/x.n*100)}%"></i></button>
      <button class="x" data-dzminus="${x.id}"${dis} aria-label="−1">−</button></div>`}).join("")}</div></div>`}
function graceCard(){const t=T(),si=streakInfo(fullOK);if(!si.pending.length)return"";const k=si.pending[si.pending.length-1];
  const deadline=add(parse(k),GRACE+1),hrs=Math.max(1,Math.round((deadline-new Date())/36e5));
  return`<div class="card grace"><b>⏳ ${t.hs.graceTitle}</b><div class="muted">${t.hs.graceText(parse(k).toLocaleDateString(S.lang==="ur"?"ur-PK":"en-GB",{weekday:"long",day:"numeric",month:"short"}),hrs)}</div>
    <button class="btn small primary" data-day="${k}" data-goto="today">${t.hs.fillNow}</button></div>`}
function vToday(){const t=T(),d=peek(sel)||{prayers:{},period:false,tasks:{},note:""},can=editable(sel),dd=parse(sel),dis=can?"":" disabled";
  let chips="";for(let i=BACKFILL;i>=0;i--){const k=key(add(new Date(),-i)),x=parse(k);
    chips+=`<button class="day" data-day="${k}" aria-pressed="${k===sel}">${i===0?t.today:i===1?t.yday:x.toLocaleDateString(S.lang==="ur"?"ur-PK":"en-GB",{weekday:"short"})}<b>${x.getDate()}</b><span class="dot ${status(k)}"></span></button>`}
  const g=G();
  return`${sel===TODAY()?graceCard()+reminderCard()+timesCard()+dailyCard():""}${streakRow()}
  <div class="card"><div class="days">${chips}</div>
    <div class="datehead"><b>${gFmt.format(dd)}</b><div class="hijri">${hijri(dd)}</div></div>
    <div class="muted">${can?t.backfill(BACKFILL):t.locked(BACKFILL)}</div></div>
  ${S.periodOn?`<div class="card ${d.period?"period-on":""}"><label class="toggle"><input type="checkbox" id="period" ${d.period?"checked":""}${dis}> <span><b>${t.period}</b><br><span class="muted">${t.periodSub}</span></span></label></div>`:""}
  ${ramadanCard(sel,d,dis)}
  ${d.period?`<div class="card excused">${t.excused}</div>`:`
  <div class="card"><h2><span>${t.namaz}<span class="ar">نماز</span></span><small>${prayed(d)}/5</small></h2>
    ${PRAYERS.map(([p,n,ar])=>`<div class="prayer"><span><i>${ar}</i>${n}</span><div class="seg">${["ontime","qaza","missed"].map(v=>`<button class="${v}${d.prayers[p]===v?" on":""}" data-pray="${p}" data-v="${v}"${dis}>${t[v]}</button>`).join("")}</div></div>`).join("")}</div>
  ${ACTS.filter(([a])=>g[a].on).map(([a,ar])=>qCard(a,ar,d,dis)).join("")}
  ${ACTS.some(([a])=>g[a].on)?"":`<div class="card empty"><b>${t.noQuranGoal}</b><button class="btn primary" data-goto="profile">${t.setGoals}</button></div>`}
  ${revCard(sel,dis)}
  ${specialCard(sel,d,dis)}`}
  ${learnCard(d,dis)}
  ${g.dhikr.on?azkarCard(d,dis)+dhikrCard(d,dis):""}
  <div class="card"><h2>${t.routine}<small><a href="#tasks" data-goto="tasks" style="color:var(--green)">${t.edit}</a></small></h2>
    ${S.routine.length?S.routine.map(r=>`<div class="check${d.tasks&&d.tasks[r.id]?" done":""}"><input type="checkbox" id="r_${r.id}" data-rt="${r.id}" ${d.tasks&&d.tasks[r.id]?"checked":""}${dis}><label for="r_${r.id}">${esc(r.name)}</label></div>`).join(""):`<div class="muted">${t.noRoutine}</div>`}</div>
  <div class="card"><h2>${t.note}</h2><textarea id="note" style="min-height:70px;font-family:var(--body);font-size:.9rem" placeholder="${t.notePh}"${dis}>${esc(d.note||"")}</textarea>
    <div class="muted">${t.dayPts}: <b>${points(peek(sel),sel)}</b></div></div>`}

function vCalendar(){const t=T(),y=calMonth.getFullYear(),m=calMonth.getMonth(),first=new Date(y,m,1),n=new Date(y,m+1,0).getDate();
  let cells=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(w=>`<div class="wd">${w}</div>`).join("");
  for(let i=0;i<first.getDay();i++)cells+=`<div class="cell blank"></div>`;
  for(let i=1;i<=n;i++){const x=new Date(y,m,i),k=key(x),st=status(k),can=editable(k)||!!peek(k);
    cells+=`<button class="cell ${st}${k===TODAY()?" today":""}" data-cal="${k}"${can?"":" disabled"} aria-label="${k}"><span>${i}</span><small>${hijriDay?hijriDay.format(x).replace(/\D/g,""):""}</small></button>`}
  return`<div class="card"><div class="calhead"><button class="btn small" id="calPrev" aria-label="Previous month">‹</button>
    <div style="text-align:center"><b>${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</b><div class="arabic" style="color:var(--gold)">${hijriMonth?hijriMonth.format(new Date(y,m,15)):""}</div></div>
    <button class="btn small" id="calNext" aria-label="Next month">›</button></div>
    <div class="grid7">${cells}</div>
    <div class="legend"><span><i style="background:var(--green)"></i>${t.complete}</span><span><i style="background:var(--gold)"></i>${t.partial}</span><span><i style="background:var(--rose)"></i>${t.periodL}</span><span><i style="background:var(--bad-soft);border:1px solid var(--bad)"></i>${t.missedL}</span></div>
    <div class="muted">${t.calHint}</div></div>${S.periodOn?vPeriods():""}`}
function vPeriods(){const t=T(),ks=Object.keys(S.days).filter(k=>S.days[k].period).sort(),runs=[];
  ks.forEach(k=>{const last=runs[runs.length-1];if(last&&key(add(parse(last.end),1))===k)last.end=k;else runs.push({start:k,end:k})});
  const rows=runs.slice().reverse().map((r,i,arr)=>{const len=Math.round((parse(r.end)-parse(r.start))/864e5)+1,prev=arr[i+1];
    return`<tr><td>${r.start}</td><td>${r.end}</td><td>${len} ${t.days}</td><td>${prev?Math.round((parse(r.start)-parse(prev.start))/864e5)+" "+t.days:"–"}</td></tr>`}).join("");
  return`<div class="card"><h2>${t.plog}</h2>${runs.length?`<div class="tablewrap"><table><tr><th>${t.start}</th><th>${t.end}</th><th>${t.len}</th><th>${t.cycle}</th></tr>${rows}</table></div>`:`<div class="muted">${t.noPeriod}</div>`}</div>`}

function vGarden(){const t=T(),si=streakInfo(fullOK),days=si.n?completeDays().filter(k=>k>=si.start):[],N=days.length,hr=new Date().getHours();
  if((S.picSeen||0)>N){S.picSeen=(lastPic(N,false)||[0])[0];save()}
  const night=hr>=19||hr<5,dusk=hr>=17&&hr<19,dawn=hr>=5&&hr<7;
  const sky=night?["#081530","#1f3260"]:dusk?["#f08a5d","#ffd6a5"]:dawn?["#f7b2c4","#fde6c8"]:["#7cc8f2","#e8f7ff"];
  const todayFull=fullOK(peek(TODAY()));
  const items=days.map((k,i)=>{const n=i+1,row=i%3;return{k,n,x:16+((i*53)%328)+(row*7)%11,y:206+row*10+(i%2)*3}}).sort((a,b)=>a.y-b.y);
  const scale=N>60?.75:N>30?.95:1.2;
  const plants=items.map(({k,n,x,y})=>{const isNew=k===justBloomed;
    if(n%40===0||n%30===0){const palm=n%40===0;return`<g transform="translate(${x},${y})" class="fl${isNew?" new":""}" data-fl="${k}" style="--d:0s"><g class="sway">${palm?
      `<path class="stem" pathLength="1" d="M0 0 Q5 -32 0 -66" stroke="#8a5a2b" stroke-width="6" fill="none" stroke-linecap="round"/><g class="head" transform="translate(0,-66)">${[0,55,110,170,230,290].map(a=>`<path d="M0 0 Q15 -11 32 4 Q15 -2 0 0" fill="#2f8f4e" transform="rotate(${a})"/>`).join("")}<circle r="4" cx="-4" cy="5" fill="#b5651d"/><circle r="4" cx="4" cy="6" fill="#a0521a"/></g>`
      :`<path class="stem" pathLength="1" d="M0 0 L0 -42" stroke="#7a4f2a" stroke-width="7" fill="none" stroke-linecap="round"/><g class="head" transform="translate(0,-54)"><circle r="23" fill="#2f9a5a"/><circle r="15" cx="-13" cy="6" fill="#3fb06a"/><circle r="13" cx="12" cy="-7" fill="#2a874f"/><circle r="3" cx="-6" cy="-6" fill="#e94b4b"/><circle r="3" cx="8" cy="6" fill="#e94b4b"/><circle r="3" cx="-11" cy="10" fill="#e94b4b"/></g>`}</g></g>`}
    if(n%7===0){return`<g transform="translate(${x},${y})" class="fl${isNew?" new":""}" data-fl="${k}" style="--d:0s"><g class="sway">${plantSVG({shape:"ell",np:14,c1:"#ffc93c",c2:"#6b3e1d",r:"c"},48,1.35,n%2)}</g></g>`}
    const f=S.flowers[k];
    if(!f)return`<g transform="translate(${x},${y})" class="bud" data-bud="${k}" tabindex="0" role="button" aria-label="Bud">${budSVG()}</g>`;
    const sp=SPMAP[f.sp]||SPECIES[0];
    return`<g transform="translate(${x},${y})" class="fl${isNew?" new":""}" data-fl="${k}" style="--d:0s"><g class="sway" style="animation-duration:${3+(n%5)*.4}s;animation-delay:-${(n%7)*.5}s">${plantSVG(sp,24+(n%4)*5,sp.r==="l"?1.2:1,n%2)}</g></g>`}).join("");
  const stars=night?[...Array(28)].map((_,i)=>`<circle class="twinkle" cx="${(i*67)%360}" cy="${(i*29)%120+6}" r="${i%3?.9:1.5}" fill="#fff" style="animation-delay:${(i%6)*.4}s"/>`).join(""):"";
  const orb=night?`<circle class="sunglow" cx="298" cy="46" r="26" fill="#fff6d6" opacity=".18"/><circle cx="298" cy="46" r="16" fill="#fff6d6"/><circle cx="305" cy="40" r="14" fill="${sky[0]}"/>`
    :`<circle class="sunglow" cx="298" cy="48" r="32" fill="#fff3b0" opacity=".5"/><circle cx="298" cy="48" r="19" fill="${dusk?"#ff8c42":"#ffd84a"}"/>`;
  const clouds=night?"":[0,1,2].map(i=>`<g class="cloud" style="animation-duration:${42+i*18}s;animation-delay:-${i*16}s" opacity=".92"><g transform="translate(0,${26+i*22}) scale(${1-i*.2})"><ellipse cx="30" cy="10" rx="26" ry="10" fill="#fff"/><ellipse cx="18" cy="4" rx="14" ry="10" fill="#fff"/><ellipse cx="40" cy="2" rx="16" ry="12" fill="#fff"/></g></g>`).join("");
  const rainbow=todayFull&&!night?`<g class="rainbow" opacity=".45" fill="none" stroke-width="5">${["#ff6b6b","#ffb347","#ffe66d","#7bd389","#6ec3f0","#a78bfa"].map((c,i)=>`<path d="M${30+i*5} 190 A${150-i*5} ${120-i*5} 0 0 1 ${330-i*5} 190" stroke="${c}"/>`).join("")}</g>`:"";
  const fireflies=night?[...Array(10)].map((_,i)=>`<circle class="firefly" cx="${20+i*34}" cy="${150+(i*17)%50}" r="1.6" fill="#fff59d" style="animation-delay:${i*.45}s;animation-duration:${4+i%3}s"/>`).join(""):"";
  const butterflies=N&&!night?[0,1,2].slice(0,Math.min(3,1+Math.floor(N/10))).map(i=>`<g class="fly" style="animation-delay:-${i*5}s;animation-duration:${12+i*4}s"><g transform="translate(${30+i*100},${120+i*16})">
    <ellipse class="wing" cx="-4" cy="0" rx="5" ry="4" fill="${["#ffcf5c","#ff8fb1","#8ec5ff"][i]}"/><ellipse class="wing r" cx="4" cy="0" rx="5" ry="4" fill="${["#ffcf5c","#ff8fb1","#8ec5ff"][i]}"/><rect x="-.7" y="-4" width="1.4" height="8" rx=".7" fill="#3a2a1a"/></g></g>`).join(""):"";
  const falling=justBloomed?[...Array(10)].map((_,i)=>`<ellipse class="petal-fall" cx="${20+i*36}" cy="0" rx="3" ry="5" fill="${["#ff8fb1","#ffd166","#fff"][i%3]}" style="animation-delay:${i*.5}s;animation-iteration-count:2"/>`).join(""):"";
  const fence=[...Array(19)].map((_,i)=>`<rect x="${i*20}" y="166" width="3" height="18" rx="1" fill="${night?"#3b4a3f":"#e9d8b4"}"/>`).join("")+`<rect x="0" y="171" width="360" height="2.5" fill="${night?"#3b4a3f":"#e9d8b4"}"/>`;
  const sprout=N?"":`<g transform="translate(180,212)"><g class="sway"><path d="M0 0 Q-2 -10 0 -18" stroke="#3c8d4a" stroke-width="2.5" fill="none"/><path d="M0 -14 q-10 -6 -14 2 q8 2 14 -2z M0 -16 q10 -8 14 0 q-8 3 -14 0z" fill="#5cbf6c"/></g><ellipse cx="0" cy="2" rx="10" ry="3" fill="#6b4a2a"/></g>`;
  const svg=`<svg viewBox="0 0 360 250" role="img" aria-label="Garden">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient>
    <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night?"#1f4a3a":"#8fd18a"}"/><stop offset="1" stop-color="${night?"#143328":"#57a957"}"/></linearGradient>
    <linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${night?"#2d4a2c":"#66b553"}"/><stop offset="1" stop-color="${night?"#18291a":"#3a7a34"}"/></linearGradient></defs>
    <rect width="360" height="250" fill="url(#sky)"/>${stars}${orb}${rainbow}${clouds}
    <path d="M0 150 Q50 118 110 140 T230 128 T360 140 V250 H0z" fill="${night?"#173a2e":"#a8dca0"}" opacity=".6"/>
    <path d="M0 172 Q60 140 130 165 T260 155 T360 165 V250 H0z" fill="url(#hill)" opacity=".85"/>${fence}${backLayer(N,night)}
    <path d="M0 192 Q90 174 180 188 T360 186 V250 H0z" fill="url(#soil)"/>
    <path d="M150 250 Q170 220 182 196 Q186 190 192 196 Q200 222 228 250z" fill="${night?"#3a3326":"#d9c08f"}" opacity=".55"/>
    ${frontLayer(N,night)}<g transform="translate(180,220) scale(${scale}) translate(-180,-220)">${plants}</g>${sprout}${fireflies}${butterflies}${falling}</svg>`;
  justBloomed=null;
  const buds=days.filter((k,i)=>(i+1)%7&&(i+1)%30&&(i+1)%40&&!S.flowers[k]);
  const cur=streak(fullOK),next=MILESTONES.find(([m])=>m>cur);
  const owned={};Object.entries(S.flowers).forEach(([k,f])=>{if(S.days[k]&&fullOK(S.days[k]))owned[f.sp]=(owned[f.sp]||0)+1});
  const album=SPECIES.map(sp=>{const c=owned[sp.id];return`<div class="sp ${sp.r}${c?"":" locked"}">${miniSVG(sp)}<b>${c?(sp.n[S.lang]||sp.n.en):"???"}</b><span class="tag ${sp.r}">${t.rar[sp.r]}</span>${c>1?`<div class="muted">×${c}</div>`:""}</div>`}).join("");
  const b=[["full",t.sFull],["namaz",t.sNamaz]].map(([id,l])=>MILESTONES.map(([m,icon])=>`<div class="badge${S.badges[id+m]?" got":""}"><b>${icon}</b>${l}<br>${t.ms(m)}</div>`).join("")).join("");
  return`<div class="card"><h2><span>${t.garden}<span class="ar">باغ</span></span><small>${N} ${t.flowers}</small></h2>
    ${has(N,"interior")?`<div class="seg viewtog"><button class="${gView==="garden"?"on ontime":""}" data-gview="garden">🌿 ${t.hs.gardenView}</button><button class="${gView==="house"?"on ontime":""}" data-gview="house">🏡 ${t.hs.houseView}</button></div>`:""}
    <div class="scene">${gView==="house"&&has(N,"interior")?picScene(N,true,interiorSVG(N)):picScene(N,false,svg)}</div>
    ${buds.length?`<div class="budbar"><span>${t.budsReady(buds.length)}</span><button class="btn primary small" data-bud="${buds[0]}">${t.openBud}</button></div>`:""}
    ${N?"":`<div class="goal">${t.emptyG}</div>`}
    <div class="garden-stats"><div><b>${N}</b><span>${t.statF}</span></div><div><b>${cur}</b><span>${t.statS}</span></div><div><span class="gift">🎁</span><span style="display:block">${next?t.gift(next[0]-cur):t.giftAll}</span></div></div>
    ${next?`<div class="nextgoal" aria-label="${cur}/${next[0]}"><i style="width:${Math.min(100,cur/next[0]*100)}%"></i></div>`:""}
    <div class="muted">${t.keep}</div></div>
  ${stagesCard(N)}${(markPicSeen(N),"")}
  <div class="card"><h2>${t.album}<small>${Object.keys(owned).length&&t.found(Object.keys(owned).length,SPECIES.length)||t.found(0,SPECIES.length)}</small></h2><div class="album">${album}</div></div>
  ${streakRow()}
  <div class="card"><h2>${t.badges}</h2><div class="badges">${b}</div></div>`}

function openBud(k){const t=T();if(S.flowers[k])return;
  const roll=Math.random()*100,r=roll<RARITY.l.w?"l":roll<RARITY.l.w+RARITY.r.w?"r":"c";
  const pool=SPECIES.filter(s=>s.r===r),sp=pool[Math.floor(Math.random()*pool.length)];
  popup(`<div class="reveal"><svg viewBox="-30 -50 60 56" class="shake" aria-hidden="true"><g transform="translate(0,4)">${budSVG()}</g></svg></div><h2>${t.opening}</h2>`);
  setTimeout(()=>{S.flowers[k]={sp:sp.id,at:TODAY()};justBloomed=k;save();
    const bonus=RARITY[r].bonus;
    popup(`<div class="reveal">${r!=="c"?`<div class="raybg"></div>`:""}<svg viewBox="-30 -58 60 64" aria-hidden="true"><g transform="translate(0,4)" class="fl new" style="--d:0s">${plantSVG(sp,30,1.5,false)}</g></svg></div>
      <div class="muted">${t.youGot}</div><h2 style="justify-content:center">${(sp.n[S.lang]||sp.n.en)}</h2><span class="tag ${r}">${t.rar[r]}</span>
      ${bonus?`<p style="margin:0"><b style="color:var(--gold)">${t.bonus(bonus)}</b></p>`:""}<div class="muted">${parse(k).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}</div>
      <button class="btn primary" data-close>${t.nice}</button>`);
    confetti(r==="l"?["#e2b553","#fff3b0","#f6c6d8","#ffffff"]:r==="r"?["#5aa7ef","#f7a8c8","#ffd36e"]:undefined,r==="l"?90:r==="r"?60:30);
    document.getElementById("totalPts").textContent=totalPoints()},1600)}

function vTasks(){const t=T(),k=TODAY(),d=peek(k)||{tasks:{}},open=S.todos.filter(x=>!x.done),done=S.todos.filter(x=>x.done);
  const todo=x=>`<div class="check${x.done?" done":""}"><input type="checkbox" id="t_${x.id}" data-todo="${x.id}" ${x.done?"checked":""}><label for="t_${x.id}">${esc(x.text)}${x.due?` <span class="muted">· ${x.due}${!x.done&&x.due<k?` (${t.late})`:""}</span>`:""}</label><button class="x" data-deltodo="${x.id}" aria-label="Delete">×</button></div>`;
  return`<div class="card"><h2>${t.routine}<small>${t.routineSub}</small></h2>
    ${S.routine.map(r=>`<div class="check${d.tasks&&d.tasks[r.id]?" done":""}"><input type="checkbox" id="rr_${r.id}" data-rt="${r.id}" ${d.tasks&&d.tasks[r.id]?"checked":""}><label for="rr_${r.id}">${esc(r.name)}</label><button class="x" data-delrt="${r.id}" aria-label="Delete">×</button></div>`).join("")}
    <form class="row" id="rtForm"><input type="text" id="rtName" placeholder="${t.rtPh}" style="flex:1"><button class="btn primary">${t.add}</button></form></div>
  <div class="card"><h2>${t.todo}<small>${t.left(open.length)}</small></h2>
    ${open.map(todo).join("")||`<div class="muted">${t.allDone}</div>`}
    <form class="row" id="todoForm"><input type="text" id="todoText" placeholder="${t.todoPh}" style="flex:1"><input type="date" id="todoDue" aria-label="Due date"><button class="btn primary">${t.add}</button></form>
    ${done.length?`<details><summary class="muted">${t.doneN(done.length)}</summary>${done.map(todo).join("")}</details>`:""}</div>`}

function vReport(){const t=T(),days=[];for(let i=reportRange-1;i>=0;i--)days.push(key(add(new Date(),-i)));
  let pr=0,pp=0,ay=0,tj=0,rt=0,rtT=0,full=0,per=0;
  days.forEach(k=>{const d=peek(k);if(d&&d.period){per++;return}pp+=5;rtT+=S.routine.length;if(!d)return;pr+=prayed(d);
    const tr=qRec(d,"tar");if(tr)ay+=tr.to-tr.from+1;if(qDone(d,"taj"))tj++;if(fullOK(d))full++;rt+=S.routine.filter(r=>d.tasks&&d.tasks[r.id]).length});
  const pts=days.map(k=>points(peek(k),k)),max=Math.max(60,...pts),td=peek(TODAY());
  const lab={ontime:"✓ "+t.ontime,qaza:"◐ "+t.qaza,missed:"✗ "+t.missed};
  const todayList=td&&td.period?`<div class="excused">${t.period}</div>`:`<div class="tablewrap"><table>
    ${PRAYERS.map(([p,n])=>`<tr><td>${n}</td><td>${lab[td&&td.prayers[p]]||t.pending}</td></tr>`).join("")}
    <tr><td>${t.tar}</td><td>${td&&td.tarjuma?`✓ ${SURAH[td.tarjuma.surah-1]} ${td.tarjuma.from}–${td.tarjuma.to}`:t.pending}</td></tr>
    <tr><td>${t.taj}</td><td>${td&&td.tajweed?`✓ ${SURAH[td.tajweed.surah-1]}, ${t.ruku} ${td.tajweed.ruku}`:t.pending}</td></tr>
    <tr><td>${t.routine}</td><td>${S.routine.filter(r=>td&&td.tasks[r.id]).length}/${S.routine.length}</td></tr></table></div>`;
  const hist=Object.keys(S.days).sort().reverse().slice(0,60).map(k=>{const d=S.days[k];
    return`<tr><td>${k}</td><td>${d.period?t.periodL:prayed(d)+"/5"}</td><td>${d.tarjuma?`${SURAH[d.tarjuma.surah-1]} ${d.tarjuma.from}–${d.tarjuma.to}`:"–"}</td><td>${d.tajweed?`R${d.tajweed.ruku}`:"–"}</td><td>${points(d,k)}</td></tr>`}).join("");
  return`<div class="card"><h2>${t.todayRep}<small>${hijri(new Date())}</small></h2>${todayList}</div>
  <div class="card"><h2>${t.progress}<span class="row"><button class="btn small${reportRange===7?" primary":""}" data-range="7">${t.d7}</button><button class="btn small${reportRange===30?" primary":""}" data-range="30">${t.d30}</button></span></h2>
    <div class="stats"><div class="stat"><b>${pp?Math.round(pr/pp*100):0}%</b><span>${t.namazPct} (${pr}/${pp})</span></div><div class="stat"><b>${ay}</b><span>${t.ayat}</span></div>
      <div class="stat"><b>${tj}</b><span>${t.tajDays}</span></div><div class="stat"><b>${full}</b><span>${t.fullDays}</span></div><div class="stat"><b>${streak(fullOK)}</b><span>${t.curStreak}</span></div><div class="stat"><b>${longestStreak()}</b><span>${t.bestStreak}</span></div>
      <div class="stat"><b>${rtT?Math.round(rt/rtT*100):0}%</b><span>${t.routinePct}</span></div><div class="stat"><b>${per}</b><span>${t.periodDays}</span></div></div>
    <div class="muted">${t.dailyPts}</div>
    <div class="bars">${days.map((k,i)=>{const d=peek(k);return`<div class="bar${d&&d.period?" period":""}" style="height:${d&&d.period?40:Math.max(2,pts[i]/max*100)}%;animation-delay:${i*.02}s" title="${k}: ${pts[i]}"></div>`}).join("")}</div>
    <div class="barlabels">${days.map(k=>`<span>${reportRange===7||parse(k).getDate()%5===0?parse(k).getDate():""}</span>`).join("")}</div></div>
  <div class="card"><h2>${t.history}</h2>${hist?`<div class="tablewrap"><table><tr>${t.th.map(h=>`<th>${h}</th>`).join("")}</tr>${hist}</table></div>`:`<div class="muted">${t.noRecord}</div>`}</div>`}

const goalsCard=wizard=>prefsCard(wizard);
function vProfile(){const t=T(),fem=(me.gender||S.gender)==="female";return`<div class="card"><h2>${t.profile}</h2>
    ${sb?`<form class="authform" id="nameForm"><label for="pName">${t.fullName}</label><div class="row"><input type="text" id="pName" value="${esc(me.name)}" maxlength="60" style="flex:1"><button class="btn small">${t.save}</button></div></form>
    <div class="muted">${t.email}: <b>${esc(me.email)}</b></div>`:`<div class="muted">${t.name}: <b>${esc(me.name)}</b></div>`}
    <div class="row"><span class="muted" style="flex:1">${t.cloudNote(!!sb)}</span></div></div>
  ${fem||S.periodOn?`<div class="card"><label class="toggle"><input type="checkbox" id="periodOn" ${S.periodOn?"checked":""}> <span><b>${t.periodTrack}</b><br><span class="muted">${t.periodPrivate}</span></span></label></div>`:""}
  ${sb?`<div class="card"><h2>${t.changePw}</h2><form class="authform" id="pwForm">
      <label for="pPw">${t.newPw}</label><input type="password" id="pPw" autocomplete="new-password" minlength="8" required>
      <label for="pPw2">${t.confirmPw}</label><input type="password" id="pPw2" autocomplete="new-password" minlength="8" required>
      <div class="err" id="pErr" role="alert"></div><button class="btn">${t.changePw}</button></form></div>`:""}
  ${prayerSettingsCard()}
  ${phoneCard()}
  ${notifyCard()}
  ${goalsCard()}
  <div class="card"><div class="field"><label for="ramMode">${t.ramadanMode}</label><select id="ramMode">${["auto","on","off"].map(v=>`<option value="${v}"${(S.ramadanMode||"auto")===v?" selected":""}>${t.ramModes[v]}</option>`).join("")}</select></div><div class="muted small">${t.ramModeHelp}</div></div>
  ${isAdmin?`<div class="card admin-entry"><b>🛡️ ${T().adm.title}</b><div class="muted small">${T().adm.entryHelp}</div><button class="btn primary" data-goto="admin">${T().adm.open}</button></div>`:""}
  <div class="card"><div class="row"><button class="btn" id="tourAgain">${t.tourAgain}</button><button class="btn" id="logout2">${t.logout}</button></div></div>
  ${sb?`<div class="card"><h2>${t.delAcc}</h2><div class="muted">${t.delAccSub}</div><div class="row"><button class="btn danger" id="delAcc">${t.delAcc}</button><span class="muted" id="delMsg"></span></div></div>`:""}`}

function pwIssue(pw,t){return pw.length<8||!/[A-Za-z]/.test(pw)||!/\d/.test(pw)?t.pwWeak:""}
function vAuthEmail(){const t=T(),m=authMode;
  const pw=(id,lbl,ac)=>`<label for="${id}">${lbl}</label><div class="pwrow"><input type="password" id="${id}" autocomplete="${ac}" required><button type="button" class="eye" data-eye="${id}" aria-label="${t.showPw}">👁</button></div>`;
  const title={in:t.signIn,up:t.newAcc,forgot:t.forgotTitle,reset:t.newPw,sent:t.checkEmail}[m];
  let body="";
  if(m==="sent")body=`<div class="goal" style="text-align:center">${t.sentMsg}</div><button type="button" class="btn primary" data-mode="in">${t.signIn}</button>`;
  else body=`<form id="auth-${m}" class="authform">
    ${m==="up"?`<label for="aFull">${t.fullName}</label><input type="text" id="aFull" autocomplete="name" maxlength="60" required>`:""}
    ${m!=="reset"?`<label for="aEmail">${t.email}</label><input type="email" id="aEmail" autocomplete="email" required>`:""}
    ${m==="in"?pw("aPw",t.password,"current-password"):""}
    ${m==="up"||m==="reset"?pw("aPw",t.password,"new-password")+pw("aPw2",t.confirmPw,"new-password")+`<div class="muted" style="font-size:.78rem">${t.pwRule}</div>`:""}
    ${m==="up"?`<fieldset class="gender"><legend>${t.gender}</legend>${[["female",t.female],["male",t.male],["none",t.preferNot]].map(([v,l])=>`<label><input type="radio" name="gender" value="${v}" required> ${l}</label>`).join("")}</fieldset>
      <label class="check2"><input type="checkbox" id="aTerms" required> <span>${t.terms}</span></label>`:""}
    <div class="err" id="aErr" role="alert"></div>
    <button class="btn primary">${{in:t.signIn,up:t.create,forgot:t.sendLink,reset:t.savePw}[m]}</button></form>
    ${m==="in"?`<button type="button" class="linkbtn" data-mode="forgot">${t.forgotLink}</button><button type="button" class="linkbtn" data-mode="up">${t.noAcc}</button>`:""}
    ${m==="up"||m==="forgot"?`<button type="button" class="linkbtn" data-mode="in">${t.haveAcc}</button>`:""}`;
  return`<div class="card auth"><div class="authicon">🌸</div><h2 style="justify-content:center">${title}</h2>${body}</div>`}
async function doAuthEmail(form){const t=T(),v=id=>{const e=document.getElementById(id);return e?e.value.trim():""},err=document.getElementById("aErr"),btn=document.querySelector("#"+form+" .btn.primary");
  const fail=msg=>{err.textContent=msg;btn.disabled=false};btn.disabled=true;err.textContent="";
  /* inside the Android/iOS app the page runs on localhost, so email links must open the website */
  const redirect=/^https:$/.test(location.protocol)&&location.hostname!=="localhost"?location.origin+location.pathname:"https://almasaina.github.io/deen-diary/";
  try{
    if(form==="auth-up"){const pw=document.getElementById("aPw").value,g=(document.querySelector("input[name=gender]:checked")||{}).value;
      if(!v("aFull"))return fail(t.nameBad);if(!g)return fail(t.genderBad);const w=pwIssue(pw,t);if(w)return fail(w);
      if(pw!==document.getElementById("aPw2").value)return fail(t.pwMismatch);
      const{data,error}=await sb.auth.signUp({email:v("aEmail"),password:pw,options:{data:{full_name:v("aFull"),gender:g},emailRedirectTo:redirect}});
      if(error)return fail(authMsg(error,t));if(!data.session){authMode="sent";return render()}return}
    if(form==="auth-in"){const{error}=await sb.auth.signInWithPassword({email:v("aEmail"),password:document.getElementById("aPw").value});
      if(error)return fail(authMsg(error,t));return}
    if(form==="auth-forgot"){const{error}=await sb.auth.resetPasswordForEmail(v("aEmail"),{redirectTo:redirect});if(error)return fail(authMsg(error,t));
      authMode="sent";return render()}
    if(form==="auth-reset"){const pw=document.getElementById("aPw").value,w=pwIssue(pw,t);if(w)return fail(w);if(pw!==document.getElementById("aPw2").value)return fail(t.pwMismatch);
      const{data,error}=await sb.auth.updateUser({password:pw});if(error)return fail(authMsg(error,t));toast(t.pwSaved);authMode="in";return enterCloud(data.user)}
  }catch(e){fail(navigator.onLine?t.authErr:t.offline)}}
function authMsg(e,t){const m=(e.message||"").toLowerCase();
  if(m.includes("invalid login"))return t.wrongEmail;if(m.includes("not confirmed"))return t.notConfirmed;
  if(m.includes("already registered"))return t.emailTaken;if(m.includes("rate")||e.status===429)return t.tooMany;
  if(m.includes("valid email")||m.includes("invalid format"))return t.emailBad;return e.message||t.authErr}
function vAuth(){if(sb)return vAuthEmail();const t=T(),up=authMode==="up";
  return`<div class="card auth"><div class="authicon">🌸</div><h2 style="justify-content:center">${up?t.newAcc:t.signIn}</h2>
    <div class="muted" style="text-align:center">${t.authNote}</div>
    ${!up&&accounts.length?`<div class="acctlist">${accounts.map(a=>`<button type="button" class="acct" data-acct="${esc(a.name)}"><span>${esc(a.name[0]||"?").toUpperCase()}</span>${esc(a.name)}</button>`).join("")}</div>`:""}
    <form id="${up?"signup":"signin"}" class="authform">
      <label for="aName">${t.name}</label><input type="text" id="aName" autocomplete="username" maxlength="30" required>
      <label for="aPin">${t.pin}</label><input type="password" id="aPin" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" autocomplete="${up?"new-password":"current-password"}" required>
      ${up?`<label for="aPin2">${t.pin2}</label><input type="password" id="aPin2" inputmode="numeric" pattern="[0-9]{4}" maxlength="4" required>
      <label class="toggle"><input type="checkbox" id="aPeriod" checked> <span>${t.periodTrack}<br><span class="muted">${t.periodTrackSub}</span></span></label>`:""}
      <div class="err" id="aErr" role="alert"></div>
      <button class="btn primary">${up?t.create:t.signIn}</button></form>
    <button type="button" class="linkbtn" id="authSwitch">${up?(accounts.length?t.haveAcc:""):t.noAcc}</button>
    <div class="muted" style="text-align:center;font-size:.78rem">${t.forgot}</div></div>`}
async function doAuth(form){const t=T(),name=document.getElementById("aName").value.trim(),pin=document.getElementById("aPin").value,err=document.getElementById("aErr");
  if(!/^\d{4}$/.test(pin))return err.textContent=t.pinBad;
  const found=accounts.find(a=>a.name.toLowerCase()===name.toLowerCase());
  if(form==="signup"){if(!name)return err.textContent=t.nameBad;if(found)return err.textContent=t.nameTaken;
    if(pin!==document.getElementById("aPin2").value)return err.textContent=t.pinMismatch;
    const acc={id:uid(),name,pin:await hashPin(name,pin)};
    const legacy=ls.get(STORE);if(legacy&&!accounts.length){ls.set(STORE+":"+acc.id,legacy);ls.del(STORE)}
    accounts.push(acc);ls.set(ACC,JSON.stringify(accounts));loadAccount(acc.id);
    if(!legacy)S.periodOn=document.getElementById("aPeriod").checked;save();tab="today";sel=TODAY();toast(t.welcome(name));return render()}
  if(!found||found.pin!==await hashPin(name,pin))return err.textContent=t.wrong;
  loadAccount(found.id);tab="today";sel=TODAY();toast(t.welcome(found.name));render()}
function logout(){isAdmin=false;if(tab==="admin")tab="today";if(sb){Cloud.push(S).finally(()=>sb.auth.signOut());Cloud.user=null;me=null;S.days={};authMode="in";return render()}save();ls.del(SES);me=null;authMode="in";render()}
let lastView="";
function render(){const t=T(),hr=new Date().getHours();
  document.documentElement.lang={en:"en",ur:"ur",roman:"ur-Latn"}[S.lang]||"en";document.documentElement.dir=t.dir||"ltr";
  document.getElementById("logout").hidden=!me;document.getElementById("logout").title=t.logout;document.getElementById("logout").setAttribute("aria-label",t.logout);
  if(!me){document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===S.lang));
    document.getElementById("greet").textContent=t.greet[1];document.getElementById("todayHijri").textContent=hijri(new Date());
    document.getElementById("totalPts").textContent="";document.getElementById("ptsLbl").textContent="";document.getElementById("ringPct").textContent="–";document.getElementById("ringVal").style.strokeDashoffset=226.2;
    document.getElementById("tabs").hidden=true;document.getElementById("view").innerHTML=vAuth();return}
  document.getElementById("tabs").hidden=false;
  
  document.getElementById("greet").textContent=t.greet[hr<12&&hr>=4?0:hr<17&&hr>=12?1:hr<20&&hr>=17?2:3]+", "+me.name;
  document.getElementById("todayHijri").textContent=hijri(new Date());
  document.getElementById("totalPts").textContent=totalPoints();document.getElementById("ptsLbl").textContent=t.pts;document.getElementById("ringLbl").textContent=t.ring;
  document.querySelectorAll("[data-lang]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lang===S.lang));
  document.getElementById("tabs").innerHTML=TABS.map((id,i)=>`<button data-tab="${id}" role="tab" aria-selected="${id===tab}">${t.tabs[i]}</button>`).join("");
  const td=peek(TODAY());let pct=0;if(td&&td.period)pct=100;else if(td){const gl=G(),on=ACTS.filter(([a])=>gl[a].on);const g=prayed(td)+on.filter(([a])=>qDone(td,a)).length+learnGoalsMet(td,TODAY())+S.routine.filter(r=>td.tasks[r.id]).length;pct=Math.round(g/(5+on.length+learnGoalsCount(TODAY())+S.routine.length)*100)}
  document.getElementById("ringVal").style.strokeDashoffset=226.2*(1-pct/100);document.getElementById("ringPct").textContent=pct+"%";
  const v=document.getElementById("view"),vk=tab+"|"+(azOpen||"");if(vk!==lastView){lastView=vk;v.style.animation="none";void v.offsetWidth;v.style.animation=""}
  if(!S.onboarded){v.innerHTML=`<div class="card welcome"><div class="authicon">🌿</div><h2 style="justify-content:center">${t.welcomeTitle}</h2><div class="muted" style="text-align:center">${t.welcomeSub}</div></div>`+goalsCard(true);return}
  if(!S.toured)setTimeout(startTour,300);
  schedulePrayerReminder();
  if(tab==="today"&&azOpen&&AZKAR[azOpen]){v.innerHTML=azkarView();return}
  try{v.innerHTML={today:vToday,calendar:()=>vCalendar()+vReport(),garden:vGarden,tasks:vTasks,journal:vJournal,profile:vProfile,quiz:vQuiz,admin:vAdmin,notes:vNotes}[tab]();}catch(err){console.error(err);v.innerHTML=`<div class="card"><b>${t.authErr}</b><div class="muted small">${esc(String(err&&err.message||err))}</div><button class="btn small" data-goto="today">↻</button></div>`}updateBell()}

/* ---- events ---- */
const view=document.getElementById("view");
document.getElementById("tabs").onclick=e=>{const b=e.target.closest("[data-tab]");if(b){tab=b.dataset.tab;azOpen=null;qz.mode="home";render();scrollTo(0,0)}};
document.querySelector(".lang").onclick=e=>{const b=e.target.closest("[data-lang]");if(b){S.lang=b.dataset.lang;save();ls.set("deen-diary-lang",S.lang);render()}};
{const lg=ls.get("deen-diary-lang");if(!me&&lg)S.lang=lg}
document.getElementById("logout").onclick=logout;
document.getElementById("bell").onclick=()=>{tab="notes";render();scrollTo(0,0)};
view.addEventListener("click",e=>{
  if(e.target.id==="authSwitch"){authMode=authMode==="up"?"in":"up";return render()}
  const ac=e.target.closest("[data-acct]");if(ac){document.getElementById("aName").value=ac.dataset.acct;return document.getElementById("aPin").focus()}
  if(e.target.id==="logout2")return logout();
  const md=e.target.closest("[data-mode]");if(md){authMode=md.dataset.mode;return render()}
  const eye=e.target.closest("[data-eye]");if(eye){const f=document.getElementById(eye.dataset.eye);f.type=f.type==="password"?"text":"password";return}
  if(e.target.id==="delAcc"){const b=e.target,t=T();if(!b.dataset.armed){b.dataset.armed="1";b.textContent=t.sure;document.getElementById("delMsg").textContent=t.delWarn;return}
    b.disabled=true;sb.rpc("delete_my_account").then(({error})=>{if(error){b.disabled=false;document.getElementById("delMsg").textContent=t.authErr;return}
      try{localStorage.removeItem(Cloud.key());localStorage.removeItem(Cloud.key()+":dirty")}catch(_){}sb.auth.signOut();Cloud.user=null;me=null;authMode="in";toast(t.deleted);render()});return}const t=e.target.closest("button,a,input[type=checkbox],[data-bud],[data-fl]");if(!t)return;const tr=T();
  if(t.dataset.bud)return openBud(t.dataset.bud);
  if(t.dataset.fl){const f=S.flowers[t.dataset.fl],sp=f&&SPMAP[f.sp];return toast(tr.bloomedOn(sp?(sp.n[S.lang]||sp.n.en):"🌻",parse(t.dataset.fl).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})))}
  if(t.dataset.goto){e.preventDefault();tab=t.dataset.goto;if(t.dataset.day)sel=t.dataset.day;return render()}
  if(t.dataset.day){sel=t.dataset.day;return render()}
  if(t.dataset.cal){sel=t.dataset.cal;tab="today";return render()}
  if(t.dataset.pray){const d=dayOf(sel);d.prayers[t.dataset.pray]=d.prayers[t.dataset.pray]===t.dataset.v?"":t.dataset.v;return commit()}
  if(t.dataset.qdo){toggleQ(sel,t.dataset.qdo);return commit()}
  if(t.dataset.sp){const d=dayOf(sel);d.special=d.special||{};d.special[t.dataset.sp]=t.checked;return commit()}
  if(adminClick(t))return;
  if(t.dataset.ntread){markRead(t.dataset.ntread);return}
  if(quizClick(t))return commit();
  if(t.dataset.gview){gView=t.dataset.gview;return render()}
  if(t.dataset.azopen){azOpen=t.dataset.azopen;render();scrollTo(0,0);return}
  if(t.id==="azBack"){azOpen=null;return render()}
  if(t.dataset.aztap){azTap(+t.dataset.aztap);return commit()}
  if(t.id==="ptGeo"){const msg=document.getElementById("ptGeoMsg"),tr=T();if(!navigator.geolocation){msg.textContent=tr.ptGeoNo;return}
    msg.textContent="…";navigator.geolocation.getCurrentPosition(pos=>{const p=PS();p.lat=+pos.coords.latitude.toFixed(4);p.lng=+pos.coords.longitude.toFixed(4);p.city="";commit();toast(tr.saved)},
      ()=>{msg.textContent=tr.ptGeoNo},{timeout:15000,maximumAge:3600000});return}
  if(t.dataset.ram){const[f,v]=t.dataset.ram.split("|"),d=dayOf(sel);d.ramadan=d.ramadan||{};d.ramadan[f]=d.ramadan[f]===v?"":v;return commit()}
  if(t.dataset.jedit){jEdit=t.dataset.jedit;render();scrollTo(0,0);return}
  if(t.dataset.jdel){if(!t.dataset.armed){t.dataset.armed="1";t.textContent=T().sure;return}S.journal=(S.journal||[]).filter(x=>x.id!==t.dataset.jdel);if(jEdit===t.dataset.jdel)jEdit=null;return commit()}
  if(t.id==="jCancel"){jEdit=null;return render()}
  if(t.dataset.revdo){toggleRev(sel,t.dataset.revdo);return commit()}
  if(t.dataset.mins){const[k,id,dl]=t.dataset.mins.split("|");addMinutes(sel,k,id,+dl);return commit()}
  if(t.dataset.litdel){S.lit=S.lit.filter(x=>x.id!==t.dataset.litdel);return commit()}
  if(t.dataset.litadd){const er=addTopic(t.dataset.litadd,15);if(er)toast(er);return commit()}  if(t.dataset.dz){const d=dayOf(sel);d.dhikr=d.dhikr||{};d.dhikr[t.dataset.dz]=(d.dhikr[t.dataset.dz]||0)+1;if(navigator.vibrate)try{navigator.vibrate(8)}catch(_){}return commit()}
  if(t.dataset.dzminus){const d=dayOf(sel);d.dhikr=d.dhikr||{};d.dhikr[t.dataset.dzminus]=Math.max(0,(d.dhikr[t.dataset.dzminus]||0)-1);return commit()}
  if(t.id==="wizDone"||t.id==="wizSkip"){S.onboarded=true;save();return render()}
  if(t.id==="tourAgain"){S.toured=false;tab="today";save();render();return}
  if(t.dataset.rt){const d=dayOf(tab==="tasks"?TODAY():sel);d.tasks[t.dataset.rt]=t.checked;return commit()}
  if(t.dataset.delrt){S.routine=S.routine.filter(r=>r.id!==t.dataset.delrt);return commit()}
  if(t.dataset.todo){S.todos.find(r=>r.id===t.dataset.todo).done=t.checked;return commit()}
  if(t.dataset.deltodo){S.todos=S.todos.filter(r=>r.id!==t.dataset.deltodo);return commit()}
  if(t.dataset.range){reportRange=+t.dataset.range;return render()}
  if(t.id==="calPrev"){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()-1,1);return render()}
  if(t.id==="calNext"){calMonth=new Date(calMonth.getFullYear(),calMonth.getMonth()+1,1);return render()}});
view.addEventListener("change",e=>{const t=e.target;
  if(t.id==="period"){dayOf(sel).period=t.checked;return commit()}
  if(t.id==="periodOn"){S.periodOn=t.checked;return commit()}
  if(t.dataset.goal){G()[t.dataset.goal].on=t.checked;return commit()}
  if(learnChange(t))return commit();
  if(t.dataset.ramck){const d=dayOf(sel);d.ramadan=d.ramadan||{};d.ramadan[t.dataset.ramck]=t.checked;return commit()}
  if(t.dataset.ramtxt){const d=dayOf(sel);d.ramadan=d.ramadan||{};d.ramadan[t.dataset.ramtxt]=t.value.trim().slice(0,80);save();return}
  if(t.id==="ramMode"){S.ramadanMode=t.value;return commit()}
  if(t.id==="ptCity"){const c=PT_CITIES.find(x=>x[0]===t.value);if(c){const p=PS();p.city=c[0];p.lat=c[1];p.lng=c[2]}return commit()}
  if(t.id==="ptNotify"){const p=PS(),tr=T(),msg=document.getElementById("ptNotifyMsg");
    if(isNative()){p.notify=t.checked;return commit()}
    if(!t.checked){p.notify=false;return commit()}
    if(!("Notification"in window)){t.checked=false;msg.textContent=tr.ptNotifNo;return}
    Notification.requestPermission().then(r=>{if(r==="granted"){p.notify=true;commit()}else{t.checked=false;msg.textContent=tr.ptNotifDenied}});return}
  if(t.id==="jFilter"){jFilter=t.value;return render()}
  if(adminChange(t))return;
  if(notifyChange(t))return;
  if(phoneChange(t))return;
  if(t.id==="qhCat"){qz.filter.cat=t.value;return render()}
  if(t.id==="qhRes"){qz.filter.res=t.value;return render()}
  if(t.id==="qhHidden"){qz.filter.showHidden=t.checked;return render()}
  if(t.id==="jSearch"){jQuery=t.value.trim();return render()}
  if(t.id==="note"){dayOf(sel).note=t.value;save()}});
view.addEventListener("keydown",e=>{const b=e.target.closest&&e.target.closest("[data-bud]");if(b&&(e.key==="Enter"||e.key===" ")){e.preventDefault();openBud(b.dataset.bud)}});
view.addEventListener("input",e=>{if(e.target.id==="litName"){const er=document.getElementById("litErr");if(er)er.textContent="";const b=document.getElementById("litAddBtn");if(b)b.disabled=!e.target.value.trim()}});
view.addEventListener("submit",e=>{e.preventDefault();
  if(e.target.id==="signin"||e.target.id==="signup")return doAuth(e.target.id);
  if(e.target.id.startsWith("auth-"))return doAuthEmail(e.target.id);
  if(adminSubmit(e.target))return;
  if(e.target.id==="jForm"){if(saveJournal())commit();return}
  if(e.target.id==="litForm"){const er=addTopic(document.getElementById("litName").value,document.getElementById("litMin").value);
    if(er){document.getElementById("litErr").textContent=er;return}return commit()}
  if(e.target.id==="nameForm"){const n=document.getElementById("pName").value.trim();if(!n)return;
    sb.auth.updateUser({data:{full_name:n}}).then(({error})=>{if(error)return toast(T().authErr);me.name=n;toast(T().saved);render()});return}
  if(e.target.id==="pwForm"){const t=T(),pw=document.getElementById("pPw").value,er=document.getElementById("pErr"),w=pwIssue(pw,t);if(w)return er.textContent=w;
    if(pw!==document.getElementById("pPw2").value)return er.textContent=t.pwMismatch;
    sb.auth.updateUser({password:pw}).then(({error})=>{if(error)return er.textContent=authMsg(error,t);e.target.reset();er.textContent="";toast(t.pwSaved)});return}
  if(e.target.id==="rtForm"){const v=document.getElementById("rtName").value.trim();if(v){S.routine.push({id:uid(),name:v});commit()}}
  if(e.target.id==="todoForm"){const v=document.getElementById("todoText").value.trim();if(v){S.todos.push({id:uid(),text:v,due:document.getElementById("todoDue").value,done:false});commit()}}});
const h=location.hash.slice(1);if(TABS.includes(h))tab=h;else if(h==="report")tab="calendar";
if(sb){
  sb.auth.onAuthStateChange((ev,session)=>{
    if(ev==="PASSWORD_RECOVERY"){authMode="reset";me=null;return render()}
    if(session&&session.user&&(!me||me.id!==session.user.id)&&authMode!=="reset")enterCloud(session.user);
    if(ev==="SIGNED_OUT"&&me){me=null;render()}});
  addEventListener("online",()=>{if(me&&Cloud.isDirty())Cloud.push(S)});
  me=null;authMode="in";
}
render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});

/* ---- guided tour: one tab at a time ---- */
let tourStep=-1;
function startTour(){if(tourStep>=0||!me||S.toured)return;tourStep=0;showTour()}
function showTour(){const t=T(),steps=t.tour,r=document.getElementById("popRoot"),st=steps[tourStep];
  document.querySelectorAll("nav button").forEach((b,i)=>b.classList.toggle("tourhi",i===st.tab));
  r.innerHTML=`<div class="tour" role="dialog" aria-label="${t.tourTitle}"><div class="card"><div class="muted">${tourStep+1} / ${steps.length}</div><h2>${st.h}</h2><p style="margin:0">${st.p}</p>
    <div class="row" style="justify-content:space-between"><button class="linkbtn" data-tour="skip">${t.skip}</button>
    <span class="row">${tourStep?`<button class="btn small" data-tour="back">${t.back}</button>`:""}<button class="btn primary small" data-tour="next">${tourStep===steps.length-1?t.finish:t.next}</button></span></div></div></div>`}
function endTour(){tourStep=-1;S.toured=true;save();document.getElementById("popRoot").innerHTML="";document.querySelectorAll(".tourhi").forEach(b=>b.classList.remove("tourhi"))}
document.getElementById("popRoot").addEventListener("click",e=>{const b=e.target.closest("[data-tour]");if(!b)return;const a=b.dataset.tour,n=T().tour.length;
  if(a==="skip")return endTour();if(a==="back")tourStep=Math.max(0,tourStep-1);if(a==="next"){if(tourStep>=n-1)return endTour();tourStep++}showTour()});
