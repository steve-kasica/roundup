import { configureStore } from "@reduxjs/toolkit";
import schemaReducer from "./schemaSlice";
import { tableAPI } from "../services/table";
import { workflowAPI } from "../services/workflows";

const store = configureStore({
    reducer: {
        
        schema: schemaReducer,

        // Add the generated reducer as a specific top-level slices
        [tableAPI.reducerPath]: tableAPI.reducer,
        [workflowAPI.reducerPath]: workflowAPI.reducer

    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware()
    .concat(tableAPI.middleware)
    .concat(workflowAPI.middleware),
});


// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
// setupListeners(store.dispatch)

export default store;

