import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { SESSION_COOKIE, createSessionToken, getExpectedPasscode, isDemoMode } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// POST /api/auth/login {passcode}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const expected = getExpectedPasscode();
  if (!expected) {
    return Response.json(
      { error: 'ADMIN_PASSCODE সেট করা নেই। Vercel → Settings → Environment Variables এ ADMIN_PASSCODE যোগ করে redeploy করুন।' },
      { status: 500 },
    );
  }
  const given = Buffer.from(String(body?.passcode ?? ''));
  const want = Buffer.from(expected);
  const match = given.length === want.length && timingSafeEqual(given, want);
  if (!match) {
    return Response.json({ error: 'ভুল পাসকোড' }, { status: 401 });
  }
  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true, demo: isDemoMode() });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
