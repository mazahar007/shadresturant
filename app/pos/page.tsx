'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import TopFilterBar from '@/components/TopFilterBar';
import { useDateFilter } from '@/lib/useDateFilter';
import { formatBn, todayDhaka } from '@/lib/dates';
import type { Product } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

const CATS = [
  { id: 'all', name: 'সব' },
  { id: 'biryani', name: 'বিরিয়ানি' },
  { id: 'khichuri', name: 'খিচুড়ি' },
  { id: 'nasta', name: 'নাস্তা' },
  { id: 'drinks', name: 'পানীয়' },
];

interface CartLine extends Product {
  qty: number;
}

export default function PosPage() {
  const f = useDateFilter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [activeCat, setActiveCat] = useState('all');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const r = await fetch('/api/products');
    const j = await r.json();
    if (r.ok) setProducts(j.products);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => products.filter((p) => activeCat === 'all' || p.cat === activeCat),
    [products, activeCat],
  );

  const addToCart = (p: Product) => {
    setCart((c) => {
      const ex = c.find((x) => x.id === p.id);
      if (ex) return c.map((x) => (x.id === p.id ? { ...x, qty: x.qty + 1 } : x));
      return [...c, { ...p, qty: 1 }];
    });
  };

  const changeQty = (id: number, d: number) => {
    setCart((c) =>
      c
        .map((x) => (x.id === id ? { ...x, qty: x.qty + d } : x))
        .filter((x) => x.qty > 0),
    );
  };

  const total = cart.reduce((a, b) => a + num(b.price) * b.qty, 0);

  const checkout = async () => {
    if (cart.length === 0) {
      alert('কার্ট খালি');
      return;
    }
    setBusy(true);
    try {
      const now = new Date();
      const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
      const r = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: f.date || todayDhaka(),
          time,
          customer: 'ওয়াক-ইন',
          method: 'Cash',
          table_no: '',
          paid: total,
          items: cart.map((c) => ({ product_id: c.id, name: c.name, qty: c.qty, price: c.price })),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || 'বিক্রি হয়নি');
      alert(`✅ ${formatBn(j.sale.date)} তারিখে বিক্রি যোগ হয়েছে - ${num(j.sale.total)}৳ (${j.sale.token})`);
      setCart([]);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'বিক্রি হয়নি');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopFilterBar />
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {CATS.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCat === c.id ? 'bg-emerald-600 text-white' : 'bg-white border'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                disabled={num(p.stock) <= 0}
                className="bg-white rounded-2xl p-4 text-left border hover:shadow-lg transition disabled:opacity-40"
              >
                <div className="text-3xl">{p.emoji}</div>
                <div className="font-bold text-sm mt-2">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {num(p.price)}৳ • স্টক {num(p.stock)}
                </div>
                <div className="mt-2 text-[11px] bg-slate-900 text-white rounded-full px-2 py-1 inline-block">
                  + কার্ট
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">কোনো প্রোডাক্ট নেই</div>
          )}
        </div>

        <div className="lg:w-[360px] bg-white rounded-2xl border p-4 h-fit lg:sticky lg:top-[120px]">
          <h3 className="font-bold">
            🛒 কার্ট ({cart.reduce((a, b) => a + b.qty, 0)}) - {formatBn(f.date || todayDhaka())}
          </h3>
          <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
            {cart.length === 0 && <div className="text-center py-8 text-slate-400 text-sm">কার্ট খালি</div>}
            {cart.map((c) => (
              <div key={c.id} className="flex items-center justify-between bg-slate-50 rounded-xl p-2 text-sm">
                <span className="flex-1">{c.name}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => changeQty(c.id, -1)} className="w-6 h-6 bg-white border rounded-full">−</button>
                  <span className="w-6 text-center font-bold">{c.qty}</span>
                  <button onClick={() => changeQty(c.id, 1)} className="w-6 h-6 bg-white border rounded-full">+</button>
                </div>
                <span className="w-16 text-right font-medium">{num(c.price) * c.qty}৳</span>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3">
            <div className="flex justify-between font-bold">
              <span>মোট</span>
              <span>{total}৳</span>
            </div>
            <button
              onClick={checkout}
              disabled={busy || cart.length === 0}
              className="w-full mt-3 bg-emerald-600 text-white rounded-xl py-3 font-bold disabled:opacity-40"
            >
              {busy ? 'যোগ হচ্ছে…' : `✅ বিক্রি - ${formatBn(f.date || todayDhaka())} তারিখে যোগ`}
            </button>
            <div className="text-[11px] text-slate-500 mt-2 text-center">
              বিক্রি করলে {formatBn(f.date || todayDhaka())} তারিখে হিসাব যোগ হবে
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
