// Dhaka timezone helpers + Bengali date formatting + filter range resolver.

export const BN_MONTHS = [
  'জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন',
  'জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর',
];

export const BN_WEEKDAYS = ['রবি','সোম','মঙ্গল','বুধ','বৃহ','শুক্র','শনি'];

/** Today's date (YYYY-MM-DD) in Asia/Dhaka. */
export function todayDhaka(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Dhaka',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Shift a YYYY-MM-DD date by n days, returns YYYY-MM-DD. */
export function shiftDate(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  const yy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/** Yesterday (YYYY-MM-DD) in Asia/Dhaka. */
export function yesterdayDhaka(): string {
  return shiftDate(todayDhaka(), -1);
}

/** "2026-10-16" -> "16 অক্টোবর 2026" */
export function formatBn(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [y, m, d] = parts;
  if (m < 1 || m > 12) return dateStr;
  return `${d} ${BN_MONTHS[m - 1]} ${y}`;
}

/** Days of a month for calendar grids. Leading nulls pad the first week. */
export function getDaysInMonth(monthDate: Date): (Date | null)[] {
  const y = monthDate.getFullYear();
  const mo = monthDate.getMonth();
  const first = new Date(y, mo, 1);
  const last = new Date(y, mo + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let i = 1; i <= last.getDate(); i++) days.push(new Date(y, mo, i));
  return days;
}

/** Date -> YYYY-MM-DD (local fields, no timezone shift). */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export type FilterType = 'today' | 'yesterday' | 'week' | 'month' | 'all' | 'custom';

export interface ResolvedRange {
  from?: string;
  to?: string;
  label: string;
}

/** Resolve a filter + URL params into a date range + Bengali label. */
export function resolveRange(
  filter: string,
  date: string,
  from: string,
  to: string,
): ResolvedRange {
  const today = todayDhaka();
  switch (filter) {
    case 'yesterday': {
      const y = yesterdayDhaka();
      return { from: y, to: y, label: 'গতকালের হিসাব' };
    }
    case 'week':
      return { from: shiftDate(today, -6), to: today, label: 'এই সপ্তাহের হিসাব' };
    case 'month':
      return { from: today.slice(0, 7) + '-01', to: today, label: 'এই মাসের হিসাব' };
    case 'all':
      return { label: 'সব সময়ের হিসাব' };
    case 'custom':
      if (from && to)
        return { from, to, label: `${formatBn(from)} থেকে ${formatBn(to)}` };
      if (date)
        return { from: date, to: date, label: `${formatBn(date)} এর হিসাব` };
      return { from: today, to: today, label: 'আজকের হিসাব' };
    case 'today':
    default:
      return { from: today, to: today, label: 'আজকের হিসাব' };
  }
}
