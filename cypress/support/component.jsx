/**
 * @fileoverview Cypress component testing support file.
 * @module cypress/support/component
 *
 * This file is loaded before every component test. It sets up:
 * - Custom mount command with required providers
 * - Global test utilities
 * - CSS imports
 */
import { mount } from "cypress/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "@mui/material/styles";

import { themeDefault } from "../../src/themes";
import uiReducer, {
  initialState as defaultUiState,
} from "../../src/slices/uiSlice";
import operationsReducer, {
  initialState as defaultOperationsState,
} from "../../src/slices/operationsSlice";
import tablesReducer, {
  initialState as defaultTablesState,
} from "../../src/slices/tablesSlice";
import columnsReducer, {
  initialState as defaultColumnsState,
} from "../../src/slices/columnsSlice";
import alertsReducer, {
  initialState as defaultAlertsState,
} from "../../src/slices/alertsSlice";

// Import global styles
import "../../src/App.css";

// Add custom Cypress commands
import "./commands";

/**
 * Creates a configured test store with optional initial state overrides.
 * @param {Object} preloadedState - Optional state overrides for each slice.
 * @returns {Object} Configured Redux store for testing.
 */
function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      ui: uiReducer,
      operations: operationsReducer,
      tables: tablesReducer,
      columns: columnsReducer,
      alerts: alertsReducer,
    },
    preloadedState: {
      ui: { ...defaultUiState, ...preloadedState.ui },
      operations: { ...defaultOperationsState, ...preloadedState.operations },
      tables: { ...defaultTablesState, ...preloadedState.tables },
      columns: { ...defaultColumnsState, ...preloadedState.columns },
      alerts: { ...defaultAlertsState, ...preloadedState.alerts },
    },
  });
}

/**
 * Custom mount command that wraps components with all required providers.
 * @param {React.ReactElement} component - The component to mount.
 * @param {Object} options - Mount options.
 * @param {Object} options.preloadedState - Optional Redux state overrides.
 * @returns {Cypress.Chainable} Cypress chainable with store attached.
 */
Cypress.Commands.add("mountWithProviders", (component, options = {}) => {
  const { preloadedState = {}, ...mountOptions } = options;
  const store = createTestStore(preloadedState);

  const wrapped = (
    <Provider store={store}>
      <ThemeProvider theme={themeDefault}>
        <DndProvider backend={HTML5Backend}>{component}</DndProvider>
      </ThemeProvider>
    </Provider>
  );

  return mount(wrapped, mountOptions).then(() => {
    // Return the store for assertions
    return cy.wrap({ store });
  });
});

// Make the basic mount command available as well
Cypress.Commands.add("mount", mount);
