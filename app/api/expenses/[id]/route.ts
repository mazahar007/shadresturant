import { NextRequest } from 'next/server';
import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoDeleteExpense } from '@/lib/demoStore';

// DELETE /api/expenses/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (isDemoMode()) {
      const ok = demoDeleteExpense(Number(id));
      if (!ok) return Response.json({ error: 'খরচ পাওয়া যায়নি' }, { status: 404 });
      return Response.json({ ok: true, demo: true });
    }
    const { client, error } = getAdminClient();
    if (error) return error;
    const { error: dbError } = await client.from('expenses').delete().eq('id', id);
    if (dbError) throw dbError;
    return Response.json({ ok: true });
  } catch (e) {
    return handleApiError(e);
  }
}
