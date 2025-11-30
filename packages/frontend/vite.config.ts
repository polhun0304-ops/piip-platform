import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: false, // Allow using next available port
    historyApiFallback: true, // Enable SPA routing support
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Local development
        changeOrigin: true,
        secure: false,
      },
      // Proxy socket.io websocket connections in dev
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
