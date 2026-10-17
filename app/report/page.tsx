'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import { useDateFilter } from '@/lib/useDateFilter';
import type { Sale, Expense, Product } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

interface ProfitRow {
  name: string;
  emoji: string;
  qty: number;
  revenue: number;
  cost: number;
  profit: number;
}

export default function ReportPage() {
  const f = useDateFilter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { from, to } = f.range;

  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const q = from && to ? `?from=${from}&to=${to}` : '';
        const [s, e, p] = await Promise.all([
          fetch('/api/sales' + q),
          fetch('/api/expenses' + q),
          fetch('/api/products'),
        ]);
        const sj = await s.json();
        const ej = await e.json();
        const pj = await p.json();
        if (live && s.ok && e.ok && p.ok) {
          setSales(sj.sales);
          setExpenses(ej.expenses);
          setProducts(pj.products);
        }
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [from, to]);

  const totalSales = sales.reduce((a, s) => a + num(s.total), 0);
  const totalExp = expenses.reduce((a, e) => a + num(e.amount), 0);
  const net = totalSales - totalExp;

  const rows = useMemo<ProfitRow[]>(() => {
    const buyOf = new Map<number, number>();
    const prodOf = new Map<number, Product>();
    products.forEach((p) => {
      buyOf.set(p.id, num(p.buy));
      prodOf.set(p.id, p);
    });
    const m = new Map<string, ProfitRow>();
    sales.forEach((s) =>
      (s.items || []).forEach((i) => {
        const key = i.product_id != null ? `p:${i.product_id}` : `n:${i.name}`;
        const buy = i.product_id != null ? buyOf.get(i.product_id) ?? 0 : 0;
        const prod = i.product_id != null ? prodOf.get(i.product_id) : undefined;
        const qty = num(i.qty);
        const revenue = qty * num(i.price);
        const cost = qty * buy;
        const cur = m.get(key) || {
          name: prod?.name || i.name,
          emoji: prod?.emoji || '',
          qty: 0,
          revenue: 0,
          cost: 0,
          profit: 0,
        };
        cur.qty += qty;
        cur.revenue += revenue;
        cur.cost += cost;
        cur.profit += revenue - cost;
        m.set(key, cur);
      }),
    );
    return [...m.values()].sort((a, b) => b.profit - a.profit);
  }, [sales, products]);

  const grossProfit = rows.reduce((a, r) => a + r.profit, 0);

  return (
    <>
      <TopFilterBar />
      {loading ? (
        <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div className="bg-white rounded-2xl p-4 border">
              <div className="text-xs text-slate-500">📅 {f.label} - মোট বিক্রি</div>
              <div className="text-2xl font-bold text-emerald-700">{totalSales}৳</div>
              <div className="text-[11px]">{sales.length} টি বিক্রি</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border">
              <div className="text-xs text-slate-500">মোট খরচ</div>
              <div className="text-2xl font-bold text-red-600">{totalExp}৳</div>
              <div className="text-[11px]">{expenses.length} টি খরচ</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border">
              <div className="text-xs text-slate-500">গ্রস লাভ (প্রোডাক্ট)</div>
              <div className="text-2xl font-bold text-blue-700">{grossProfit}৳</div>
              <div className="text-[11px]">বিক্রি − কেনা দাম</div>
            </div>
            <div className="bg-white rounded-2xl p-4 border">
              <div className="text-xs text-slate-500">নেট লাভ</div>
              <div className={`text-2xl font-bold ${net >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>{net}৳</div>
              <div className="text-[11px]">বিক্রি − খরচ</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="p-4 border-b">
              <h3 className="font-bold">💰 প্রোডাক্ট অনুযায়ী গ্রস লাভ</h3>
              <div className="text-xs text-slate-500 mt-1">💡 (বিক্রি দাম − কেনা দাম) × পরিমাণ</div>
            </div>
            {rows.length === 0 ? (
              <div className="text-center py-16 text-slate-400">কোনো বিক্রি নেই</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs">
                    <tr>
                      <th className="p-3 text-left">প্রোডাক্ট</th>
                      <th className="p-3">বিক্রি (পিস)</th>
                      <th className="p-3">রেভিনিউ</th>
                      <th className="p-3">কেনা খরচ</th>
                      <th className="p-3">গ্রস লাভ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-slate-50">
                        <td className="p-3 font-medium">{r.emoji} {r.name}</td>
                        <td className="p-3">{r.qty}</td>
                        <td className="p-3">{r.revenue}৳</td>
                        <td className="p-3">{r.cost}৳</td>
                        <td className={`p-3 font-bold ${r.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                          {r.profit}৳
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-slate-50 font-bold">
                      <td className="p-3">মোট</td>
                      <td className="p-3">{rows.reduce((a, r) => a + r.qty, 0)}</td>
                      <td className="p-3">{rows.reduce((a, r) => a + r.revenue, 0)}৳</td>
                      <td className="p-3">{rows.reduce((a, r) => a + r.cost, 0)}৳</td>
                      <td className="p-3 text-emerald-700">{grossProfit}৳</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
