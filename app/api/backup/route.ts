import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoBackup } from '@/lib/demoStore';

// GET /api/backup -> {products, sales(with items), expenses}
export async function GET() {
  try {
    if (isDemoMode()) return Response.json(demoBackup());
    const { client, error } = getAdminClient();
    if (error) return error;
    const [p, s, e] = await Promise.all([
      client.from('products').select('*').order('id'),
      client.from('sales').select('*, items:sale_items(*)').order('date', { ascending: false }).order('id', { ascending: false }),
      client.from('expenses').select('*').order('date', { ascending: false }).order('id', { ascending: false }),
    ]);
    if (p.error) throw p.error;
    if (s.error) throw s.error;
    if (e.error) throw e.error;
    return Response.json({
      exported_at: new Date().toISOString(),
      products: p.data,
      sales: s.data,
      expenses: e.data,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
