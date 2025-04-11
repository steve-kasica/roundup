import slice from "./compositeSchemaSlice.js"

export * from "./types";
export const {createOperation, removeOperation, removeTable} = slice.actions;
export default slice.reducer;