'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import MonthCalendar from '@/components/MonthCalendar';
import { useDateFilter } from '@/lib/useDateFilter';
import { formatBn } from '@/lib/dates';
import type { Sale, Expense } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

export default function CalendarPage() {
  const f = useDateFilter();
  const [allSales, setAllSales] = useState<Sale[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const { from, to } = f.range;

  useEffect(() => {
    (async () => {
      const r = await fetch('/api/sales');
      const j = await r.json();
      if (r.ok) setAllSales(j.sales);
    })();
  }, []);

  useEffect(() => {
    let live = true;
    (async () => {
      const q = from && to ? `?from=${from}&to=${to}` : '';
      const [s, e] = await Promise.all([fetch('/api/sales' + q), fetch('/api/expenses' + q)]);
      const sj = await s.json();
      const ej = await e.json();
      if (live && s.ok && e.ok) {
        setSales(sj.sales);
        setExpenses(ej.expenses);
      }
    })();
    return () => { live = false; };
  }, [from, to]);

  const salesByDate = useMemo(() => {
    const m: Record<string, number> = {};
    allSales.forEach((s) => { m[s.date] = (m[s.date] || 0) + num(s.total); });
    return m;
  }, [allSales]);

  const totalS = sales.reduce((a, s) => a + num(s.total), 0);
  const totalE = expenses.reduce((a, e) => a + num(e.amount), 0);

  return (
    <>
      <TopFilterBar />
      <div className="bg-white rounded-2xl border p-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <MonthCalendar
              selectedDate={f.date}
              onSelect={f.selectDate}
              salesByDate={salesByDate}
              size="full"
            />
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 h-fit">
            <h4 className="font-bold mb-3">📊 {formatBn(f.date)} এর হিসাব</h4>
            <div className="space-y-2 text-sm">
              <div className="bg-white rounded-xl p-3 flex justify-between">
                <span>বিক্রি</span>
                <span className="font-bold text-emerald-700">{totalS}৳</span>
              </div>
              <div className="bg-white rounded-xl p-3 flex justify-between">
                <span>খরচ</span>
                <span className="font-bold text-red-600">{totalE}৳</span>
              </div>
              <div className="bg-white rounded-xl p-3 flex justify-between">
                <span>লাভ</span>
                <span className="font-bold">{totalS - totalE}৳</span>
              </div>
            </div>
            <div className="mt-4 text-xs bg-blue-50 border border-blue-200 rounded-xl p-3">
              💡 <b>কিভাবে কাজ করে:</b>
              <br />• ক্যালেন্ডারের যেকোনো তারিখে ক্লিক করুন
              <br />• ওই দিনের সব হিসাব সাথে সাথে দেখাবে
              <br />• বিক্রি লিস্টেও তারিখে ক্লিক করলে ফিল্টার হবে
              <br />• রেঞ্জ দিয়ে ২ তারিখের মধ্যে হিসাব দেখতে পারবেন
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
