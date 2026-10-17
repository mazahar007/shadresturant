'use client';

import { useMemo, useState } from 'react';
import { BN_MONTHS, BN_WEEKDAYS, getDaysInMonth, toDateStr, todayDhaka } from '@/lib/dates';

interface Props {
  selectedDate: string;
  onSelect: (d: string) => void;
  salesByDate: Record<string, number>;
  size?: 'mini' | 'full';
}

/** Reusable calendar: per-day sales totals, today/selected highlight, month nav. */
export default function MonthCalendar({ selectedDate, onSelect, salesByDate, size = 'mini' }: Props) {
  const init = useMemo(() => {
    const [y, m] = selectedDate.split('-').map(Number);
    return new Date(y || 1970, (m || 1) - 1, 1);
  }, [selectedDate]);
  const [month, setMonth] = useState(init);
  const today = todayDhaka();
  const days = useMemo(() => getDaysInMonth(month), [month]);
  const full = size === 'full';

  const changeMonth = (dir: number) => {
    const d = new Date(month);
    d.setMonth(d.getMonth() + dir);
    setMonth(d);
  };

  const title = `${BN_MONTHS[month.getMonth()]} ${month.getFullYear()}`;

  return (
    <div className={`bg-white rounded-2xl border ${full ? 'p-6' : 'p-5'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-bold ${full ? 'text-lg' : ''}`}>
          {full ? '📅 ফুল ক্যালেন্ডার - তারিখে ক্লিক করে হিসাব' : '📅 তারিখে ক্লিক করে হিসাব দেখুন'}
        </h3>
        <div className="flex gap-1">
          <button onClick={() => changeMonth(-1)} className="w-7 h-7 bg-slate-100 rounded-full text-sm">‹</button>
          <button onClick={() => changeMonth(1)} className="w-7 h-7 bg-slate-100 rounded-full text-sm">›</button>
        </div>
      </div>
      <div className="text-center font-semibold mb-2 text-sm">{title}</div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-center text-slate-500 mb-1">
        {BN_WEEKDAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className={`grid grid-cols-7 ${full ? 'gap-2' : 'gap-1'}`}>
        {days.map((d, i) => {
          if (!d) return <div key={'e' + i} />;
          const ds = toDateStr(d);
          const amt = salesByDate[ds] || 0;
          const isToday = ds === today;
          const isSel = ds === selectedDate;
          const base = isSel
            ? 'bg-emerald-600 text-white border-emerald-600'
            : isToday
              ? 'bg-emerald-50 border-emerald-300 font-bold'
              : 'bg-white hover:bg-slate-50';
          if (full) {
            return (
              <button
                key={ds}
                onClick={() => onSelect(ds)}
                className={`h-20 rounded-2xl border p-2 text-left hover:shadow transition ${base}`}
              >
                <div className="font-bold text-sm">{d.getDate()}</div>
                {amt > 0 && (
                  <div className={`text-[11px] mt-1 ${isSel ? 'text-white' : 'text-emerald-600'} font-bold`}>
                    {amt}৳ বিক্রি
                  </div>
                )}
                <div className="text-[10px] opacity-70 mt-1">ক্লিক করুন</div>
              </button>
            );
          }
          return (
            <button
              key={ds}
              onClick={() => onSelect(ds)}
              className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center text-xs border ${base} ${
                amt > 0 && !isSel ? 'border-emerald-200' : ''
              }`}
            >
              <div>{d.getDate()}</div>
              {amt > 0 && (
                <div className={`text-[8px] ${isSel ? 'text-white' : 'text-emerald-600'}`}>
                  {amt > 1000 ? (amt / 1000).toFixed(1) + 'k' : amt}৳
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] bg-emerald-50 text-emerald-800 rounded-xl p-2 border border-emerald-200">
        💡 <b>নতুন ফিচার:</b> যেকোনো তারিখে ক্লিক করুন, সাথে সাথে ওই দিনের বিক্রি, খরচ, লাভ দেখাবে।
        সবুজ বক্স = বিক্রি আছে
      </div>
    </div>
  );
}
