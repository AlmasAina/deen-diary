// Deen Diary reminder emails. Runs hourly (pg_cron) and sends, per user and in their own time zone:
//  - a daily reminder at their chosen hour listing goals still open today,
//  - an optional weekly summary on their chosen day,
//  - one gentle note after 24 hours without opening the app.
// GET ?unsubscribe=<token> turns emails off for that user.
// Secrets: RESEND_API_KEY, MAIL_FROM (e.g. "Deen Diary <reminders@yourdomain.com>"). SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY are provided by Supabase. Period data is never read into an email.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const RESEND = Deno.env.get("RESEND_API_KEY") ?? "";
const FROM = Deno.env.get("MAIL_FROM") ?? "Deen Diary <onboarding@resend.dev>";
const SITE = "https://almasaina.github.io/deen-diary/";
const FN_URL = `${Deno.env.get("SUPABASE_URL")}/functions/v1/send-reminders`;
// Firebase service account JSON (Project settings > Service accounts > Generate new private key), stored as a secret
const FCM_SA = (() => { try { return JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT") ?? ""); } catch { return null; } })();

type Lang = "en" | "roman" | "ur";
// Ayat about Allah's nearness, mercy, love, prayer and remembrance for the "we miss you" email.
// Arabic: Tanzil (quran-simple). Translations: ur Fateh Muhammad Jalandhry, roman Abul A'la Maududi, en Sahih International.
const AYAT: { ref: string; ar: string; ur: string; roman: string; en: string }[] = [{"ref": "2:186", "ar": "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ", "ur": "اور (اے پیغمبر) جب تم سے میرے بندے میرے بارے میں دریافت کریں تو (کہہ دو کہ) میں تو (تمہارے) پاس ہوں جب کوئی پکارنے والا مجھے پکارتا ہے تو میں اس کی دعا قبول کرتا ہوں تو ان کو چاہیئے کہ میرے حکموں کو مانیں اور مجھ پر ایمان لائیں تاکہ نیک رستہ پائیں", "roman": "(Aur aey Nabi)! Mere bandey agar tumse mere mutaaliq puchein, to unhein bata do ke main unse kareeb hi hoon, pukaarne wala jab mujhey pukarta hai, mai uski pukaar sunta aur jawab deta hoon, lihaza unhein chahiye ke meri dawat par labbaik kahein aur mujhpar iman layein, yeh baat tum unhein suna do, shayad ke woh raah e raast paa lein", "en": "And when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me [by obedience] and believe in Me that they may be [rightly] guided"}, {"ref": "39:53", "ar": "۞ قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنْفُسِهِمْ لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ", "ur": "(اے پیغمبر میری طرف سے لوگوں کو) کہہ دو کہ اے میرے بندو جنہوں نے اپنی جانوں پر زیادتی کی ہے خدا کی رحمت سے ناامید نہ ہونا۔ خدا تو سب گناہوں کو بخش دیتا ہے۔ (اور) وہ تو بخشنے والا مہربان ہے", "roman": "(Aey Nabi) kehdo ke aey mere bandon, jinhon ne apni jaano par zyadti (excesses) ki hai, Allah ki rehmat se mayous na ho jao, yaqeenan Allah saarey gunaah maaf kardeta hai, woh to gafoor o Raheem hai(Most Forgiving, Most Merciful)", "en": "Say, \"O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful"}, {"ref": "3:31", "ar": "قُلْ إِنْ كُنْتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ ۗ وَاللَّهُ غَفُورٌ رَحِيمٌ", "ur": "(اے پیغمبر لوگوں سے) کہہ دو کہ اگر تم خدا کو دوست رکھتے ہو تو میری پیروی کرو خدا بھی تمہیں دوست رکھے گا اور تمہارے گناہ معاف کر دے گا اور خدا بخشنے والا مہربان ہے", "roman": "(Aey Nabi)! Logon se kehdo ke “agar tum haqeeqat mein Allah se muhabbat rakhte ho , to meri pairwi ikhtiyar karo, Allah tumse muhabbat karega aur tumhari khataon se darguzar farmayega, woh bada maaf karne wala aur Raheem hai”", "en": "Say, [O Muhammad], \"If you should love Allah, then follow me, [so] Allah will love you and forgive you your sins. And Allah is Forgiving and Merciful"}, {"ref": "50:16", "ar": "وَلَقَدْ خَلَقْنَا الْإِنْسَانَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِ نَفْسُهُ ۖ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ", "ur": "اور ہم ہی نے انسان کو پیدا کیا ہے اور جو خیالات اس کے دل میں گزرتے ہیں ہم ان کو جانتے ہیں۔ اور ہم اس کی رگ جان سے بھی اس سے زیادہ قریب ہیں", "roman": "Humne Insaan ko paida kiya hai aur uske dil mein ubharne wale waswason tak ko hum jaante hain. Hum to us ki rag-e-gardan(jugular vein) se bhi zyada us se qareeb hain", "en": "And We have already created man and know what his soul whispers to him, and We are closer to him than [his] jugular vein"}, {"ref": "20:14", "ar": "إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي وَأَقِمِ الصَّلَاةَ لِذِكْرِي", "ur": "بےشک میں ہی خدا ہوں۔ میرے سوا کوئی معبود نہیں تو میری عبادت کرو اور میری یاد کے لئے نماز پڑھا کرو", "roman": "Main hi Allah hoon, mere siwa koi khuda nahin hai, pas tu meri bandagi kar aur meri yaad ke liye namaz qayam kar", "en": "Indeed, I am Allah. There is no deity except Me, so worship Me and establish prayer for My remembrance"}, {"ref": "29:45", "ar": "اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ وَأَقِمِ الصَّلَاةَ ۖ إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ ۗ وَاللَّهُ يَعْلَمُ مَا تَصْنَعُونَ", "ur": "(اے محمدﷺ! یہ) کتاب جو تمہاری طرف وحی کی گئی ہے اس کو پڑھا کرو اور نماز کے پابند رہو۔ کچھ شک نہیں کہ نماز بےحیائی اور بری باتوں سے روکتی ہے۔ اور خدا کا ذکر بڑا (اچھا کام) ہے۔ اور جو کچھ تم کرتے ہو خدا اُسے جانتا ہے", "roman": "(Aey Nabi) Tilawat karo is kitaab ki jo tumhari taraf wahee ke zairye se bheji gayi hai. Aur namaz qayam karo, yaqeenan namaz fahash (behayayi) aur burey kaamon se rokti hai. Aur Allah ka zikr issey bhi zyada badi cheez hai. Allah jaanta hai jo kuch tumlog karte ho", "en": "Recite, [O Muhammad], what has been revealed to you of the Book and establish prayer. Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater. And Allah knows that which you do"}, {"ref": "2:152", "ar": "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", "ur": "سو تم مجھے یاد کرو۔ میں تمہیں یاد کیا کروں گا۔ اور میرے احسان مانتے رہنا اور ناشکری نہ کرنا", "roman": "Lihaza tum mujhey yaad rakkho main tumhein yaad rakhunga aur mera shukar ada karo, kufran e niyamat na karo", "en": "So remember Me; I will remember you. And be grateful to Me and do not deny Me"}, {"ref": "13:28", "ar": "الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُمْ بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", "ur": "(یعنی) جو لوگ ایمان لاتے اور جن کے دل یادِ خدا سے آرام پاتے ہیں (ان کو) اور سن رکھو کہ خدا کی یاد سے دل آرام پاتے ہیں", "roman": "Aisey hi log hain woh jinhon ne (is Nabi ki dawat ko) maan liya hai aur unke dilon ko Allah ki yaad se itminaan naseeb hota hai, khabardar raho! Allah ki yaad hi woh cheez hai jissey dilon ko itminaan naseeb hua karta hai", "en": "Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured"}, {"ref": "2:153", "ar": "يَا أَيُّهَا الَّذِينَ آمَنُوا اسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", "ur": "اے ایمان والو صبر اور نماز سے مدد لیا کرو بےشک خدا صبر کرنے والوں کے ساتھ ہے", "roman": "Aey logon jo iman laye ho sabr aur namaz se madad lo, Allah sabr karne walon ke saath hai", "en": "O you who have believed, seek help through patience and prayer. Indeed, Allah is with the patient"}, {"ref": "94:6", "ar": "إِنَّ مَعَ الْعُسْرِ يُسْرًا", "ur": "(اور) بے شک مشکل کے ساتھ آسانی ہے", "roman": "Beshak tangi kay saath farakhi bhi hai", "en": "Indeed, with hardship [will be] ease"}, {"ref": "65:3", "ar": "وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا", "ur": "اور اس کو ایسی جگہ سے رزق دے گا جہاں سے (وہم و) گمان بھی نہ ہو۔ اور جو خدا پر بھروسہ رکھے گا تو وہ اس کو کفایت کرے گا۔ خدا اپنے کام کو (جو وہ کرنا چاہتا ہے) پورا کردیتا ہے۔ خدا نے ہر چیز کا اندازہ مقرر کر رکھا ہے", "roman": "Aur usey aise raaste se rizq dega jidhar uska guman(imagination) bhi na jata ho. Jo Allah par bharosa karey uske liye woh kafi hai. Allah apna kaam pura karke rehta hai, Allah ne har cheez ke liye ek taqdeer muqarrar kar rakkhi hai", "en": "And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent"}];
const TRANSLATOR: Record<Lang, string> = { ur: "Fateh Muhammad Jalandhry", roman: "Maulana Maududi", en: "Sahih International" };
const TXT = {
  en: {
    dailyTitle: "Your goals for today are waiting",
    dailyIntro: "A gentle reminder of what is still open today:",
    weeklyTitle: "Your week in Deen Diary",
    inactiveTitle: "We missed you in Deen Diary 🌿",
    inactiveBody: "You haven't opened Deen Diary for a while. Your garden and your goals are waiting. Take a few quiet minutes today for salah, Quran and the remembrance of Allah; small, steady steps are beloved to Him.",
    ayahHead: "A reminder from the Quran",
    open: "Open Deen Diary", unsub: "Turn off these emails",
    items: { quran: "Quran goal", taj: "Tajweed practice", taf: "Tafseer study", tar: "Tarjuma", read: "Quran reading", azkarM: "Morning azkar", azkarE: "Evening azkar", habits: "Daily routine", learning: "Study time" },
    week: (p: number, a: number, h: number, f: number) => `Prayers recorded: ${p}%<br>Ayat translated: ${a}<br>Routine tasks done: ${h}<br>Full days (garden): ${f}`,
    verse: "“Indeed, with hardship comes ease.” — Quran 94:6",
  },
  roman: {
    dailyTitle: "Aaj ke goals aap ka intezar kar rahe hain",
    dailyIntro: "Aaj ke yeh kaam abhi baqi hain:",
    weeklyTitle: "Deen Diary mein aap ka hafta",
    inactiveTitle: "Deen Diary aap ko yaad kar rahi hai 🌿",
    inactiveBody: "Aap ne kuch waqt se Deen Diary nahi kholi. Aap ka garden aur goals aap ka intezar kar rahe hain. Aaj thoda sa sukoon ka waqt namaz, Quran aur Allah ki yaad ke liye nikalein; chhote magar musalsal amal Allah ko pasand hain.",
    ayahHead: "Quran se ek yaad dihani",
    open: "Deen Diary kholein", unsub: "Yeh emails band karein",
    items: { quran: "Quran ka goal", taj: "Tajweed ki mashq", taf: "Tafseer ka mutala", tar: "Tarjuma", read: "Quran tilawat", azkarM: "Subah ke azkar", azkarE: "Shaam ke azkar", habits: "Rozana kaam", learning: "Mutale ka waqt" },
    week: (p: number, a: number, h: number, f: number) => `Namaz: ${p}%<br>Tarjuma ki ayat: ${a}<br>Rozana kaam: ${h}<br>Mukammal din (garden): ${f}`,
    verse: "“Beshak tangi ke saath farakhi bhi hai.” — Quran 94:6",
  },
  ur: {
    dailyTitle: "آج کے اہداف آپ کے منتظر ہیں",
    dailyIntro: "آج کے یہ کام ابھی باقی ہیں:",
    weeklyTitle: "دین ڈائری میں آپ کا ہفتہ",
    inactiveTitle: "دین ڈائری آپ کو یاد کر رہی ہے 🌿",
    inactiveBody: "آپ نے کچھ وقت سے دین ڈائری نہیں کھولی۔ آپ کا باغ اور اہداف آپ کے منتظر ہیں۔ آج تھوڑا سا سکون کا وقت نماز، قرآن اور اللہ کی یاد کے لیے نکالیں؛ چھوٹے مگر مسلسل اعمال اللہ کو پسند ہیں۔",
    ayahHead: "قرآن سے ایک یاد دہانی",
    open: "دین ڈائری کھولیں", unsub: "یہ ای میلز بند کریں",
    items: { quran: "قرآن کا ہدف", taj: "تجوید کی مشق", taf: "تفسیر کا مطالعہ", tar: "ترجمہ", read: "تلاوتِ قرآن", azkarM: "صبح کے اذکار", azkarE: "شام کے اذکار", habits: "روزانہ کام", learning: "مطالعے کا وقت" },
    week: (p: number, a: number, h: number, f: number) => `نماز: ${p}%<br>ترجمہ شدہ آیات: ${a}<br>روزانہ کام: ${h}<br>مکمل دن (باغ): ${f}`,
    verse: "“بے شک مشکل کے ساتھ آسانی ہے۔” — قرآن 94:6",
  },
};

function local(tz: string) {
  const f = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false, weekday: "short" });
  const p = Object.fromEntries(f.formatToParts(new Date()).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24, weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday) };
}
const addDays = (d: string, n: number) => { const x = new Date(d + "T12:00:00Z"); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const inQuiet = (h: number, from: number, to: number) => from === to ? false : from < to ? h >= from && h < to : h >= from || h < to;

// goals still open today, using only the modules the user turned on
function openItems(data: any, day: string, cats: any): string[] {
  const d = data?.days?.[day] ?? {}, g = data?.goals ?? {}, out: string[] = [];
  if (d.period) return out; // a paused day: no reminders, and nothing about why
  const done = (a: string) => !!(d.q?.[a] || (a === "tar" && d.tarjuma) || (a === "taj" && d.tajweed) || (a === "read" && d.reading));
  if (cats.quran) for (const a of ["read", "taj", "taf", "tar"]) if (g[a]?.on && !done(a)) out.push(a);
  if (cats.azkar && g.dhikr?.on !== false) { if (!d.azkar?.morning) out.push("azkarM"); if (!d.azkar?.evening) out.push("azkarE"); }
  if (cats.habits && (data?.routine ?? []).some((r: any) => !d.tasks?.[r.id])) out.push("habits");
  if (cats.learning) {
    const lit = data?.lit ?? [], seer = g.seerat;
    if ((seer?.on && (d.seerat ?? 0) < seer.min) || lit.some((x: any) => ((d.lit ?? {})[x.id] ?? 0) < x.min)) out.push("learning");
  }
  return out;
}
function weekStats(data: any, today: string) {
  let pr = 0, pp = 0, ay = 0, h = 0, full = 0;
  for (let i = 0; i < 7; i++) {
    const d = data?.days?.[addDays(today, -i)]; if (!d || d.period) { if (!d) pp += 5; continue; }
    pp += 5; const n = ["fajr", "zuhr", "asr", "maghrib", "isha"].filter((p) => ["ontime", "qaza"].includes(d.prayers?.[p])).length; pr += n;
    const t = d.q?.tar ?? d.tarjuma; if (t) ay += t.to - t.from + 1;
    h += Object.values(d.tasks ?? {}).filter(Boolean).length; if (n === 5) full++;
  }
  return [pp ? Math.round(pr / pp * 100) : 0, ay, h, full] as const;
}
function page(lang: Lang, title: string, body: string, token: string) {
  const t = TXT[lang], dir = lang === "ur" ? "rtl" : "ltr";
  return `<!doctype html><html dir="${dir}"><body style="margin:0;background:#f1f4ee;font-family:Arial,sans-serif;color:#17271f">
  <div style="max-width:520px;margin:0 auto;padding:24px 16px"><div style="background:#0f4535;color:#fbf6ea;border-radius:16px 16px 0 0;padding:20px 24px;font-size:22px;font-family:Georgia,serif">Deen Diary</div>
  <div style="background:#fff;border-radius:0 0 16px 16px;padding:24px;line-height:1.6"><h2 style="margin:0 0 12px;font-size:18px">${title}</h2>${body}
  <p style="color:#b07d1a;font-style:italic;margin-top:20px">${t.verse}</p>
  <p><a href="${SITE}" style="display:inline-block;background:#17604a;color:#fff;text-decoration:none;padding:10px 18px;border-radius:10px">${t.open}</a></p></div>
  <p style="font-size:12px;color:#5f6e66;text-align:center"><a href="${FN_URL}?unsubscribe=${token}" style="color:#5f6e66">${t.unsub}</a></p></div></body></html>`;
}
// ---- Firebase Cloud Messaging (HTTP v1) ----
let fcmCache: { token: string; exp: number } | null = null;
const b64url = (b: ArrayBuffer | string) => btoa(typeof b === "string" ? b : String.fromCharCode(...new Uint8Array(b))).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
async function fcmAccessToken() {
  if (fcmCache && fcmCache.exp > Date.now() + 60e3) return fcmCache.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({ iss: FCM_SA.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }));
  const pem = FCM_SA.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const key = await crypto.subtle.importKey("pkcs8", Uint8Array.from(atob(pem), (c) => c.charCodeAt(0)), { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${head}.${claim}`));
  const r = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${head}.${claim}.${b64url(sig)}` });
  const j = await r.json(); if (!j.access_token) throw new Error("FCM auth failed");
  fcmCache = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 }; return fcmCache.token;
}
async function pushTo(user_id: string, title: string, body: string) {
  if (!FCM_SA) return 0;
  const { data: toks } = await db.from("device_tokens").select("token").eq("user_id", user_id);
  if (!toks?.length) return 0;
  const access = await fcmAccessToken(); let n = 0;
  for (const { token } of toks) {
    const r = await fetch(`https://fcm.googleapis.com/v1/projects/${FCM_SA.project_id}/messages:send`, { method: "POST",
      headers: { Authorization: `Bearer ${access}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: { token, notification: { title: "Deen Diary", body: `${title}${body ? " — " + body : ""}`.slice(0, 240) } } }) });
    if (r.ok) n++; else if (r.status === 404 || r.status === 400) await db.from("device_tokens").delete().eq("token", token); // app removed or token expired
  }
  return n;
}

async function send(to: string, subject: string, html: string, unsubToken = "") {
  if (!RESEND) throw new Error("RESEND_API_KEY is not set");
  const text = html.replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|li|h2|div)>/g, "\n").replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const headers = unsubToken ? { "List-Unsubscribe": `<${FN_URL}?unsubscribe=${unsubToken}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined;
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to, subject, html, text, headers }) });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}
// claim the (user, kind, day) slot first so two runs can never send the same email twice; release it if sending fails
async function sendOnce(user_id: string, kind: string, day: string, title: string, body: string, to: string, html: string, ch: { email: boolean; push: boolean }, unsub = "") {
  if (!ch.email && !ch.push) return 0;
  const { error } = await db.from("notification_log").insert({ user_id, kind, day, title, body, channel: [ch.email && "email", ch.push && "push"].filter(Boolean).join("+") });
  if (error) return 0;
  try { let n = 0; if (ch.push) n += await pushTo(user_id, title, body); if (ch.email) { await send(to, title, html, unsub); n++; } return n ? 1 : 0; }
  catch (e) { await db.from("notification_log").delete().match({ user_id, kind, day }); throw e; }
}

