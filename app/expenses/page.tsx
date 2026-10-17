'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import { useDateFilter } from '@/lib/useDateFilter';
import { formatBn, todayDhaka } from '@/lib/dates';
import type { Expense } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

const EXP_CATS = ['ভাড়া', 'গ্যাস', 'কাঁচামাল', 'বেতন', 'বিদ্যুৎ', 'পানি', 'অন্যান্য'];

export default function ExpensesPage() {
  const f = useDateFilter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date: todayDhaka(), cat: 'কাঁচামাল', amount: '', note: '' });
  const { from, to } = f.range;

  const load = async () => {
    setLoading(true);
    const q = from && to ? `?from=${from}&to=${to}` : '';
    const r = await fetch('/api/expenses' + q);
    const j = await r.json();
    if (r.ok) setExpenses(j.expenses);
    setLoading(false);
  };
  useEffect(() => { load(); }, [from, to]);

  const save = async () => {
    if (!form.date || !form.cat) { alert('তারিখ ও ক্যাটাগরি দিন'); return; }
    const r = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: form.date, cat: form.cat, amount: Number(form.amount) || 0, note: form.note }),
    });
    const j = await r.json();
    if (!r.ok) { alert(j?.error || 'সেভ হয়নি'); return; }
    setModal(false);
    setForm({ date: todayDhaka(), cat: 'কাঁচামাল', amount: '', note: '' });
    load();
  };

  const remove = async (id: number, cat: string, amount: number) => {
    if (!confirm(`"${cat} - ${amount}৳" ডিলিট করবেন?`)) return;
    const r = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (!r.ok) { alert(j?.error || 'ডিলিট হয়নি'); return; }
    load();
  };

  const total = expenses.reduce((a, e) => a + num(e.amount), 0);

  return (
    <>
      <TopFilterBar />
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold">💸 খরচ ({expenses.length}) - মোট {total}৳</h3>
          <button onClick={() => setModal(true)} className="bg-emerald-600 text-white rounded-full px-4 py-1.5 text-sm">
            + নতুন খরচ
          </button>
        </div>
        {loading ? (
          <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-16 text-slate-400">কোনো খরচ নেই</div>
        ) : (
          <div className="divide-y">
            {expenses.map((e) => (
              <div key={e.id} className="flex justify-between items-center p-4 hover:bg-slate-50">
                <div>
                  <div className="font-medium text-sm">{e.cat} {e.note ? `- ${e.note}` : ''}</div>
                  <div className="text-xs text-slate-500">📅 {e.date} ({formatBn(e.date)})</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-red-600">{num(e.amount)}৳</span>
                  <button onClick={() => remove(e.id, e.cat, num(e.amount))} className="text-red-600 text-xs">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <h3 className="font-bold mb-4">➕ নতুন খরচ</h3>
            <div className="space-y-3 text-sm">
              <label className="block">তারিখ
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
              </label>
              <label className="block">ক্যাটাগরি
                <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2">
                  {EXP_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block">টাকা
                <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
              </label>
              <label className="block">নোট
                <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="mt-1 w-full border rounded-xl px-3 py-2" />
              </label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 font-bold">✅ সেভ</button>
              <button onClick={() => setModal(false)} className="flex-1 bg-slate-100 rounded-xl py-2.5">বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
