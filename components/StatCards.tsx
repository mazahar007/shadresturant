import type { Sale, Expense } from '@/lib/types';

interface Props {
  sales: Sale[];
  expenses: Expense[];
  label: string;
}

const num = (v: unknown) => Number(v) || 0;

export default function StatCards({ sales, expenses, label }: Props) {
  const totalSales = sales.reduce((a, s) => a + num(s.total), 0);
  const totalExp = expenses.reduce((a, e) => a + num(e.amount), 0);
  const due = sales.reduce((a, s) => a + num(s.due), 0);
  const profit = totalSales - totalExp;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      <div className="bg-white rounded-2xl p-4 border">
        <div className="text-xs text-slate-500">📅 {label} বিক্রি</div>
        <div className="text-2xl font-bold text-emerald-700">{totalSales}৳</div>
        <div className="text-[11px]">{sales.length} টি বিক্রি - তারিখে ক্লিক করুন</div>
      </div>
      <div className="bg-white rounded-2xl p-4 border">
        <div className="text-xs text-slate-500">খরচ</div>
        <div className="text-2xl font-bold text-red-600">{totalExp}৳</div>
        <div className="text-[11px]">{expenses.length} টি খরচ</div>
      </div>
      <div className="bg-white rounded-2xl p-4 border">
        <div className="text-xs text-slate-500">বাকি</div>
        <div className="text-2xl font-bold text-amber-600">{due}৳</div>
      </div>
      <div className="bg-white rounded-2xl p-4 border">
        <div className="text-xs text-slate-500">লাভ</div>
        <div className={`text-2xl font-bold ${profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
          {profit}৳
        </div>
      </div>
    </div>
  );
}
