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
