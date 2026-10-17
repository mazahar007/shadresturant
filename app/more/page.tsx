'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';

const MODULES = [
  { href: '/', name: 'ড্যাশবোর্ড', icon: '📊', desc: 'হিসাবের সারসংক্ষেপ + ক্যালেন্ডার' },
  { href: '/pos', name: 'POS বিক্রি', icon: '🛒', desc: 'কার্ট দিয়ে দ্রুত বিক্রি' },
  { href: '/calendar', name: 'তারিখ ক্যালেন্ডার', icon: '📅', desc: 'তারিখে ক্লিক করে দিনের হিসাব' },
  { href: '/sales', name: 'বিক্রি লিস্ট', icon: '🧾', desc: 'সব বিক্রির তালিকা' },
  { href: '/products', name: 'মেনু / প্রোডাক্ট', icon: '🍛', desc: 'প্রোডাক্ট যোগ/এডিট/ডিলিট' },
  { href: '/expenses', name: 'খরচ', icon: '💸', desc: 'দৈনিক খরচের হিসাব' },
  { href: '/stock', name: 'স্টক ও মেয়াদ', icon: '📦', desc: 'স্টক অ্যাডজাস্ট + মেয়াদ সতর্কতা' },
  { href: '/baki', name: 'বাকি খাতা', icon: '📒', desc: 'বাকি আদায়ের হিসাব' },
  { href: '/report', name: 'লাভ-লোকসান', icon: '💰', desc: 'P&L + প্রোডাক্ট লাভ' },
  { href: '/backup', name: 'ব্যাকআপ', icon: '📥', desc: 'JSON ব্যাকআপ ডাউনলোড' },
  { href: '/hosting', name: 'Vercel Deploy', icon: '🚀', desc: 'ডেপ্লয় গাইড' },
];

export default function MorePage() {
  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  }
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg">☰ সব মডিউল</h2>
      <div className="grid gap-3">
        {MODULES.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow transition"
          >
            <span className="text-3xl">{m.icon}</span>
            <div>
              <div className="font-bold">{m.name}</div>
              <div className="text-xs text-slate-500">{m.desc}</div>
            </div>
            <span className="ml-auto text-slate-300">›</span>
          </Link>
        ))}
        <button
          onClick={logout}
          className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 text-left"
        >
          <span className="text-3xl">🚪</span>
          <div>
            <div className="font-bold text-red-700">লগআউট</div>
            <div className="text-xs text-slate-500">সেশন শেষ করে লগইন পেজে যান</div>
          </div>
        </button>
      </div>
    </div>
  );
}
