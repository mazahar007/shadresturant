'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import StatCards from '@/components/StatCards';
import MonthCalendar from '@/components/MonthCalendar';
import { useDateFilter } from '@/lib/useDateFilter';
import { formatBn } from '@/lib/dates';
import type { Sale, Expense, Product } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

async function getJSON(url: string) {
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error || 'লোড করতে সমস্যা হয়েছে');
  return j;
}

export default function DashboardPage() {
  const f = useDateFilter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [daySales, setDaySales] = useState<Sale[]>([]);
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { from, to } = f.range;

  // Filtered range data (stats)
  useEffect(() => {
    let live = true;
    setLoading(true);
    (async () => {
      try {
        const q = from && to ? `?from=${from}&to=${to}` : '';
        const [s, e] = await Promise.all([getJSON('/api/sales' + q), getJSON('/api/expenses' + q)]);
        if (live) {
          setSales(s.sales);
          setExpenses(e.expenses);
        }
      } catch {
        /* keep previous */
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => { live = false; };
  }, [from, to]);

  // Selected date's sales (list)
  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const s = await getJSON(`/api/sales?from=${f.date}&to=${f.date}`);
        if (live) setDaySales(s.sales);
      } catch { /* noop */ }
    })();
    return () => { live = false; };
  }, [f.date]);

  // All sales (calendar map) + products — once
  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([getJSON('/api/sales'), getJSON('/api/products')]);
        setAllSales(s.sales);
        setProducts(p.products);
      } catch { /* noop */ }
    })();
  }, []);

  const salesByDate = useMemo(() => {
    const m: Record<string, number> = {};
    allSales.forEach((s) => { m[s.date] = (m[s.date] || 0) + num(s.total); });
    return m;
  }, [allSales]);

  const topSelling = useMemo(() => {
    const m = new Map<number, { name: string; emoji: string; qty: number }>();
    sales.forEach((s) =>
      (s.items || []).forEach((i) => {
        const key = i.product_id ?? -1;
        const cur = m.get(key) || { name: i.name, emoji: '', qty: 0 };
        const prod = products.find((p) => p.id === i.product_id);
        m.set(key, { name: prod?.name || i.name, emoji: prod?.emoji || '', qty: cur.qty + num(i.qty) });
      }),
    );
    return [...m.values()].sort((a, b) => b.qty - a.qty).slice(0, 3);
  }, [sales, products]);

  const lowStock = useMemo(() => products.filter((p) => num(p.stock) < 50), [products]);

  const dayTotal = daySales.reduce((a, s) => a + num(s.total), 0);
  const dayExp = expenses.filter((e) => e.date === f.date).reduce((a, e) => a + num(e.amount), 0);

  return (
    <>
      <TopFilterBar />
      {loading && sales.length === 0 ? (
        <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
      ) : (
        <>
          <StatCards sales={sales} expenses={expenses} label={f.label} />
          <div className="grid lg:grid-cols-3 gap-4">
            <MonthCalendar
              selectedDate={f.date}
              onSelect={f.selectDate}
              salesByDate={salesByDate}
              size="mini"
            />
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border">
              <h3 className="font-bold mb-3">
                📋 {formatBn(f.date)} এর বিক্রি ({daySales.length})
              </h3>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {daySales.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <div className="text-3xl mb-2">📅</div>
                    এই তারিখে কোনো বিক্রি নেই
                    <br />
                    <span className="text-xs">ক্যালেন্ডারে অন্য তারিখে ক্লিক করুন</span>
                  </div>
                )}
                {daySales.map((s) => (
                  <div
                    key={s.id}
                    className="flex justify-between bg-slate-50 rounded-xl p-3 hover:bg-emerald-50 cursor-pointer border hover:border-emerald-200"
                    onClick={() => f.selectDate(s.date)}
                  >
                    <div>
                      <div className="font-medium text-sm">
                        {s.time} - {s.token} - {s.customer} - টেবিল {s.table_no}
                      </div>
                      <div className="text-xs text-slate-500">
                        {(s.items || []).map((i) => i.name).join(', ')} •{' '}
                        <span className="text-blue-600 underline font-bold">📅 {s.date}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{num(s.total)}৳</div>
                      <div className="text-[11px] text-slate-500">{s.method}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border">
              <h4 className="font-bold text-sm mb-2">🔥 টপ বিক্রি</h4>
              {topSelling.length === 0 && <div className="text-xs text-slate-400">কোনো বিক্রি নেই</div>}
              {topSelling.map((t, i) => (
                <div key={i} className="flex justify-between py-2 border-b last:border-0 text-sm">
                  <span>{t.emoji} {t.name}</span>
                  <span className="font-bold">{t.qty} পিস</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 border">
              <h4 className="font-bold text-sm mb-2">⚠️ লো স্টক</h4>
              {lowStock.length === 0 && <div className="text-xs text-slate-400">সব ঠিক আছে</div>}
              {lowStock.map((p) => (
                <div key={p.id} className="flex justify-between py-2 text-sm">
                  <span>{p.name}</span>
                  <span className="text-red-600">{num(p.stock)}</span>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 border">
              <h4 className="font-bold text-sm mb-2">💰 আজকের সামারি</h4>
              <div className="text-xs space-y-1">
                <div>মোট বিক্রি: {dayTotal}৳</div>
                <div>মোট খরচ: {dayExp}৳</div>
                <div className="font-bold border-t pt-1">নেট লাভ: {dayTotal - dayExp}৳</div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
