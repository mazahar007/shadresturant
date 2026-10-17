import { NextRequest } from 'next/server';
import { getAdminClient, handleApiError, isDemoMode } from '@/lib/supabaseAdmin';
import { demoListExpenses, demoCreateExpense } from '@/lib/demoStore';
import type { Expense } from '@/lib/types';

const num = (v: unknown, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

function normExpense(e: Record<string, unknown>): Expense {
  return { ...(e as object), amount: num(e.amount) } as Expense;
}

// GET /api/expenses?from&to
export async function GET(req: NextRequest) {
  try {
    const from = req.nextUrl.searchParams.get('from') || undefined;
    const to = req.nextUrl.searchParams.get('to') || undefined;
    if (isDemoMode()) return Response.json({ expenses: demoListExpenses(from, to), demo: true });
    const { client, error } = getAdminClient();
    if (error) return error;
    let q = client.from('expenses').select('*').order('date', { ascending: false }).order('id', { ascending: false });
    if (from) q = q.gte('date', from);
    if (to) q = q.lte('date', to);
    const { data, error: dbError } = await q;
    if (dbError) throw dbError;
    return Response.json({ expenses: (data || []).map(normExpense) });
  } catch (e) {
    return handleApiError(e);
  }
}

// POST /api/expenses {date,cat,amount,note}
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    if (!b?.date || !b?.cat) return Response.json({ error: 'তারিখ ও ক্যাটাগরি দরকার' }, { status: 400 });
    if (isDemoMode()) return Response.json({ expense: demoCreateExpense(b), demo: true });
    const { client, error } = getAdminClient();
    if (error) return error;
    const { data, error: dbError } = await client
      .from('expenses')
      .insert({ date: b.date, cat: b.cat, amount: num(b.amount), note: b.note || null })
      .select()
      .single();
    if (dbError) throw dbError;
    return Response.json({ expense: normExpense(data) });
  } catch (e) {
    return handleApiError(e);
  }
}
