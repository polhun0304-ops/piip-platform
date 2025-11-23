import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
// TEMP: SDK import disabled until package.json is created
// import { AuthService, OpenAPI, type UserSummary } from '../../../sdk';

// Temporary type definitions
type UserSummary = {
  id: string;
  email: string;
  name?: string;
};

const AuthService = {
  getCurrentUser: async (): Promise<UserSummary> => {
    throw new Error('Backend not available');
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login: async (_params: any): Promise<any> => {
    throw new Error('Backend not available');
  },
};

const OpenAPI = {
  TOKEN: undefined as string | undefined,
};

export interface AuthState {
  token: string | null;
  user: UserSummary | null;
  loading: boolean;
  error?: string;
  remember: boolean;
}

const STORAGE_KEY = 'auth_token';

export const initializeAuthFromStorage = createAsyncThunk(
  'auth/initializeFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (token) {
        OpenAPI.TOKEN = token;
        // Optional: fetch current user for hydration
        // TEMP: Skip API call if backend is not running
        try {
          const me = (await Promise.race([
            AuthService.getCurrentUser(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
          ])) as UserSummary;
          return { token, user: me } as { token: string; user: UserSummary };
        } catch (apiError) {
          console.warn('⚠️ Could not fetch user (backend may be offline):', apiError);
          return { token, user: null };
        }
      }
      return { token: null, user: null };
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Auth init failed');
    }
  }
);

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (params: { email: string; password: string; remember: boolean }, { rejectWithValue }) => {
    try {
      const res = await AuthService.login({
        requestBody: { email: params.email, password: params.password },
      });
      const token = res.accessToken ?? '';
      if (!token) throw new Error('No access token received');
      OpenAPI.TOKEN = token;
      if (params.remember) {
        localStorage.setItem(STORAGE_KEY, token);
        sessionStorage.removeItem(STORAGE_KEY);
      } else {
        sessionStorage.setItem(STORAGE_KEY, token);
        localStorage.removeItem(STORAGE_KEY);
      }
      // Fetch current user after login
      const me = res.user ?? (await AuthService.getCurrentUser());
      return { token, user: me } as { token: string; user: UserSummary };
    } catch (e: any) {
      return rejectWithValue(e?.message ?? 'Login failed');
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async () => {
  // If there is a logout API, call it here
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  OpenAPI.TOKEN = undefined;
});

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: undefined,
  remember: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRemember(state, action: PayloadAction<boolean>) {
      state.remember = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuthFromStorage.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(initializeAuthFromStorage.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user as any;
      })
      .addCase(initializeAuthFromStorage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.token = null;
        state.user = null;
      });
  },
});

export const { setRemember } = authSlice.actions;
export default authSlice.reducer;
