'use client';

export const dynamic = 'force-dynamic';

export default function HostingPage() {
  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[24px] p-6">
        <h2 className="text-2xl font-bold">🌐 Vercel এ Deploy - পার্মানেন্ট লিংক</h2>
        <p className="mt-2 opacity-90">
          Facebook CDN লিংক expire হয়ে যায়, Vercel লিংক কখনো expire হয় না। ডাটা Supabase-এ, তাই
          যেকোনো ডিভাইস থেকে একই হিসাব দেখা যাবে।
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border">
          <h3 className="font-bold">⚡ Vercel Deploy ধাপ</h3>
          <ol className="text-sm mt-3 space-y-2 list-decimal pl-4 text-slate-600">
            <li>GitHub-এ নতুন repository বানিয়ে এই প্রজেক্টের ফাইল push করুন</li>
            <li>vercel.com → Add New… → Project → repository Import করুন</li>
            <li>
              Environment Variables-এ যোগ করুন:
              <div className="mt-1 font-mono text-xs bg-slate-900 text-emerald-300 rounded-xl p-3">
                SUPABASE_URL
                <br />
                SUPABASE_SERVICE_ROLE_KEY
              </div>
            </li>
            <li>Deploy → লিংক পাবেন, যেমন: https://food-shop.vercel.app</li>
            <li>এই লিংক কখনো ফাঁকা/expire দেখাবে না</li>
          </ol>
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs">
            ✅ Next.js + Supabase প্রোডাকশন সেটআপ — ডাটা ডাটাবেজে, তাই ফোন/পিসি দুটোতেই একই হিসাব
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border">
          <h3 className="font-bold">📅 তারিখ ফিচার কিভাবে কাজ করে</h3>
          <div className="text-sm mt-3 space-y-2 text-slate-600">
            <div>• ক্যালেন্ডারে ক্লিক → ওই দিনের হিসাব</div>
            <div>• তারিখ পিকার → নির্দিষ্ট তারিখ</div>
            <div>• রেঞ্জ → ২ তারিখের মধ্যে হিসাব</div>
            <div>• বিক্রি লিস্টে তারিখে ক্লিক → ফিল্টার</div>
          </div>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
            💡 তারিখে ক্লিক করলেই হিসাব — URL-এ ফিল্টার থাকে, তাই লিংক শেয়ার করলেও একই হিসাব খুলবে
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border">
        <h3 className="font-bold">🗄️ ডাটাবেজ (Supabase) সেটআপ — সংক্ষেপে</h3>
        <ol className="text-sm mt-3 space-y-2 list-decimal pl-4 text-slate-600">
          <li>supabase.com → New project</li>
          <li>SQL Editor → প্রজেক্টের <span className="font-mono">supabase/schema.sql</span> পেস্ট → Run</li>
          <li>Project Settings → API → Project URL ও <span className="font-mono">service_role</span> key কপি</li>
          <li>ওই দুটোই Vercel Environment Variables-এ বসান</li>
        </ol>
        <div className="mt-3 text-xs bg-slate-900 text-white rounded-xl p-3">
          ⚠️ <span className="font-mono">service_role</span> key কখনো ব্রাউজারে/পাবলিক কোডে দেবেন না — এটা শুধু
          সার্ভার (API routes) ব্যবহার করে।
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-5">
        <h3 className="font-bold">📖 বিস্তারিত গাইড</h3>
        <p className="text-sm opacity-80 mt-1">
          প্রজেক্ট ফোল্ডারের <span className="font-mono">README-SETUP-BN.md</span> ফাইলে বাংলায় ধাপে ধাপে পুরো
          সেটআপ লেখা আছে।
        </p>
      </div>
    </div>
  );
}
