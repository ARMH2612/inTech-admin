import type { AdminUser, ApiRow, PageName } from '../types';

export interface ScreenPageProps {
  base: string;
  token: string;
  user: AdminUser;
  query: string;
  onSelect: (row: ApiRow) => void;
}



export interface ApiMeta {
  total?: number;
  technicians?: number;
  unassigned?: number;
  current_page?: number;
  last_page?: number;
}

export interface ScreenPageData {
  page: PageName;
  rows: ApiRow[];
  visibleRows: ApiRow[];
  meta: ApiMeta | null;
  settings: Record<string, unknown> | null;
  loading: boolean;
  error: string;
  refresh: () => void;
}

