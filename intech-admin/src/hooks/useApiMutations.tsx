import { useMemo, useState } from 'react';
import { apiRequest } from '../config/api';
import { MutationDrawer, type MutationField } from '../components/MutationDrawer';
import type { ApiRecord, ApiRow } from '../types';

type MutationMethod = 'POST' | 'PUT' | 'PATCH' | 'DELETE';
interface Operation { method: MutationMethod; path: string | ((item: ApiRecord) => string); fields?: MutationField[]; payload?: (values: Record<string, unknown>, item?: ApiRecord) => ApiRecord; successMessage?: string }
interface UseApiMutationsArgs {
  base: string;
  token: string;
  title: string;
  refresh: () => void;
  create?: Operation;
  update?: Operation;
  remove?: Operation;
}
type EditorState = { mode: 'create' } | { mode: 'edit' | 'delete'; item: ApiRecord };

function rowRecord(row: ApiRow): ApiRecord {
  try { return row._raw ? JSON.parse(row._raw) as ApiRecord : { id: row._id }; }
  catch { return { id: row._id }; }
}

function valueForField(value: unknown, field: MutationField): unknown {
  if (field.type === 'checkbox') return Boolean(value);
  if (field.type === 'file') return null;
  if (field.type === 'lines' && Array.isArray(value)) return value.join('\n');
  if (field.type === 'id-list' && Array.isArray(value)) return value.join(', ');
  if (field.type === 'date' && typeof value === 'string') return value.slice(0, 10);
  return value == null ? '' : String(value);
}

function valuesFor(item: ApiRecord | null, fields: MutationField[]): Record<string, unknown> {
  return Object.fromEntries(fields.map(field => {
    const value = item?.[field.name] ?? (field.name === 'device_product_ids' && Array.isArray(item?.device_products) ? item.device_products.map((device: ApiRecord) => device.id) : field.defaultValue);
    return [field.name, valueForField(value, field)];
  }));
}

function payloadFor(values: Record<string, unknown>, fields: MutationField[]): ApiRecord | FormData {
  const hasFile = Object.values(values).some(value => typeof File !== 'undefined' && value instanceof File);
  const payload: ApiRecord = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === 'file') {
      if (typeof File !== 'undefined' && value instanceof File) payload[field.name] = value;
      continue;
    }
    if (field.type === 'checkbox') { payload[field.name] = Boolean(value); continue; }
    if (value == null || value === '') continue;
    if (field.type === 'number') payload[field.name] = Number(value);
    else if (field.type === 'lines') payload[field.name] = String(value).split(/\r?\n/).map(item => item.trim()).filter(Boolean);
    else if (field.type === 'id-list') payload[field.name] = String(value).split(',').map(item => Number(item.trim())).filter(Number.isFinite);
    else payload[field.name] = value;
  }
  if (!hasFile) return payload;
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value instanceof File) form.append(key, value);
    else if (Array.isArray(value)) value.forEach(item => form.append(`${key}[]`, String(item)));
    else form.append(key, String(value));
  });
  return form;
}

export function useApiMutations({ base, token, title, refresh, create, update, remove }: UseApiMutationsArgs) {
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const operation = editor?.mode === 'create' ? create : editor?.mode === 'edit' ? update : remove;
  const fields = operation?.fields || [];
  const fieldKey = fields.map(field => field.name).join('|');
  const initialValues = useMemo(() => valuesFor(editor && 'item' in editor ? editor.item : null, fields), [editor, fieldKey]);

  function openCreate() { if (create) { setError(''); setEditor({ mode: 'create' }); } }
  function openEdit(row: ApiRow) { if (update) { setError(''); setEditor({ mode: 'edit', item: rowRecord(row) }); } }
  function editRecord(item: ApiRecord) { if (update) { setError(''); setEditor({ mode: 'edit', item }); } }
  function openDelete(row: ApiRow) { if (remove) { setError(''); setEditor({ mode: 'delete', item: rowRecord(row) }); } }

  async function submit(values: Record<string, unknown>) {
    if (!editor || !operation) return;
    setBusy(true); setError('');
    try {
      const item = 'item' in editor ? editor.item : undefined;
      const path = typeof operation.path === 'function' ? operation.path(item || {}) : operation.path;
      const body = editor.mode === 'delete' ? undefined : operation.payload ? operation.payload(values, item) : payloadFor(values, fields);
      await apiRequest(base, token, path, { method: operation.method, ...(body ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}) });
      const action = editor.mode === 'create' ? 'créé' : editor.mode === 'edit' ? 'modifié' : 'supprimé';
      setNotice(operation.successMessage || `${title} ${action}.`);
      setEditor(null);
      refresh();
      window.setTimeout(() => setNotice(''), 4500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : String(requestError));
    } finally {
      setBusy(false);
    }
  }

  const drawer = editor && operation ? <MutationDrawer key={`${editor.mode}-${'item' in editor ? editor.item.id : 'new'}`} title={title} mode={editor.mode} fields={fields} initialValues={initialValues} busy={busy} error={error} onClose={() => { if (!busy) setEditor(null); }} onSubmit={submit} /> : null;
  return { create: create ? openCreate : undefined, edit: update ? openEdit : undefined, editRecord: update ? editRecord : undefined, remove: remove ? openDelete : undefined, drawer, notice };
}
