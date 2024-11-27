import { configureStore } from "@reduxjs/toolkit";
import schemaReducer from "./schemaSlice";

const store = configureStore({
    reducer: {
        schema: schemaReducer
    }
});

export default store;

