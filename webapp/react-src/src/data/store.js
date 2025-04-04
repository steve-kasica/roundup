import { configureStore } from "@reduxjs/toolkit";

import schemaReducer from "./schemaSlice";
import uiReducer from "./uiSlice";
import issuesReducer from "./issuesSlice";
import tableTreeReducer from "./tableTreeSlice";
import sourceTablesReducer from "./slices/sourceTablesSlice";
import sourceColumnsReducer from "./slices/sourceColumnsSlice";
import compositeSchemaReducer from "./slices/compositeSchemaSlice";

import { tableAPI } from "../services/table";
import { workflowAPI } from "../services/workflows";
import { listenerMiddleware } from "../listenerMiddleware";
import createSagaMiddleware from "redux-saga";
import rootSaga from "./sagas";

const sagaMidddleware = createSagaMiddleware();

const store = configureStore({
    reducer: {
        
        schema: schemaReducer,
        issues: issuesReducer,
        ui: uiReducer,
        tableTree: tableTreeReducer,
        sourceTables: sourceTablesReducer,
        sourceColumns: sourceColumnsReducer,
        compositeSchema: compositeSchemaReducer,

        // Add the generated reducer as a specific top-level slices
        [tableAPI.reducerPath]: tableAPI.reducer,
        [workflowAPI.reducerPath]: workflowAPI.reducer

    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
        .concat(tableAPI.middleware)
        .concat(workflowAPI.middleware)
        .concat(sagaMidddleware)
        .prepend(listenerMiddleware.middleware),
});

sagaMidddleware.run(rootSaga);


// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
// setupListeners(store.dispatch)

export default store;

