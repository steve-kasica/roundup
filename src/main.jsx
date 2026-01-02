/**
 * @fileoverview Application entry point and root renderer.
 * @module main
 *
 * Bootstraps the React application with all necessary providers and
 * renders to the DOM. Configures development environment with mock server.
 *
 * Features:
 * - React 18 createRoot API for concurrent rendering
 * - Redux store provider for global state management
 * - React StrictMode for development warnings
 * - Conditional mock server initialization in development
 *
 * @example
 * // Entry point - no direct usage, loaded by Vite
 */
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import store from "./store.js";
import { Provider } from "react-redux";
import makeServer from "../mock-data";

if (process.env.NODE_ENV === "development") {
  makeServer();
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
