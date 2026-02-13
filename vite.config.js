/**
 * @fileoverview Vite build and development configuration.
 * @module vite.config
 * @see {@link https://vite.dev/config} for Vite configuration options
 *
 * Configures the Vite bundler for React development with SWC,
 * Vitest testing, and production build settings.
 *
 * Features:
 * - React plugin with SWC for fast compilation
 * - Vitest configuration with jsdom environment
 * - Custom build output to module directory
 * - Path alias (@) for src directory imports
 * - Relative base path for deployment flexibility
 */
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { createHtmlPlugin } from "vite-plugin-html";
import pkg from "./package.json";

export default defineConfig({
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          name: pkg.name,
          version: pkg.version,
          title: pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1),
        },
      },
    }),
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
  },
  build: {
    outDir: "./build",
    rollupOptions: {
      output: {
        entryFileNames: "open-roundup.js",
        assetFileNames: "open-roundup.[ext]",
      },
      external: ["public/command"],
    },
  },
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
