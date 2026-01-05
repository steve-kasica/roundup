/**
 * @fileoverview Cypress configuration for component testing.
 * @module cypress.config
 * @see {@link https://docs.cypress.io/guides/references/configuration} for configuration options
 *
 * Configures Cypress for component testing with React and Vite.
 * This enables browser-based testing with full CSS support including
 * container queries, which are not supported in jsdom.
 */
import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "src/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/component.jsx",
    indexHtmlFile: "cypress/support/component-index.html",
  },
  // Video recording settings
  video: false,
  // Screenshot settings
  screenshotOnRunFailure: true,
  // Viewport settings
  viewportWidth: 1280,
  viewportHeight: 720,
});
