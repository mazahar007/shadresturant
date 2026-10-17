'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setIsDemo(!!d?.demo))
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(d?.error || 'লগইন ব্যর্থ হয়েছে');
        return;
      }
      router.push(searchParams.get('next') || '/');
      router.refresh();
    } catch {
      setError('সার্ভারে পৌঁছানো যাচ্ছে না');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-[#0f172a] text-white rounded-[24px] p-8 shadow-xl">
          <div className="text-center">
            <div className="text-5xl mb-3">🍛</div>
            <div className="font-bold text-xl">আল-মদিনা ফুড</div>
            <div className="text-xs opacity-60 mt-1">POS অ্যাডমিন লগইন</div>
          </div>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs opacity-70">পাসকোড</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••"
                autoFocus
                className="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] focus:outline-none focus:border-emerald-400 placeholder:text-white/30"
              />
            </div>
            {error && (
              <div className="bg-red-500/20 border border-red-400/40 text-red-200 text-sm rounded-xl px-3 py-2 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading || !passcode}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl py-3 font-bold transition"
            >
              {loading ? 'যাচাই হচ্ছে…' : '🔓 ভেতরে ঢুকুন'}
            </button>
          </form>
          {isDemo && (
            <div className="mt-4 text-[11px] bg-amber-500/20 border border-amber-400/40 text-amber-200 rounded-xl p-3 text-center">
              🎭 ডেমো মোড — পাসকোড: <b className="tracking-widest">1234</b>
              <br />
              আসল সাইটে নিজের পাসকোড সেট করুন (ADMIN_PASSCODE)
            </div>
          )}
        </div>
        <div className="text-center text-[11px] text-slate-400 mt-4">
          পাসকোড ভুলে গেলে Vercel → Environment Variables এ ADMIN_PASSCODE বদলে redeploy করুন
        </div>
      </div>
    </div>
  );
}
