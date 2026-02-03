
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Sangat penting untuk GitHub Pages agar path file relatif
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
});
