import { defineConfig } from 'vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [glsl()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        entryFileNames: '[name]-[hash].js',
        chunkFileNames: '[name]-[hash].js',
        assetFileNames: '[name]-[hash].[ext]'
      }
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=0'
    }
  }
});