import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_BASE_URL, apiRequest, getSavedToken, normalizeApiBase, saveToken } from '../../config/api';
import type { ApiSession, AdminUser } from '../../types';
import type { RootState } from '../store';

interface AuthState {
  session: ApiSession | null;
  checking: boolean;
  loginLoading: boolean;
  loginError: string;
}

const configuredBase = normalizeApiBase(API_BASE_URL);
const requestBase = import.meta.env.DEV ? '' : configuredBase;

const initialState: AuthState = {
  session: null,
  checking: Boolean(getSavedToken() && configuredBase),
  loginLoading: false,
  loginError: '',
};

export const restoreSession = createAsyncThunk<ApiSession | null>('auth/restoreSession', async () => {
  const token = getSavedToken();
  if (!token || !configuredBase) return null;
  try {
    const profile = await apiRequest<{ user: AdminUser }>(requestBase, token, '/admin/me');
    return { base: requestBase, token, user: profile.user };
  } catch {
    saveToken(null);
    return null;
  }
});

export const loginAdmin = createAsyncThunk<ApiSession, { email: string; password: string }, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      if (!configuredBase) throw new Error('API non configurée. Définissez VITE_API_BASE_URL dans .env.local puis redémarrez Vite.');
      const auth = await apiRequest<{ token?: string; user?: AdminUser }>(requestBase, null, '/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (!auth.token) throw new Error('La réponse de connexion ne contient pas de jeton.');
      const profile = await apiRequest<{ user?: AdminUser }>(requestBase, auth.token, '/admin/me');
      const user = profile.user || auth.user;
      if (!user) throw new Error('Le profil administrateur est absent de la réponse.');
      saveToken(auth.token);
      return { base: requestBase, token: auth.token, user };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : String(error));
    }
  },
);

export const logoutAdmin = createAsyncThunk<void, void, { state: RootState }>('auth/logout', async (_, { getState }) => {
  const session = getState().auth.session;
  saveToken(null);
  if (session) await apiRequest(session.base, session.token, '/admin/logout', { method: 'POST' }).catch(() => undefined);
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearLoginError(state) { state.loginError = ''; },
  },
  extraReducers(builder) {
    builder
      .addCase(restoreSession.pending, state => { state.checking = true; })
      .addCase(restoreSession.fulfilled, (state, action) => { state.session = action.payload; state.checking = false; })
      .addCase(restoreSession.rejected, state => { state.session = null; state.checking = false; saveToken(null); })
      .addCase(loginAdmin.pending, state => { state.loginLoading = true; state.loginError = ''; })
      .addCase(loginAdmin.fulfilled, (state, action) => { state.session = action.payload; state.loginLoading = false; })
      .addCase(loginAdmin.rejected, (state, action) => { state.loginLoading = false; state.loginError = action.payload || action.error.message || 'Connexion impossible.'; })
      .addCase(logoutAdmin.fulfilled, state => { state.session = null; state.loginError = ''; })
      .addCase(logoutAdmin.rejected, state => { state.session = null; });
  },
});

export const { clearLoginError } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export default authSlice.reducer;
