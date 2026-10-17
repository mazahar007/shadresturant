'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { resolveRange, todayDhaka, type ResolvedRange } from './dates';

export interface DateFilter {
  filter: string;
  date: string;
  from: string;
  to: string;
  range: ResolvedRange;
  label: string;
  setFilter: (f: string) => void;
  selectDate: (d: string) => void;
  setRange: (f: string, t: string) => void;
  clear: () => void;
}

/**
 * Date filter state living in URL search params:
 * ?filter=today|yesterday|week|month|all|custom & date=YYYY-MM-DD & from & to
 */
export function useDateFilter(): DateFilter {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filter = searchParams.get('filter') || 'today';
  const date = searchParams.get('date') || todayDhaka();
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const range = useMemo(() => resolveRange(filter, date, from, to), [filter, date, from, to]);

  const push = useCallback(
    (params: URLSearchParams) => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [router, pathname],
  );

  const setFilter = useCallback(
    (f: string) => {
      push(new URLSearchParams({ filter: f }));
    },
    [push],
  );

  const selectDate = useCallback(
    (d: string) => {
      push(new URLSearchParams({ filter: 'custom', date: d }));
    },
    [push],
  );

  const setRange = useCallback(
    (f: string, t: string) => {
      push(new URLSearchParams({ filter: 'custom', from: f, to: t }));
    },
    [push],
  );

  const clear = useCallback(() => setFilter('today'), [setFilter]);

  return {
    filter,
    date,
    from,
    to,
    range,
    label: range.label,
    setFilter,
    selectDate,
    setRange,
    clear,
  };
}
