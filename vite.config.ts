import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      }
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separar componentes de administrador y cliente
          if (id.includes('/admin/') || id.includes('pages/admin/')) {
            return 'admin';
          }
          if (id.includes('/customer/') || id.includes('pages/customer/')) {
            return 'customer';
          }
          if (id.includes('lucide-react') || id.includes('/ui/') || id.includes('/components/')) {
            return 'ui';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('react-router') || id.includes('/pages/')) {
            return 'app';
          }
          if (id.includes('/utils/') || id.includes('/services/') || id.includes('/stores/')) {
            return 'utils';
          }
          if (id.includes('node_modules')) {
            return 'vendor-other';
          }
        }
      },
    },
    cssCodeSplit: false,
    assetsInlineLimit: 8192,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
}); 