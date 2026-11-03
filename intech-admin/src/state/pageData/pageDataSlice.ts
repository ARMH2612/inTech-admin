import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { apiRequest, endpointForPage, normalizeRow } from '../../config/api';
import { hasPermission } from '../../lib/access';
import type { AdminUser, ApiRecord, ApiRow, PageName } from '../../types';
import type { ApiMeta } from '../../types/page';

export interface PageDataEntry {
  rows: ApiRow[];
  meta: ApiMeta | null;
  settings: Record<string, unknown> | null;
  loading: boolean;
  error: string;
}

interface PageDataState { byPage: Partial<Record<PageName, PageDataEntry>> }
interface LoadPageArgs { base: string; token: string; user: AdminUser; page: PageName }
interface LoadedPage extends Omit<PageDataEntry, 'loading' | 'error'> { page: PageName }

const blankEntry = (): PageDataEntry => ({ rows: [], meta: null, settings: null, loading: false, error: '' });
const initialState: PageDataState = { byPage: {} };

export const loadPageData = createAsyncThunk<LoadedPage, LoadPageArgs, { rejectValue: { page: PageName; error: string } }>(
  'pageData/load',
  async ({ base, token, user, page }, { rejectWithValue }) => {
    try {
      if (page === 'Vue d’ensemble') {
        const [requests, technicians, unassigned] = await Promise.all([
          hasPermission(user, 'requests') ? apiRequest<ApiRecord>(base, token, '/admin/requests?per_page=100') : Promise.resolve({ requests: [] } as ApiRecord),
          hasPermission(user, 'technicians') ? apiRequest<ApiRecord>(base, token, '/admin/technicians?per_page=100') : Promise.resolve({ technicians: [] } as ApiRecord),
          hasPermission(user, 'assignments') ? apiRequest<ApiRecord>(base, token, '/admin/assignments/unassigned?per_page=100') : Promise.resolve({ requests: [] } as ApiRecord),
        ]);
        const requestList = (requests.requests || []) as ApiRecord[];
        return {
          page,
          rows: requestList.map(item => ({ ...normalizeRow('Demandes', item), _raw: JSON.stringify(item) })),
          meta: {
            total: requests.meta?.total ?? requestList.length,
            technicians: technicians.meta?.total ?? technicians.technicians?.length ?? 0,
            unassigned: unassigned.meta?.total ?? unassigned.requests?.length ?? 0,
          },
          settings: null,
        };
      }
      if (page === 'Réglages') {
        const settings = await apiRequest<Record<string, unknown>>(base, token, '/admin/settings');
        return { page, rows: [], meta: null, settings };
      }
      if (page === 'Assignation') {
        const [unassigned, pending] = await Promise.all([
          apiRequest<ApiRecord>(base, token, '/admin/assignments/unassigned?per_page=100'),
          apiRequest<ApiRecord>(base, token, '/admin/assignments/pending-response?per_page=100'),
        ]);
        const combined = [
          ...((unassigned.requests || []) as ApiRecord[]).map(item => ({ ...item, assignment_bucket: 'À assigner' })),
          ...((pending.requests || []) as ApiRecord[]).map(item => ({ ...item, assignment_bucket: 'Réponse attendue' })),
        ];
        return { page, rows: combined.map(item => ({ ...normalizeRow('Demandes', item), File: item.assignment_bucket, _raw: JSON.stringify(item) })), meta: unassigned.meta || null, settings: null };
      }

      const endpoint = endpointForPage[page];
      if (!endpoint) return { page, rows: [], meta: null, settings: null };
      const result = await apiRequest<ApiRecord>(base, token, endpoint[0]);
      if (!endpoint[1]) return { page, rows: [], meta: null, settings: result };
      const list = result[endpoint[1]] || [];
      return {
        page,
        rows: (Array.isArray(list) ? list : []).map((item: ApiRecord) => ({ ...normalizeRow(page, item), _raw: JSON.stringify(item) })),
        meta: result.meta || null,
        settings: null,
      };
    } catch (error) {
      return rejectWithValue({ page, error: error instanceof Error ? error.message : String(error) });
    }
  },
);

const pageDataSlice = createSlice({
  name: 'pageData',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(loadPageData.pending, (state, action) => {
        const entry = state.byPage[action.meta.arg.page] || blankEntry();
        entry.loading = true;
        entry.error = '';
        state.byPage[action.meta.arg.page] = entry;
      })
      .addCase(loadPageData.fulfilled, (state, action) => {
        state.byPage[action.payload.page] = { ...action.payload, loading: false, error: '' };
      })
      .addCase(loadPageData.rejected, (state, action) => {
        const page = action.payload?.page || action.meta.arg.page;
        const entry = state.byPage[page] || blankEntry();
        entry.loading = false;
        entry.error = action.payload?.error || action.error.message || 'Impossible de charger les données.';
        state.byPage[page] = entry;
      });
  },
});

export const selectPageData = (state: { pageData: PageDataState }, page: PageName) => state.pageData.byPage[page] || blankEntry();
export default pageDataSlice.reducer;