Deno.serve(async (req) => {
  const url = new URL(req.url), tok = url.searchParams.get("unsubscribe"); // GET link in the email or one-click POST from the mail app
  if (tok) {
    await db.from("notification_prefs").update({ email_on: false, weekly: false, inactivity: false, updated_at: new Date().toISOString() }).eq("unsub_token", tok);
    return new Response("<p style='font-family:sans-serif'>You will no longer receive Deen Diary emails. You can turn them back on in the app under Profile.</p>", { headers: { "Content-Type": "text/html" } });
  }
  if (req.headers.get("Authorization") !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) return new Response("forbidden", { status: 403 });

  const { data: prefRows } = await db.from("notification_prefs").select("*");
  const { data: users } = await db.from("user_data").select("user_id");
  const byUser = new Map((prefRows ?? []).map((r: any) => [r.user_id, r]));
  const ids = new Set([...(users ?? []).map((u: any) => u.user_id), ...byUser.keys()]);
  const DEF = { email_on: false, daily_hour: 20, tz: "Asia/Karachi", cats: { quran: true, azkar: true, habits: true, learning: true }, weekly: false, weekly_day: 5, inactivity: true, quiet_from: 22, quiet_to: 6, push_on: true, unsub_token: "", last_seen: null };
  let sent = 0; const errors: string[] = [];
  for (const id of ids) {
    const p: any = { ...DEF, ...(byUser.get(id) ?? {}), user_id: id };
    if (!p.unsub_token) { const { data: c } = await db.from("notification_prefs").upsert({ user_id: id }, { onConflict: "user_id" }).select("unsub_token").single(); p.unsub_token = c?.unsub_token ?? ""; }
    try {
      const { data: u } = await db.auth.admin.getUserById(p.user_id);
      const user = u?.user; if (!user?.email || !user.email_confirmed_at || (user.banned_until && new Date(user.banned_until) > new Date())) continue;
      const { data: row } = await db.from("user_data").select("data,updated_at").eq("user_id", p.user_id).maybeSingle();
      const data = row?.data ?? {}, lang: Lang = (["en", "roman", "ur"].includes(data.lang) ? data.lang : "en"), t = TXT[lang];
      const now = local(p.tz || "Asia/Karachi");
      if (inQuiet(now.hour, p.quiet_from, p.quiet_to)) continue;

      const push = p.push_on !== false && !!FCM_SA;
      if ((p.email_on || push) && now.hour === p.daily_hour) {
        const items = openItems(data, now.date, p.cats ?? {});
        if (items.length) {
          const list = items.map((i) => `<li>${(t.items as any)[i]}</li>`).join("");
          sent += await sendOnce(p.user_id, "daily", now.date, t.dailyTitle, items.map((i) => (t.items as any)[i]).join(", "), user.email,
            page(lang, t.dailyTitle, `<p>${t.dailyIntro}</p><ul>${list}</ul>`, p.unsub_token), { email: p.email_on, push }, p.unsub_token);
        }
      }
      if (p.weekly && now.weekday === p.weekly_day && now.hour === p.daily_hour) {
        const [pr, ay, h, f] = weekStats(data, now.date), body = t.week(pr, ay, h, f);
        sent += await sendOnce(p.user_id, "weekly", now.date, t.weeklyTitle, body.replace(/<br>/g, " · "), user.email, page(lang, t.weeklyTitle, `<p>${body}</p>`, p.unsub_token), { email: true, push }, p.unsub_token);
      }
      const seen = [row?.updated_at, p.last_seen].filter(Boolean).map((x: string) => new Date(x).getTime());
      const lastActive = seen.length ? Math.max(...seen) : 0;
      if (p.inactivity && lastActive && Date.now() - lastActive >= 24 * 3600e3) {
        const periods = Math.floor((Date.now() - lastActive) / (24 * 3600e3));          // 1, 2, 3 … full days away
        const slot = new Date(lastActive + periods * 24 * 3600e3).toISOString().slice(0, 10); // one email per 24-hour period
        const ay = AYAT[(periods + p.user_id.charCodeAt(0)) % AYAT.length];
        const ayHtml = `<div style="background:#f8eed8;border-radius:12px;padding:16px;margin:16px 0"><div style="font-size:12px;color:#b07d1a;text-transform:uppercase;letter-spacing:.05em">${t.ayahHead}</div>
          <p dir="rtl" style="font-family:'Amiri','Traditional Arabic',serif;font-size:22px;line-height:2;margin:8px 0;text-align:right;color:#0f4535">${ay.ar}</p>
          <p style="margin:0" ${lang === "ur" ? 'dir="rtl"' : ""}>“${ay[lang]}”</p><p style="margin:6px 0 0;font-size:12px;color:#5f6e66">Quran ${ay.ref} · ${TRANSLATOR[lang]}</p></div>`;
        sent += await sendOnce(p.user_id, "inactive", slot, t.inactiveTitle, `${t.inactiveBody} (Quran ${ay.ref})`, user.email,
          page(lang, t.inactiveTitle, `<p>${t.inactiveBody}</p>${ayHtml}`, p.unsub_token), { email: true, push }, p.unsub_token);
      }
    } catch (e) { errors.push(String(e)); }
  }
  return Response.json({ sent, errors: errors.slice(0, 20) });
});
