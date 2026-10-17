import { isDemoMode } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

// GET /api/health -> {demo: boolean}
export async function GET() {
  return Response.json({ demo: isDemoMode(), ok: true });
}
