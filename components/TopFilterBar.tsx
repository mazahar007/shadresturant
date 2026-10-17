'use client';

import { useEffect, useState } from 'react';
import { useDateFilter } from '@/lib/useDateFilter';
import { todayDhaka } from '@/lib/dates';

const FILTERS = [
  { id: 'today', name: 'আজকে' },
  { id: 'yesterday', name: 'গতকাল' },
  { id: 'week', name: '৭ দিন' },
  { id: 'month', name: 'এই মাস' },
  { id: 'all', name: 'সব' },
];

/** Sticky filter header: pills + date picker + range + active label chip. */
export default function TopFilterBar() {
  const f = useDateFilter();
  const [picker, setPicker] = useState(f.date);
  const [from, setFrom] = useState(f.from);
  const [to, setTo] = useState(f.to);

  // Keep local inputs in sync when URL params change (e.g. calendar click).
  useEffect(() => setPicker(f.date), [f.date]);
  useEffect(() => { setFrom(f.from); setTo(f.to); }, [f.from, f.to]);

  const applyRange = () => {
    if (!from || !to) {
      alert('From এবং To তারিখ দিন');
      return;
    }
    f.setRange(from, to);
  };

  return (
    <div className="bg-white border-b px-4 py-3 space-y-2 sticky top-0 z-20 -m-3 md:-m-5 mb-3 md:mb-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 bg-slate-100 rounded-full p-1">
          {FILTERS.map((x) => (
            <button
              key={x.id}
              onClick={() => f.setFilter(x.id)}
              className={`px-3 py-1.5 rounded-full text-xs ${
                f.filter === x.id
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              {x.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
          <span className="text-xs">📅</span>
          <input
            type="date"
            value={picker}
            max={todayDhaka()}
            onChange={(e) => setPicker(e.target.value)}
            className="bg-transparent text-xs font-medium focus:outline-none"
          />
        </div>
        <button
          onClick={() => picker && f.selectDate(picker)}
          className="bg-slate-900 text-white rounded-full px-3 py-1.5 text-xs"
        >
          তারিখ দেখুন
        </button>
        <span className="ml-auto text-xs bg-slate-900 text-white rounded-full px-3 py-1.5">
          👉 {f.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500">রেঞ্জ:</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="border rounded-full px-3 py-1 text-xs"
        />
        <span>থেকে</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="border rounded-full px-3 py-1 text-xs"
        />
        <button onClick={applyRange} className="bg-blue-600 text-white rounded-full px-3 py-1">
          রেঞ্জ
        </button>
        <button onClick={f.clear} className="bg-slate-100 rounded-full px-3 py-1">
          ✕ ক্লিয়ার
        </button>
        <span className="ml-auto text-[11px] text-slate-500">
          💡 যেকোনো তারিখে ক্লিক করুন → হিসাব ফিল্টার হবে
        </span>
      </div>
    </div>
  );
}
