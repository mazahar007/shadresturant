'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

const num = (v: unknown) => Number(v) || 0;

const CAT_OPTIONS = [
  { id: 'biryani', name: 'বিরিয়ানি' },
  { id: 'khichuri', name: 'খিচুড়ি' },
  { id: 'nasta', name: 'নাস্তা' },
  { id: 'drinks', name: 'পানীয়' },
  { id: 'snacks', name: 'স্ন্যাকস' },
];

interface FormState {
  name: string;
  cat: string;
  price: string;
  buy: string;
  stock: string;
  emoji: string;
  barcode: string;
  expiry: string;
}

const EMPTY: FormState = { name: '', cat: 'biryani', price: '', buy: '', stock: '', emoji: '🍛', barcode: '', expiry: '' };

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | { mode: 'add' } | { mode: 'edit'; id: number }>(null);
  const [form, setForm] = useState<FormState>(EMPTY);

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/products');
    const j = await r.json();
    if (r.ok) setProducts(j.products);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(EMPTY); setModal({ mode: 'add' }); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      cat: p.cat,
      price: String(num(p.price)),
      buy: String(num(p.buy)),
      stock: String(num(p.stock)),
      emoji: p.emoji,
      barcode: p.barcode || '',
      expiry: p.expiry || '',
    });
    setModal({ mode: 'edit', id: p.id });
  };

  const save = async () => {
    if (!form.name.trim()) { alert('নাম দিন'); return; }
    const payload = {
      name: form.name.trim(),
      cat: form.cat,
      price: Number(form.price) || 0,
      buy: Number(form.buy) || 0,
      stock: Number(form.stock) || 0,
      emoji: form.emoji || '🍛',
      barcode: form.barcode,
      expiry: form.expiry,
    };
    const url = modal && modal.mode === 'edit' ? `/api/products/${modal.id}` : '/api/products';
    const r = await fetch(url, {
      method: modal && modal.mode === 'edit' ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!r.ok) { alert(j?.error || 'সেভ হয়নি'); return; }
    setModal(null);
    load();
  };

  const remove = async (id: number, name: string) => {
    if (!confirm(`"${name}" ডিলিট করবেন?`)) return;
    const r = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    const j = await r.json();
    if (!r.ok) { alert(j?.error || 'ডিলিট হয়নি'); return; }
    load();
  };

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-bold">🍛 মেনু / প্রোডাক্ট ({products.length})</h3>
        <button onClick={openAdd} className="bg-emerald-600 text-white rounded-full px-4 py-1.5 text-sm">
          + নতুন প্রোডাক্ট
        </button>
      </div>
      {loading ? (
        <div className="text-center py-16 text-slate-400">লোড হচ্ছে…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs">
              <tr>
                <th className="p-3 text-left">নাম</th>
                <th className="p-3">ক্যাটাগরি</th>
                <th className="p-3">দাম</th>
                <th className="p-3">কেনা</th>
                <th className="p-3">স্টক</th>
                <th className="p-3">বারকোড</th>
                <th className="p-3">মেয়াদ</th>
                <th className="p-3">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t hover:bg-slate-50">
                  <td className="p-3 font-medium">{p.emoji} {p.name}</td>
                  <td className="p-3">{p.cat}</td>
                  <td className="p-3 font-bold">{num(p.price)}৳</td>
                  <td className="p-3">{num(p.buy)}৳</td>
                  <td className={`p-3 ${num(p.stock) < 50 ? 'text-red-600 font-bold' : ''}`}>{num(p.stock)}</td>
                  <td className="p-3 font-mono text-xs">{p.barcode || '-'}</td>
                  <td className="p-3 text-xs">{p.expiry || '-'}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-blue-600 text-xs mr-3">✏️ এডিট</button>
                    <button onClick={() => remove(p.id, p.name)} className="text-red-600 text-xs">🗑️ ডিলিট</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold mb-4">{modal.mode === 'add' ? '➕ নতুন প্রোডাক্ট' : '✏️ এডিট প্রোডাক্ট'}</h3>
            <div className="space-y-3 text-sm">
              <label className="block">নাম<input value={form.name} onChange={set('name')} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
              <label className="block">ক্যাটাগরি
                <select value={form.cat} onChange={set('cat')} className="mt-1 w-full border rounded-xl px-3 py-2">
                  {CAT_OPTIONS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">বিক্রি দাম<input type="number" value={form.price} onChange={set('price')} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
                <label className="block">কেনা দাম<input type="number" value={form.buy} onChange={set('buy')} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
                <label className="block">স্টক<input type="number" value={form.stock} onChange={set('stock')} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label className="block">ইমোজি<input value={form.emoji} onChange={set('emoji')} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
                <label className="block">বারকোড<input value={form.barcode} onChange={set('barcode')} className="mt-1 w-full border rounded-xl px-3 py-2 font-mono" /></label>
              </div>
              <label className="block">মেয়াদ (expiry)<input type="date" value={form.expiry} onChange={set('expiry')} className="mt-1 w-full border rounded-xl px-3 py-2" /></label>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={save} className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 font-bold">✅ সেভ</button>
              <button onClick={() => setModal(null)} className="flex-1 bg-slate-100 rounded-xl py-2.5">বাতিল</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
