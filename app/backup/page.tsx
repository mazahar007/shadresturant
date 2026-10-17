'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { todayDhaka } from '@/lib/dates';

export default function BackupPage() {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<string | null>(null);

  const download = async () => {
    setBusy(true);
    setInfo(null);
    try {
      const r = await fetch('/api/backup');
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'ব্যাকআপ হয়নি');
      const blob = new Blob([JSON.stringify(j, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `food-shop-backup-${todayDhaka()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setInfo(`✅ ডাউনলোড হয়েছে: ${(j.products || []).length} প্রোডাক্ট, ${(j.sales || []).length} বিক্রি, ${(j.expenses || []).length} খরচ`);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'ব্যাকআপ হয়নি');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-[24px] p-6">
        <h2 className="text-2xl font-bold">📥 ব্যাকআপ ডাউনলোড</h2>
        <p className="mt-2 opacity-90">
          সব প্রোডাক্ট, বিক্রি (আইটেমসহ) ও খরচ এক JSON ফাইলে ডাউনলোড করুন
        </p>
      </div>
      <div className="bg-white rounded-2xl p-6 border text-center">
        <button
          onClick={download}
          disabled={busy}
          className="bg-slate-900 text-white rounded-xl px-8 py-3 font-bold disabled:opacity-40"
        >
          {busy ? 'তৈরি হচ্ছে…' : '📥 ব্যাকআপ ডাউনলোড'}
        </button>
        {info && (
          <div className="mt-4 text-sm bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3">
            {info}
          </div>
        )}
        <div className="mt-4 text-xs text-slate-500">
          💡 ফাইলের নাম হবে <span className="font-mono">food-shop-backup-{todayDhaka()}.json</span>
          <br />ডাটা Supabase ডাটাবেজে নিরাপদে থাকে — ব্যাকআপ শুধু অতিরিক্ত কপি হিসেবে রাখুন
        </div>
      </div>
    </div>
  );
}
