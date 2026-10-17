'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import { useDateFilter } from '@/lib/useDateFilter';
import { formatBn } from '@/lib/dates';
import type { Sale } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

export default function SalesPage() {
  const f = useDateFilter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const { from, to } = f.range;

  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const q = from && to ? `?from=${from}&to=${to}` : '';
        const r = await fetch('/api/sales' + q);
        const j = await r.json();
        if (live && r.ok) setSales(j.sales);
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [from, to]);

  return (
    <>
      <TopFilterBar />
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="font-bold">🧾 {f.label} - তারিখে ক্লিক করে ফিল্টার করুন ({sales.length})</h3>
          <div className="text-xs text-slate-500 mt-1">
            💡 নীল তারিখে ক্লিক করলেই ওই দিনের হিসাব দেখাবে
          </div>
        </div>
        {loading ? (
          <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
        ) : sales.length === 0 ? (
          <div className="text-center py-16 text-slate-400">কোনো বিক্রি নেই</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs">
                <tr>
                  <th className="p-3 text-left">📅 তারিখ (ক্লিক করুন)</th>
                  <th className="p-3">সময়</th>
                  <th className="p-3">টোকেন/টেবিল</th>
                  <th className="p-3">কাস্টমার</th>
                  <th className="p-3">আইটেম</th>
                  <th className="p-3">মোট</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-t hover:bg-emerald-50">
                    <td className="p-3">
                      <button
                        onClick={() => f.selectDate(s.date)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-bold"
                      >
                        📅 {s.date}
                      </button>
                      <div className="text-[11px] text-slate-500 mt-1">{formatBn(s.date)} - ক্লিক করুন</div>
                    </td>
                    <td className="p-3">{s.time}</td>
                    <td className="p-3">{s.token}{s.table_no ? ` / ${s.table_no}` : ''}</td>
                    <td className="p-3">{s.customer}</td>
                    <td className="p-3 text-xs text-slate-500">
                      {(s.items || []).map((i) => `${i.name} x${num(i.qty)}`).join(', ')}
                      {num(s.due) > 0 && <span className="text-amber-600 font-bold"> (বাকি {num(s.due)}৳)</span>}
                    </td>
                    <td className="p-3 font-bold">{num(s.total)}৳</td>
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
