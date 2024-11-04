/**
 * vite.config.js
 * -----------------------------------------------
 * A configuration file used by Vite and shadcn/ui.
 * See these pages for more
 *  - https://vite.dev/config/
 *  - https://ui.shadcn.com/docs/installation/vite
 */

import path from "path";
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    },
  },
})
