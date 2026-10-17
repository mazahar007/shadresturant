'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import { useDateFilter } from '@/lib/useDateFilter';
import type { Sale } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

export default function BakiPage() {
  const f = useDateFilter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { from, to } = f.range;

  const load = async () => {
    setLoading(true);
    const q = from && to ? `?from=${from}&to=${to}` : '';
    const r = await fetch('/api/sales' + q);
    const j = await r.json();
    if (r.ok) setSales(j.sales);
    setLoading(false);
  };
  useEffect(() => { load(); }, [from, to]);

  const dueSales = useMemo(() => sales.filter((s) => num(s.due) > 0), [sales]);

  const byCustomer = useMemo(() => {
    const m = new Map<string, number>();
    dueSales.forEach((s) => {
      const c = s.customer || 'নামহীন';
      m.set(c, (m.get(c) || 0) + num(s.due));
    });
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [dueSales]);

  const totalDue = dueSales.reduce((a, s) => a + num(s.due), 0);

  const markPaid = async (s: Sale) => {
    if (!confirm(`"${s.customer}" এর ${num(s.due)}৳ বাকি পরিশোধ হিসেবে চিহ্নিত করবেন?`)) return;
    const r = await fetch(`/api/sales/${s.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paid: num(s.total) }),
    });
    const j = await r.json();
    if (!r.ok) { alert(j?.error || 'আপডেট হয়নি'); return; }
    load();
  };

  return (
    <>
      <TopFilterBar />
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white rounded-2xl p-4 border">
          <div className="text-xs text-slate-500">মোট বাকি</div>
          <div className="text-2xl font-bold text-amber-600">{totalDue}৳</div>
          <div className="text-[11px]">{dueSales.length} টি বিক্রিতে বাকি</div>
        </div>
        <div className="bg-white rounded-2xl p-4 border md:col-span-2">
          <h4 className="font-bold text-sm mb-2">👥 কাস্টমার অনুযায়ী বাকি</h4>
          {byCustomer.length === 0 && <div className="text-xs text-slate-400">কোনো বাকি নেই</div>}
          <div className="space-y-1 max-h-[120px] overflow-y-auto">
            {byCustomer.map(([c, d]) => (
              <div key={c} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span>{c}</span>
                <span className="font-bold text-amber-600">{d}৳</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-bold">📒 বাকি খাতা ({dueSales.length})</h3>
        </div>
        {loading ? (
          <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
        ) : dueSales.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <div className="text-3xl mb-2">✅</div>সব পরিশোধিত — কোনো বাকি নেই
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs">
                <tr>
                  <th className="p-3 text-left">তারিখ</th>
                  <th className="p-3">টোকেন</th>
                  <th className="p-3">কাস্টমার</th>
                  <th className="p-3">মোট</th>
                  <th className="p-3">দিয়েছে</th>
                  <th className="p-3">বাকি</th>
                  <th className="p-3">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {dueSales.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-amber-50/50">
                    <td className="p-3">{s.date}</td>
                    <td className="p-3">{s.token}</td>
                    <td className="p-3 font-medium">{s.customer}</td>
                    <td className="p-3">{num(s.total)}৳</td>
                    <td className="p-3">{num(s.paid)}৳</td>
                    <td className="p-3 font-bold text-amber-600">{num(s.due)}৳</td>
                    <td className="p-3">
                      <button
                        onClick={() => markPaid(s)}
                        className="bg-emerald-600 text-white rounded-full px-3 py-1 text-xs"
                      >
                        ✅ পরিশোধ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
