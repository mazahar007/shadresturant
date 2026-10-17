import { NextRequest } from 'next/server';
import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoListProducts, demoCreateProduct } from '@/lib/demoStore';
import type { Product } from '@/lib/types';

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function normProduct(p: Record<string, unknown>): Product {
  return {
    ...(p as object),
    price: num(p.price),
    buy: num(p.buy),
    stock: num(p.stock),
  } as Product;
}

// GET /api/products
export async function GET() {
  try {
    if (isDemoMode()) return Response.json({ products: demoListProducts(), demo: true });
    const { client, error } = getAdminClient();
    if (error) return error;
    const { data, error: dbError } = await client.from('products').select('*').order('id');
    if (dbError) throw dbError;
    return Response.json({ products: (data || []).map(normProduct) });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/products {name,cat,price,buy,stock,emoji,barcode,expiry}
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b?.name) return Response.json({ error: 'নাম দরকার' }, { status: 400 });
    if (isDemoMode()) return Response.json({ product: demoCreateProduct(b), demo: true });
    const { client, error } = getAdminClient();
    if (error) return error;
    const { data, error: dbError } = await client
      .from('products')
      .insert({
        name: b.name,
        cat: b.cat || '',
        price: num(b.price),
        buy: num(b.buy),
        stock: num(b.stock),
        emoji: b.emoji || '🍛',
        barcode: b.barcode || null,
        expiry: b.expiry || null,
      })
      .select()
      .single();
    if (dbError) throw dbError;
    return Response.json({ product: normProduct(data) });
  } catch (e) {
    return handleApiError(e);
  }
}
