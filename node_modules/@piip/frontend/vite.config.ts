import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true, // Ensure port 5173 is always used
    proxy: {
      '/api': {
        target: 'http://backend:5001', // Docker service name
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
