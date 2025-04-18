import slice from "./operationsSlice";
export * from "./Operation";

export const {
    addOperation,
    addTableToDeepestOperation,
    createOperation,
    removeOperation,
    updateOperation,
    addChildrenToOperation,
} = slice.actions;

export default slice.reducer;