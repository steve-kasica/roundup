/**
 * vite.config.js
 * -----------------------------------------------
 * A configuration file used by Vite
 * See these https://vite.dev/config for more.
 */

import path from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, '../../module'),
    rollupOptions: {
      output: {
        entryFileNames: 'open-roundup.js',
        assetFileNames: 'open-roundup.[ext]'
      },
      external: [
        'public/command'
      ]
    }
  },
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
})
