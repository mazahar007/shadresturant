import type { Product, Sale, SaleItem, Expense } from './types';

/**
 * In-memory demo database.
 * Used ONLY when SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set
 * (e.g. the public demo deployment). Data resets when the server restarts.
 * The real deployment with Supabase env vars never touches this file.
 */

const now = () => new Date().toISOString();

let products: Product[] = [
  { id: 1, name: 'চিকেন বিরিয়ানি', cat: 'biryani', price: 180, buy: 120, stock: 45, emoji: '🍛', barcode: '880100000001', expiry: '2026-10-16', created_at: now() },
  { id: 2, name: 'বিফ খিচুড়ি', cat: 'khichuri', price: 150, buy: 95, stock: 30, emoji: '🍲', barcode: '880100000002', expiry: '2026-10-15', created_at: now() },
  { id: 3, name: 'পরোটা + ডাল', cat: 'nasta', price: 40, buy: 20, stock: 100, emoji: '🫓', barcode: '880100000003', expiry: null, created_at: now() },
  { id: 4, name: 'চা দুধ', cat: 'drinks', price: 25, buy: 12, stock: 200, emoji: '☕', barcode: '880100000004', expiry: null, created_at: now() },
  { id: 5, name: 'সমুচা', cat: 'snacks', price: 15, buy: 8, stock: 80, emoji: '🥟', barcode: '880100000005', expiry: null, created_at: now() },
  { id: 6, name: 'কোক 250ml', cat: 'drinks', price: 30, buy: 20, stock: 50, emoji: '🥤', barcode: '880100000006', expiry: null, created_at: now() },
];

let sales: Sale[] = [
  { id: 1, date: '2026-10-15', time: '10:30', token: 'T-001', customer: 'রহিম', total: 360, paid: 360, due: 0, method: 'Cash', table_no: '3', items: [], created_at: now() },
  { id: 2, date: '2026-10-15', time: '11:15', token: 'T-002', customer: 'করিম', total: 150, paid: 150, due: 0, method: 'Bkash', table_no: '5', items: [], created_at: now() },
  { id: 3, date: '2026-10-14', time: '13:20', token: 'T-003', customer: 'জামাল', total: 120, paid: 100, due: 20, method: 'Cash', table_no: '1', items: [], created_at: now() },
  { id: 4, date: '2026-10-14', time: '19:00', token: 'T-004', customer: 'সালমা', total: 540, paid: 540, due: 0, method: 'Nagad', table_no: '2', items: [], created_at: now() },
  { id: 5, date: '2026-10-13', time: '09:10', token: 'T-005', customer: 'আব্দুল', total: 75, paid: 75, due: 0, method: 'Cash', table_no: '4', items: [], created_at: now() },
];

let saleItems: SaleItem[] = [
  { id: 1, sale_id: 1, product_id: 1, name: 'বিরিয়ানি', qty: 2, price: 180 },
  { id: 2, sale_id: 2, product_id: 2, name: 'খিচুড়ি', qty: 1, price: 150 },
  { id: 3, sale_id: 3, product_id: 3, name: 'পরোটা', qty: 3, price: 40 },
  { id: 4, sale_id: 4, product_id: 1, name: 'বিরিয়ানি', qty: 3, price: 180 },
  { id: 5, sale_id: 5, product_id: 5, name: 'সমুচা', qty: 5, price: 15 },
];

let expenses: Expense[] = [
  { id: 1, date: '2026-10-15', cat: 'ভাড়া', amount: 8000, note: 'অক্টোবর', created_at: now() },
  { id: 2, date: '2026-10-15', cat: 'গ্যাস', amount: 1400, note: null, created_at: now() },
  { id: 3, date: '2026-10-14', cat: 'কাঁচামাল', amount: 3500, note: null, created_at: now() },
];

let nextProductId = 7;
let nextSaleId = 6;
let nextItemId = 6;
let nextExpenseId = 4;

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function withItems(s: Sale): Sale {
  return { ...s, items: saleItems.filter((i) => i.sale_id === s.id) };
}

function inRange(date: string, from?: string, to?: string) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

// ---------- products ----------
export function demoListProducts(): Product[] {
  return [...products].sort((a, b) => a.id - b.id);
}

