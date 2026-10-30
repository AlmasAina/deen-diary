# Deen Diary: store listing and release checklist

## App details
- **App name:** Deen Diary
- **Package / bundle ID:** com.deendiary.app
- **Category:** Lifestyle (alternative: Education)
- **Content rating:** Everyone. No user-to-user chat, no ads, no purchases.
- **Privacy policy URL:** https://almasaina.github.io/deen-diary/privacy.html
- **Website:** https://almasaina.github.io/deen-diary/

## Short description (Play Store, max 80 characters)
Prayer, Quran and dhikr tracker with a garden that grows as you stay consistent.

## Full description
Deen Diary is a calm companion for building daily Islamic habits.

• Prayer tracker: mark each of the five prayers as on time or qaza, with prayer times for your city.
• Quran journey: set your own daily target for reading, tajweed, tafseer and tarjuma, by ayah or by ruku. The app remembers exactly where you stopped.
• Revision: choose how often to revise what you learned.
• Azkar: morning, evening, after-salah, sleep and waking azkar from Hisn al-Muslim, with counters.
• Tasbeeh and durood counter with daily targets.
• Seerat and Islamic literature: add your own topics and daily time goals.
• Knowledge Journey: over 1,000 multiple-choice questions on the Quran, seerah, the Sahabah and the Prophets, with explanations and sources. One new question every two days.
• Garden and house: every full day helps your garden grow, from the first flowers to a house with a reading corner. Nothing you earn is taken away.
• Journal: private reflections, gratitude, duas and goals.
• Ramadan mode: fasts, suhoor, iftar, taraweeh and charity.
• Calendar and reports: Hijri dates, streaks and weekly and monthly progress.
• English, Urdu and Roman Urdu.
• Works offline and syncs to your account when you're online.

Points, streaks and the garden are motivation only. They do not measure anyone's faith or worship.

## Keywords (App Store, max 100 characters)
namaz,salah,quran,tracker,prayer times,azkar,dhikr,tasbeeh,islamic,ramadan,habit,urdu

## Data safety (Play Console) / App privacy (App Store)
| Data | Collected | Purpose | Shared |
|---|---|---|---|
| Name, email | Yes | Account and sign-in | No |
| Gender | Yes | Show optional features such as period tracking | No |
| Health: period days (optional) | Only if the user turns it on | App functionality | No |
| App activity: prayers, Quran progress, quiz answers, journal | Yes | App functionality and sync | No |
| Approximate location | Only if the user taps "Use my location" | Prayer times; not stored on the server beyond the saved coordinates | No |

- Data is encrypted in transit (HTTPS) and stored in Supabase with row-level security.
- Users can delete their account and all data from Profile → Delete account.
- No ads, no tracking, no data sold.

## Screenshots needed
Phone screenshots (at least 2 for Play, 3 recommended; App Store needs 6.7" and 6.5" iPhone sizes):
1. Today page with prayer times and goals
2. Quran goals (ayah/ruku targets)
3. Garden with the house
4. Knowledge Journey question with explanation
5. Azkar reader
6. Calendar and report

Feature graphic for Play (1024 × 500): use `assets/splash.png` colours with the app name.

## Release steps
### Android (Google Play)
1. Create a Google Play developer account ($25 one-time).
2. Download the APK from GitHub → Actions → "Android APK" → latest run → Artifacts, and test it on a phone.
3. For the store you need a signed **release AAB**. Create an upload key once and add it as GitHub secrets; the workflow can then build `bundleRelease`.
4. Create the app in Play Console, fill in the listing above, data safety, content rating and target audience, upload the AAB to internal testing first.
5. New personal developer accounts must run a closed test with at least 12 testers for 14 days before production access.

### iOS (App Store)
1. Apple Developer Program ($99/year) and a Mac with Xcode are required.
2. On the Mac: `npm install`, `npm run build:www`, `npx cap add ios`, `npx capacitor-assets generate --ios`, `npx cap open ios`.
3. In Xcode set the team and bundle ID, archive, and upload to App Store Connect; test with TestFlight first.

Approval is decided by Google and Apple after review; the app is not published until both reviews pass.
