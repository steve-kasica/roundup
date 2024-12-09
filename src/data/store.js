import { configureStore } from "@reduxjs/toolkit";
import schemaReducer from "./schemaSlice";
import { tableAPI } from "../services/table";

const store = configureStore({
    reducer: {
        
        schema: schemaReducer,

        // Add the generated reducer as a specific top-level slice
        [tableAPI.reducerPath]: tableAPI.reducer
    },
    // Adding the api middleware enables caching, invalidation, polling,
    // and other useful features of `rtk-query`.
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(tableAPI.middleware),
});


// optional, but required for refetchOnFocus/refetchOnReconnect behaviors
// see `setupListeners` docs - takes an optional callback as the 2nd arg for customization
// setupListeners(store.dispatch)

export default store;

