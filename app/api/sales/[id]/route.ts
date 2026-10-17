import { NextRequest } from 'next/server';
import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoPatchSale } from '@/lib/demoStore';

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

// PATCH /api/sales/[id] {paid} -> recompute due
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const paid = num(body?.paid);
    if (isDemoMode()) {
      const sale = demoPatchSale(Number(id), paid);
      if (!sale) return Response.json({ error: 'বিক্রি পাওয়া যায়নি' }, { status: 404 });
      return Response.json({ sale, demo: true });
    }
    const { client, error } = getAdminClient();
    if (error) return error;

    const { data: sale, error: fetchError } = await client
      .from('sales')
      .select('total')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const total = num(sale.total);
    const { data, error: updateError } = await client
      .from('sales')
      .update({ paid, due: total - paid })
      .eq('id', id)
      .select()
      .single();
    if (updateError) throw updateError;
    return Response.json({ sale: { ...data, total, paid: num(data.paid), due: num(data.due) } });
  } catch (e) {
    return handleApiError(e);
  }
}