export function demoCreateProduct(b: Record<string, unknown>): Product {
  const p: Product = {
    id: nextProductId++,
    name: String(b.name || ''),
    cat: String(b.cat || ''),
    price: num(b.price),
    buy: num(b.buy),
    stock: num(b.stock),
    emoji: String(b.emoji || '🍛'),
    barcode: b.barcode ? String(b.barcode) : null,
    expiry: b.expiry ? String(b.expiry) : null,
    created_at: now(),
  };
  products.push(p);
  return p;
}

export function demoUpdateProduct(id: number, patch: Record<string, unknown>): Product | null {
  const p = products.find((x) => x.id === id);
  if (!p) return null;
  if (patch.name !== undefined) p.name = String(patch.name);
  if (patch.cat !== undefined) p.cat = String(patch.cat);
  if (patch.price !== undefined) p.price = num(patch.price);
  if (patch.buy !== undefined) p.buy = num(patch.buy);
  if (patch.stock !== undefined) p.stock = num(patch.stock);
  if (patch.emoji !== undefined) p.emoji = String(patch.emoji);
  if (patch.barcode !== undefined) p.barcode = patch.barcode ? String(patch.barcode) : null;
  if (patch.expiry !== undefined) p.expiry = patch.expiry ? String(patch.expiry) : null;
  return p;
}

export function demoDeleteProduct(id: number): boolean {
  const i = products.findIndex((x) => x.id === id);
  if (i < 0) return false;
  products.splice(i, 1);
  return true;
}

// ---------- sales ----------
export function demoListSales(from?: string, to?: string): Sale[] {
  return sales
    .filter((s) => inRange(s.date, from, to))
    .sort((a, b) => (b.date === a.date ? b.id - a.id : b.date < a.date ? -1 : 1))
    .map(withItems);
}

export function demoCreateSale(body: Record<string, unknown>): Sale {
  const items = (body.items as Record<string, unknown>[]) || [];
  const normItems = items.map((i) => ({
    product_id: typeof i.product_id === 'number' ? i.product_id : null,
    name: String(i.name || ''),
    qty: num(i.qty, 1),
    price: num(i.price),
  }));
  const total = normItems.reduce((a, i) => a + i.qty * i.price, 0);
  const paid = num(body.paid);
  const sale: Sale = {
    id: nextSaleId++,
    date: String(body.date || ''),
    time: String(body.time || ''),
    token: 'T-' + String(sales.length + 1).padStart(3, '0'),
    customer: String(body.customer || 'ওয়াক-ইন'),
    total,
    paid,
    due: total - paid,
    method: String(body.method || 'Cash'),
    table_no: String(body.table_no || ''),
    items: [],
    created_at: now(),
  };
  sales.unshift(sale);
  for (const i of normItems) {
    saleItems.push({ id: nextItemId++, sale_id: sale.id, product_id: i.product_id, name: i.name, qty: i.qty, price: i.price });
    if (i.product_id != null) {
      const p = products.find((x) => x.id === i.product_id);
      if (p) p.stock = Math.max(0, p.stock - i.qty);
    }
  }
  return withItems(sale);
}

export function demoPatchSale(id: number, paid: number): Sale | null {
  const s = sales.find((x) => x.id === id);
  if (!s) return null;
  s.paid = paid;
  s.due = s.total - paid;
  return withItems(s);
}

// ---------- expenses ----------
export function demoListExpenses(from?: string, to?: string): Expense[] {
  return expenses
    .filter((e) => inRange(e.date, from, to))
    .sort((a, b) => (b.date === a.date ? b.id - a.id : b.date < a.date ? -1 : 1));
}

export function demoCreateExpense(b: Record<string, unknown>): Expense {
  const e: Expense = {
    id: nextExpenseId++,
    date: String(b.date || ''),
    cat: String(b.cat || ''),
    amount: num(b.amount),
    note: b.note ? String(b.note) : null,
    created_at: now(),
  };
  expenses.unshift(e);
  return e;
}

export function demoDeleteExpense(id: number): boolean {
  const i = expenses.findIndex((x) => x.id === id);
  if (i < 0) return false;
  expenses.splice(i, 1);
  return true;
}

// ---------- backup ----------
export function demoBackup() {
  return {
    exported_at: new Date().toISOString(),
    demo_mode: true,
    products: demoListProducts(),
    sales: demoListSales(),
    expenses: demoListExpenses(),
  };
}
