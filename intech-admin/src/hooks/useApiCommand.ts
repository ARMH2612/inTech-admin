import { useState } from 'react';
import { apiRequest } from '../config/api';

export function useApiCommand(base: string, token: string, refresh: () => void) {
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function run(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: Record<string, unknown>, success = 'Action effectuée.') {
    setBusy(true); setError('');
    try {
      await apiRequest(base, token, path, { method, ...(body ? { body: JSON.stringify(body) } : {}) });
      setNotice(success); refresh(); window.setTimeout(() => setNotice(''), 4500);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setBusy(false); }
  }
  return { run, notice, error, busy };
}
