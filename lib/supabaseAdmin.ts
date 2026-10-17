import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client. SERVER-ONLY — never import this from a
 * client component. All browser data flows through /api/* routes.
 */

const ENV_ERROR =
  'SUPABASE_URL বা SUPABASE_SERVICE_ROLE_KEY সেট করা নেই। Vercel → Settings → Environment Variables এ যোগ করুন।';

/** True when Supabase env vars are missing → API routes serve the in-memory demo store. */
export function isDemoMode(): boolean {
  return !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function getAdminClient(): { client: SupabaseClient; error: null } | { client: null; error: Response } {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return { client: null, error: Response.json({ error: ENV_ERROR }, { status: 500 }) };
  }
  return { client: createClient(url, key), error: null };
}

/** Wrap a route handler so unexpected errors become Bengali 500 JSON. */
export function handleApiError(e: unknown): Response {
  console.error('[api]', e);
  const message = e instanceof Error ? e.message : 'সার্ভারে সমস্যা হয়েছে';
  return Response.json({ error: message }, { status: 500 });
}
