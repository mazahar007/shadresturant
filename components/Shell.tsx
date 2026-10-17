'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

const MENUS = [
  { href: '/', name: 'ড্যাশবোর্ড', icon: '📊' },
  { href: '/pos', name: 'POS বিক্রি', icon: '🛒' },
  { href: '/calendar', name: '📅 তারিখ ক্যালেন্ডার', icon: '📅' },
  { href: '/sales', name: 'বিক্রি লিস্ট', icon: '🧾' },
  { href: '/products', name: 'মেনু / প্রোডাক্ট', icon: '🍛' },
  { href: '/expenses', name: 'খরচ', icon: '💸' },
  { href: '/stock', name: 'স্টক ও মেয়াদ', icon: '📦' },
  { href: '/baki', name: 'বাকি খাতা', icon: '📒' },
  { href: '/report', name: 'লাভ-লোকসান', icon: '💰' },
  { href: '/backup', name: 'ব্যাকআপ', icon: '📥' },
  { href: '/hosting', name: '🌐 Vercel Deploy', icon: '🚀' },
];

const MOBILE_TABS = [
  { href: '/', name: 'ড্যাশ', icon: '📊' },
  { href: '/pos', name: 'POS', icon: '🛒' },
  { href: '/calendar', name: 'তারিখ', icon: '📅' },
  { href: '/sales', name: 'বিক্রি', icon: '🧾' },
  { href: '/more', name: 'আরো', icon: '☰' },
];

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
}

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isDemo, setIsDemo] = useState(false);
  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setIsDemo(!!d?.demo))
      .catch(() => {});
  }, []);

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    window.location.href = '/login';
  }
  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[260px] bg-[#0f172a] text-white flex-col fixed h-full z-30">
        <div className="p-5 border-b border-white/10">
          <div className="font-bold text-lg">🍛 আল-মদিনা ফুড</div>
          <div className="text-[11px] opacity-60">POS + Date Click + Vercel Ready</div>
          {isDemo && (
            <div className="mt-2 text-[10px] bg-amber-500 text-slate-900 font-bold rounded-full px-2 py-1 inline-block">
              🎭 ডেমো মোড — ডেটা সেভ থাকবে না
            </div>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {MENUS.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`w-full flex gap-3 px-4 py-3 rounded-xl text-sm text-left ${
                isActive(pathname, m.href)
                  ? 'bg-white text-slate-900 font-bold'
                  : 'hover:bg-white/10 text-white/80'
              }`}
            >
              <span>{m.icon}</span>
              {m.name}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 space-y-2">
          <Link
            href="/backup"
            className="block text-center w-full bg-white/10 hover:bg-white/20 rounded-xl py-2 text-xs"
          >
            📥 ব্যাকআপ
          </Link>
          <button
            onClick={logout}
            className="block text-center w-full bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl py-2 text-xs"
          >
            🚪 লগআউট
          </button>
          <div className="text-[10px] opacity-40 mt-2 text-center">Vercel Deploy Ready</div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 md:ml-[260px] flex flex-col min-w-0">
        {isDemo && (
          <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-xs text-center px-3 py-2">
            🎭 <b>ডেমো মোড</b> — স্যাম্পল ডেটা দিয়ে চলছে। যা যোগ/বদলাবেন তা সার্ভার রিস্টার্ট হলে মুছে যাবে। আসল ব্যবহারে Supabase কানেক্ট করুন।
          </div>
        )}
        <div className="flex-1 p-3 md:p-5 pb-20 md:pb-5">{children}</div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden bg-white border-t grid grid-cols-5 text-[10px] fixed bottom-0 left-0 right-0 z-30">
          {MOBILE_TABS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`py-2 flex flex-col items-center ${
                isActive(pathname, t.href) ? 'text-emerald-700 font-bold' : 'text-slate-600'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              {t.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
