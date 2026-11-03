import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadPageData, selectPageData, useAppDispatch, useAppSelector } from '../state';
import type { ScreenPageData } from '../types/page';
import type { AdminUser, PageName } from '../types';

interface UsePageDataArgs { base: string; token: string; user: AdminUser; page: PageName; query: string }

export function usePageData({ base, token, user, page, query }: UsePageDataArgs): ScreenPageData {
  const dispatch = useAppDispatch();
  const data = useAppSelector(state => selectPageData(state, page));
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    void dispatch(loadPageData({ base, token, user, page }));
  }, [dispatch, base, token, user, page, refreshKey]);

  const visibleRows = useMemo(
    () => data.rows.filter(row => Object.values(row).join(' ').toLowerCase().includes(query.toLowerCase())),
    [data.rows, query],
  );
  const refresh = useCallback(() => setRefreshKey(value => value + 1), []);
  return { page, rows: data.rows, visibleRows, meta: data.meta, settings: data.settings, loading: data.loading, error: data.error, refresh };
}
