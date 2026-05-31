# Publishing Clarity360 to Google Play Store

## Method: TWA (Trusted Web Activity)

A TWA wraps your PWA into an Android app. It's the official Google-recommended way to put a web app on the Play Store.

---

## Prerequisites

1. ✅ App deployed to Vercel (or any HTTPS URL)
2. ✅ PWA manifest.json configured (already done)
3. ✅ Service worker registered (already done)
4. 💳 Google Play Developer account ($25 one-time fee) — https://play.google.com/console

---

## Step 1: Deploy to Vercel

```bash
cd productivity-tracker
vercel --prod
```

Note your production URL (e.g., `https://clarity360.vercel.app`)

---

## Step 2: Generate Android App using PWABuilder

1. Go to https://www.pwabuilder.com
2. Enter your deployed URL
3. Click "Package for stores" → Select "Android"
4. It generates a signed APK/AAB file
5. Download the package

**OR use Bubblewrap CLI:**

```bash
npm install -g @nicedoc/nicedoc.io
npx @nicedoc/nicedoc.io init --manifest https://your-url.vercel.app/manifest.json
npx @nicedoc/nicedoc.io build
```

---

## Step 3: Digital Asset Links (Verify ownership)

After PWABuilder generates your app, it gives you a `assetlinks.json` file.

Place it at: `public/.well-known/assetlinks.json`

This proves to Google that your website and app are owned by the same person.

---

## Step 4: Upload to Play Store

1. Go to https://play.google.com/console
2. Create a new app
3. Fill in:
   - App name: **Clarity360**
   - Category: **Productivity**
   - Description: "Your complete productivity tracking system. Track daily tasks, goals, habits, gym workouts, and life planning."
4. Upload the AAB file from PWABuilder
5. Add screenshots (take from your deployed app)
6. Submit for review

---

## Step 5: App Store Listing Details

**Title:** Clarity360 - Productivity Tracker

**Short description:** Track daily tasks, goals, habits, gym & life planning

**Full description:**
Clarity360 is your all-in-one productivity system:
• Daily task tracking with templates
• Weekly & monthly goal planning
• 21/90/100 day habit streaks
• Gym workout templates (Beginner to Pro)
• Life goals with custom timelines
• Calendar heatmap view
• Analytics & insights
• Motivational quotes
• Share streaks on WhatsApp & Instagram
• Dark mode
• Works offline
• Data backup to email

**Category:** Productivity
**Tags:** productivity, habits, goals, gym, tracker, daily planner

---

## Timeline

- PWABuilder packaging: 5 minutes
- Play Store review: 1-3 days (first time can take up to 7 days)
- Total: Your app can be live in under a week

---

## Cost

- Google Play Developer account: $25 (one-time, lifetime)
- Vercel hosting: Free (hobby plan)
- Total: $25

---

## For iOS App Store

For iOS, you'd need:
- Apple Developer account ($99/year)
- Use PWABuilder iOS package OR wrap in a WKWebView using Xcode
- Submit to App Store (stricter review)

Alternatively, iOS users can just "Add to Home Screen" from Safari — works identically to a native app.
