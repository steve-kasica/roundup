import slice from "./operationsSlice";
export * from "./Operation";

export const {
    addOperation,
    addTableToDeepestOperation,
    createOperation,
    removeOperation,
    updateOperation,
    addChildrenToLastOperation,
    addNewChildren,
} = slice.actions;

export default slice.reducer;