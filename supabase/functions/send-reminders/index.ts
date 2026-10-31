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
const TXT = {
  en: {
    dailyTitle: "Your goals for today are waiting",
    dailyIntro: "A gentle reminder of what is still open today:",
    weeklyTitle: "Your week in Deen Diary",
    inactiveTitle: "Your garden is waiting for you 🌿",
    inactiveBody: "Take a few minutes today for Quran and the remembrance of Allah. Small, steady steps matter.",
    open: "Open Deen Diary", unsub: "Turn off these emails",
    items: { quran: "Quran goal", taj: "Tajweed practice", taf: "Tafseer study", tar: "Tarjuma", read: "Quran reading", azkarM: "Morning azkar", azkarE: "Evening azkar", habits: "Daily routine", learning: "Study time" },
    week: (p: number, a: number, h: number, f: number) => `Prayers recorded: ${p}%<br>Ayat translated: ${a}<br>Routine tasks done: ${h}<br>Full days (garden): ${f}`,
    verse: "“Indeed, with hardship comes ease.” — Quran 94:6",
  },
  roman: {
    dailyTitle: "Aaj ke goals aap ka intezar kar rahe hain",
    dailyIntro: "Aaj ke yeh kaam abhi baqi hain:",
    weeklyTitle: "Deen Diary mein aap ka hafta",
    inactiveTitle: "Aap ka garden aap ka intezar kar raha hai 🌿",
    inactiveBody: "Aaj thoda waqt Quran aur Allah ki yaad ke liye nikalein. Chhote magar musalsal qadam ahem hain.",
    open: "Deen Diary kholein", unsub: "Yeh emails band karein",
    items: { quran: "Quran ka goal", taj: "Tajweed ki mashq", taf: "Tafseer ka mutala", tar: "Tarjuma", read: "Quran tilawat", azkarM: "Subah ke azkar", azkarE: "Shaam ke azkar", habits: "Rozana kaam", learning: "Mutale ka waqt" },
    week: (p: number, a: number, h: number, f: number) => `Namaz: ${p}%<br>Tarjuma ki ayat: ${a}<br>Rozana kaam: ${h}<br>Mukammal din (garden): ${f}`,
    verse: "“Beshak tangi ke saath farakhi bhi hai.” — Quran 94:6",
  },
  ur: {
    dailyTitle: "آج کے اہداف آپ کے منتظر ہیں",
    dailyIntro: "آج کے یہ کام ابھی باقی ہیں:",
    weeklyTitle: "دین ڈائری میں آپ کا ہفتہ",
    inactiveTitle: "آپ کا باغ آپ کا منتظر ہے 🌿",
    inactiveBody: "آج تھوڑا وقت قرآن اور اللہ کی یاد کے لیے نکالیں۔ چھوٹے مگر مسلسل قدم اہم ہیں۔",
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

async function send(to: string, subject: string, html: string) {
  if (!RESEND) throw new Error("RESEND_API_KEY is not set");
  const r = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${RESEND}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: FROM, to, subject, html }) });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}
// claim the (user, kind, day) slot first so two runs can never send the same email twice; release it if sending fails
async function sendOnce(user_id: string, kind: string, day: string, title: string, body: string, to: string, html: string, ch: { email: boolean; push: boolean }) {
  if (!ch.email && !ch.push) return 0;
  const { error } = await db.from("notification_log").insert({ user_id, kind, day, title, body, channel: [ch.email && "email", ch.push && "push"].filter(Boolean).join("+") });
  if (error) return 0;
  try { let n = 0; if (ch.push) n += await pushTo(user_id, title, body); if (ch.email) { await send(to, title, html); n++; } return n ? 1 : 0; }
  catch (e) { await db.from("notification_log").delete().match({ user_id, kind, day }); throw e; }
}

Deno.serve(async (req) => {
  const url = new URL(req.url), tok = url.searchParams.get("unsubscribe");
  if (tok) {
    await db.from("notification_prefs").update({ email_on: false, weekly: false, inactivity: false, updated_at: new Date().toISOString() }).eq("unsub_token", tok);
    return new Response("<p style='font-family:sans-serif'>You will no longer receive Deen Diary emails. You can turn them back on in the app under Profile.</p>", { headers: { "Content-Type": "text/html" } });
  }
  if (req.headers.get("Authorization") !== `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`) return new Response("forbidden", { status: 403 });

  const { data: prefs } = await db.from("notification_prefs").select("*").or("email_on.eq.true,weekly.eq.true,inactivity.eq.true,push_on.eq.true");
  let sent = 0; const errors: string[] = [];
  for (const p of prefs ?? []) {
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
            page(lang, t.dailyTitle, `<p>${t.dailyIntro}</p><ul>${list}</ul>`, p.unsub_token), { email: p.email_on, push });
        }
      }
      if (p.weekly && now.weekday === p.weekly_day && now.hour === p.daily_hour) {
        const [pr, ay, h, f] = weekStats(data, now.date), body = t.week(pr, ay, h, f);
        sent += await sendOnce(p.user_id, "weekly", now.date, t.weeklyTitle, body.replace(/<br>/g, " · "), user.email, page(lang, t.weeklyTitle, `<p>${body}</p>`, p.unsub_token), { email: true, push });
      }
      if (p.inactivity && row?.updated_at && Date.now() - new Date(row.updated_at).getTime() > 24 * 3600e3) {
        const since = row.updated_at.slice(0, 10); // at most one note per period of inactivity
        sent += await sendOnce(p.user_id, "inactive", since, t.inactiveTitle, t.inactiveBody, user.email, page(lang, t.inactiveTitle, `<p>${t.inactiveBody}</p>`, p.unsub_token), { email: true, push });
      }
    } catch (e) { errors.push(String(e)); }
  }
  return Response.json({ sent, errors: errors.slice(0, 20) });
});
