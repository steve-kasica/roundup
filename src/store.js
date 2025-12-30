/**
 * @fileoverview Redux store configuration with saga middleware.
 * @module store
 *
 * Configures the central Redux store with all application reducers
 * and saga middleware for handling side effects.
 *
 * Features:
 * - Redux Toolkit configureStore for simplified setup
 * - Normalized state slices (ui, operations, tables, columns, alerts)
 * - Redux Saga middleware for async operations
 * - Root saga initialization on store creation
 *
 * State Structure:
 * - ui: Global UI state (selections, focus, visibility)
 * - operations: Stack and pack operations
 * - tables: Source table data and metadata
 * - columns: Column definitions and statistics
 * - alerts: Validation warnings and errors
 *
 * @example
 * import store from './store';
 * <Provider store={store}><App /></Provider>
 */
import { configureStore } from "@reduxjs/toolkit";

import uiReducer from "./slices/uiSlice";
import tablesReducer from "./slices/tablesSlice";
import columnsReducer from "./slices/columnsSlice";
import operationsReducer from "./slices/operationsSlice";
import alertsReducer from "./slices/alertsSlice";

import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";

const sagaMidddleware = createSagaMiddleware();

const store = configureStore({
  reducer: {
    ui: uiReducer,
    operations: operationsReducer,
    tables: tablesReducer,
    columns: columnsReducer,
    alerts: alertsReducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(sagaMidddleware),
});

sagaMidddleware.run(rootSaga);

// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
// setupListeners(store.dispatch)

export default store;
