import { NextRequest } from 'next/server';
import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoUpdateProduct, demoDeleteProduct } from '@/lib/demoStore';

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// PATCH /api/products/[id] — partial update
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();
    if (isDemoMode()) {
      const product = demoUpdateProduct(Number(id), b);
      if (!product) return Response.json({ error: 'প্রোডাক্ট পাওয়া যায়নি' }, { status: 404 });
      return Response.json({ product, demo: true });
    }
    const { client, error } = getAdminClient();
    if (error) return error;
    const patch: Record<string, unknown> = {};
    if (b.name !== undefined) patch.name = b.name;
    if (b.cat !== undefined) patch.cat = b.cat;
    if (b.price !== undefined) patch.price = num(b.price);
    if (b.buy !== undefined) patch.buy = num(b.buy);
    if (b.stock !== undefined) patch.stock = num(b.stock);
    if (b.emoji !== undefined) patch.emoji = b.emoji;
    if (b.barcode !== undefined) patch.barcode = b.barcode || null;
    if (b.expiry !== undefined) patch.expiry = b.expiry || null;
    const { data, error: dbError } = await client.from('products').update(patch).eq('id', id).select().single();
    if (dbError) throw dbError;
    return Response.json({ product: { ...data, price: num(data.price), buy: num(data.buy), stock: num(data.stock) } });
  } catch (e) {
    return handleApiError(e);
  }
}

// DELETE /api/products/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (isDemoMode()) {
      const ok = demoDeleteProduct(Number(id));
      if (!ok) return Response.json({ error: 'প্রোডাক্ট পাওয়া যায়নি' }, { status: 404 });
      return Response.json({ ok: true, demo: true });
    }
    const { client, error } = getAdminClient();
    if (error) return error;
    const { error: dbError } = await client.from('products').delete().eq('id', id);
    if (dbError) throw dbError;
    return Response.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
