import { StrictMode, useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { PaletteMode } from '@mui/material';

import App from './App';
import { store } from './store';
import { createAppTheme } from './theme';
import ErrorBoundary from './ErrorBoundary';
import { initializeAuthFromStorage } from './store/slices/authSlice';

console.log('🚀 PIIP Platform 시작...');

const queryClient = new QueryClient();

/**
 * Theme wrapper component to manage dynamic theme switching
 */
function ThemedApp() {
  const [mode] = useState<PaletteMode>(() => {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme as PaletteMode;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
  }, [mode]);

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('✅ Root element found:', rootElement);

const root = createRoot(rootElement);

console.log('✅ React root created');

// Wait for auth init to complete before mounting the app to ensure
// components relying on auth (routes, redirects, case lists) render deterministically.
async function initApp() {
  try {
    await store.dispatch(initializeAuthFromStorage());
  } catch (e) {
    // initialization failed, but we still continue to mount the app
    console.warn('Auth initialization failed or timed out', e);
  }

  root.render(
    <StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <ThemedApp />
            </BrowserRouter>
          </QueryClientProvider>
        </Provider>
      </ErrorBoundary>
    </StrictMode>
  );

  console.log('✅ React app rendered');
}

initApp();
