# 🍛 আল-মদিনা ফুড POS — সেটআপ গাইড (বাংলা)

Next.js 15 + Supabase দিয়ে তৈরি ফুড শপ POS। ডাটা Supabase ডাটাবেজে থাকে — ফোন, পিসি সব জায়গা থেকে একই হিসাব দেখা যাবে।

---

## ধাপ ১: Supabase প্রজেক্ট + ডাটাবেজ তৈরি

1. [supabase.com](https://supabase.com) এ যান → **Start your project** → লগইন/সাইন আপ করুন
2. **New project** → নাম দিন (যেমন `food-shop`), পাসওয়ার্ড দিন → **Create new project** (২-৩ মিনিট লাগতে পারে)
3. বাম মেনু থেকে **SQL Editor** → **New query**
4. এই প্রজেক্টের `supabase/schema.sql` ফাইলের **পুরো লেখা** কপি করে পেস্ট করুন → **Run** (▶️)
5. নিচে "Success" দেখালেই টেবিল + স্যাম্পল ডাটা তৈরি ✅
   - টেবিল: `products`, `sales`, `sale_items`, `expenses`
   - স্যাম্পল: ৬টা প্রোডাক্ট, ৫টা বিক্রি, ৩টা খরচ

## ধাপ ২: API Key সংগ্রহ

1. Supabase Dashboard → **Project Settings** (⚙️) → **API**
2. কপি করুন:
   - **Project URL** → এটা হবে `SUPABASE_URL`
   - **service_role** → **secret** key → এটা হবে `SUPABASE_SERVICE_ROLE_KEY`
3. ⚠️ `service_role` key গোপন রাখুন — কাউকে দেবেন না, পাবলিক কোডে বসাবেন না

## ধাপ ৩: GitHub-এ কোড আপলোড

1. [github.com](https://github.com) → **New repository** → নাম দিন (যেমন `food-shop-nextjs`) → **Create**
2. এই প্রজেক্ট ফোল্ডারের সব ফাইল আপলোড/push করুন (টার্মিনালে):
   ```bash
   cd food-shop-nextjs
   git init
   git add .
   git commit -m "food shop pos"
   git branch -M main
   git remote add origin https://github.com/আপনার-ইউজারনেম/food-shop-nextjs.git
   git push -u origin main
   ```
   > GitHub ওয়েবসাইট থেকেও drag & drop করে ফাইল আপলোড করা যায়।

## ধাপ ৪: Vercel-এ Deploy

1. [vercel.com](https://vercel.com) → লগইন → **Add New… → Project**
2. GitHub repository **Import** করুন
3. **Environment Variables** সেকশনে ৩টা যোগ করুন:
   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | ধাপ ২-এর Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | ধাপ ২-এর service_role key |
   | `ADMIN_PASSCODE` | আপনার পছন্দের গোপন পাসকোড (এটাই হবে লগইন পাসওয়ার্ড) |
4. **Deploy** চাপুন → ১-২ মিনিটে লাইভ লিংক পাবেন (যেমন `https://food-shop-nextjs.vercel.app`)
5. এই লিংক কখনো expire হয় না ✅
6. সাইট খুললে **লগইন পেজ** আসবে — `ADMIN_PASSCODE`-এ যা দিয়েছেন তাই দিয়ে ঢুকুন 🔐

> পরে কোড বদলে GitHub-এ push করলেই Vercel অটো নতুন করে deploy করে দেবে।

## ধাপ ৫: নিজের কম্পিউটারে চালানো (ঐচ্ছিক)

```bash
cd food-shop-nextjs
npm install
```

`.env.local` নামে ফাইল বানিয়ে ভেতরে লিখুন:

```
SUPABASE_URL=আপনার-project-url
SUPABASE_SERVICE_ROLE_KEY=আপনার-service-role-key
ADMIN_PASSCODE=আপনার-পছন্দের-পাসকোড
```

তারপর:

```bash
npm run dev
```

ব্রাউজারে খুলুন: [http://localhost:3000](http://localhost:3000)

---

## 🔧 সমস্যা সমাধান (Troubleshooting)

### "SUPABASE_URL বা SUPABASE_SERVICE_ROLE_KEY সেট করা নেই"
- Vercel → Project → **Settings → Environment Variables** — ২টা key ঠিকমতো বসানো আছে কিনা দেখুন
- নামে বানান ভুল হলে চলবে না — হুবহু `SUPABASE_URL` ও `SUPABASE_SERVICE_ROLE_KEY` হতে হবে
- Variable যোগ/বদলের পর **Redeploy** করুন (Deployments → ⋯ → Redeploy)

### পেজ ফাঁকা (blank) দেখাচ্ছে
- Vercel Deployments → লেটেস্ট deploy-এর **Logs** দেখুন — লাল error লাইন খুঁজুন
- বেশিরভাগ ক্ষেত্রে env variable-এর সমস্যা (উপরের পয়েন্ট দেখুন)

### "Failed to fetch" / ডাটা লোড হচ্ছে না
- Supabase প্রজেক্ট **pause** হয়ে গেছে কিনা দেখুন (ফ্রি প্ল্যানে ১ সপ্তাহ না খুললে pause হয়) → Dashboard থেকে **Restore** করুন
- `schema.sql` Run করা হয়েছিল কিনা যাচাই করুন: Supabase → **Table Editor**-এ ৪টা টেবিল দেখা যাওয়া উচিত

### RLS / permission error
- `schema.sql`-এর RLS policy অংশ আবার Run করুন
- লেখার কাজ (বিক্রি/খরচ যোগ) সব `/api/*` route দিয়ে `service_role` key-এ হয় — ব্রাউজার সরাসরি ডাটাবেজে লেখে না, তাই anon key দরকার নেই

### লোকাল `npm run dev`-এ error
- Node.js 18+ দরকার (`node --version` দিয়ে দেখুন)
- `node_modules` ডিলিট করে `npm install` আবার চালান

---

## 📁 ফাইল কাঠামো

```
food-shop-nextjs/
├── app/
│   ├── api/            # সার্ভার API (Supabase-এ শুধু এখান থেকে কথা বলে)
│   │   ├── sales/      # GET বিক্রি, POST নতুন বিক্রি, PATCH পরিশোধ
│   │   ├── products/   # GET/POST/PATCH/DELETE প্রোডাক্ট
│   │   ├── expenses/   # GET/POST/DELETE খরচ
│   │   └── backup/     # GET পুরো ডাটা JSON
│   ├── page.tsx        # ড্যাশবোর্ড
│   ├── pos/            # POS বিক্রি
│   ├── calendar/       # ফুল ক্যালেন্ডার
│   ├── sales/          # বিক্রি লিস্ট
│   ├── products/       # মেনু/প্রোডাক্ট
│   ├── expenses/       # খরচ
│   ├── stock/          # স্টক ও মেয়াদ
│   ├── baki/           # বাকি খাতা
│   ├── report/         # লাভ-লোকসান
│   ├── backup/         # ব্যাকআপ ডাউনলোড
│   ├── hosting/        # Vercel Deploy গাইড
│   └── more/           # মোবাইল "আরো" মেনু
├── components/         # Shell, TopFilterBar, StatCards, MonthCalendar
├── lib/                # dates (ঢাকা টাইমজোন), useDateFilter (URL ফিল্টার), supabaseAdmin
├── supabase/schema.sql # ডাটাবেজ স্কিমা + স্যাম্পল ডাটা
└── README-SETUP-BN.md  # এই ফাইল
```
