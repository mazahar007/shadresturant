'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { todayDhaka, shiftDate } from '@/lib/dates';
import type { Product } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/products');
    const j = await r.json();
    if (r.ok) setProducts(j.products);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const adjust = async (p: Product, d: number) => {
    const next = num(p.stock) + d;
    if (next < 0) return;
    const r = await fetch(`/api/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: next }),
    });
    if (r.ok) load();
  };

  const warnDate = shiftDate(todayDhaka(), 3);

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-bold">📦 স্টক ও মেয়াদ ({products.length})</h3>
        <div className="text-xs text-slate-500 mt-1">💡 লো স্টক (&lt;50) লাল দেখাবে • মেয়াদ ৩ দিনের মধ্যে হলে সতর্কবার্তা</div>
      </div>
      {loading ? (
        <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <th className="p-3 text-left">প্রোডাক্ট</th>
                <th className="p-3">স্টক</th>
                <th className="p-3">মেয়াদ</th>
                <th className="p-3">সতর্কতা</th>
                <th className="p-3">অ্যাডজাস্ট</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const low = num(p.stock) < 50;
                const expiring = p.expiry && p.expiry <= warnDate;
                return (
                  <tr key={p.id} className={`border-t ${low ? 'bg-red-50/60' : ''}`}>
                    <td className="p-3 font-medium">{p.emoji} {p.name}</td>
                    <td className={`p-3 font-bold ${low ? 'text-red-600' : ''}`}>{num(p.stock)}</td>
                    <td className="p-3 text-xs">{p.expiry || '-'}</td>
                    <td className="p-3 text-xs">
                      {low && <span className="bg-red-100 text-red-700 rounded-full px-2 py-0.5 mr-1">⚠️ লো স্টক</span>}
                      {expiring && <span className="bg-amber-100 text-amber-700 rounded-full px-2 py-0.5">⏰ মেয়াদ কাছে</span>}
                      {!low && !expiring && <span className="text-slate-400">—</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <button onClick={() => adjust(p, -1)} className="w-7 h-7 bg-slate-100 rounded-full mr-1">−</button>
                      <button onClick={() => adjust(p, 1)} className="w-7 h-7 bg-slate-100 rounded-full mr-1">+</button>
                      <button onClick={() => adjust(p, 10)} className="px-2 h-7 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs">+10</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
