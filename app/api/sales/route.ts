import { NextRequest } from 'next/server';
import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoListSales, demoCreateSale } from '@/lib/demoStore';
import type { Sale } from '@/lib/types';

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function normSale(s: Record<string, unknown>): Sale {
  return {
    ...(s as object),
    total: num((s as Record<string, unknown>).total),
    paid: num((s as Record<string, unknown>).paid),
    due: num((s as Record<string, unknown>).due),
    items: (((s as Record<string, unknown>).items as Record<string, unknown>[]) || []).map((i) => ({
      ...(i as object),
      qty: num(i.qty),
      price: num(i.price),
    })),
  } as Sale;
}

// GET /api/sales?from=YYYY-MM-DD&to=YYYY-MM-DD
export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get('from') || undefined;
    const to = req.nextUrl.searchParams.get('to') || undefined;
    if (isDemoMode()) return Response.json({ sales: demoListSales(from, to), demo: true });
    const { client, error } = getAdminClient();
    if (error) return error;
    let q = client
      .from('sales')
      .select('*, items:sale_items(*)')
      .order('date', { ascending: false })
      .order('id', { ascending: false });
    if (from) q = q.gte('date', from);
    if (to) q = q.lte('date', to);
    const { data, error: dbError } = await q;
    if (dbError) throw dbError;
    return Response.json({ sales: (data || []).map(normSale) });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/sales {date,time,customer,method,table_no,paid,items:[{product_id,name,qty,price}]}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { date, items } = body || {};
    if (!date || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'তারিখ ও আইটেম দরকার' }, { status: 400 });
    }
    if (isDemoMode()) return Response.json({ sale: demoCreateSale(body), demo: true });

    const { client, error } = getAdminClient();
    if (error) return error;
    const { time, customer, method, table_no, paid } = body;

    const normItems: { product_id: number | null; name: string; qty: number; price: number }[] =
      items.map((i: Record<string, unknown>) => ({
        product_id: typeof i.product_id === 'number' ? i.product_id : null,
        name: String(i.name || ''),
        qty: num(i.qty, 1),
        price: num(i.price),
      }));
    const total = normItems.reduce((a: number, i: { qty: number; price: number }) => a + i.qty * i.price, 0);
    const paidNum = num(paid);
    const due = total - paidNum;

    const { count } = await client.from('sales').select('id', { count: 'exact', head: true });
    const token = 'T-' + String((count || 0) + 1).padStart(3, '0');

    const { data: sale, error: saleError } = await client
      .from('sales')
      .insert({
        date,
        time: time || '',
        token,
        customer: customer || 'ওয়াক-ইন',
        total,
        paid: paidNum,
        due,
        method: method || 'Cash',
        table_no: table_no || '',
      })
      .select()
      .single();
    if (saleError) throw saleError;

    const { error: itemsError } = await client.from('sale_items').insert(
      normItems.map((i: { product_id: number | null; name: string; qty: number; price: number }) => ({
        sale_id: sale.id,
        product_id: i.product_id,
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
    );
    if (itemsError) throw itemsError;

    // Decrement stock (floor at 0)
    for (const i of normItems) {
      if (i.product_id == null) continue;
      const { data: p } = await client.from('products').select('stock').eq('id', i.product_id).single();
      if (p) {
        await client
          .from('products')
          .update({ stock: Math.max(0, num(p.stock) - i.qty) })
          .eq('id', i.product_id);
      }
    }

    const { data: full } = await client
      .from('sales')
      .select('*, items:sale_items(*)')
      .eq('id', sale.id)
      .single();
    return Response.json({ sale: full ? normSale(full) : sale });
  } catch (e) {
    return handleApiError(e);
  }
}
