import slice from "./compositeSchemaSlice.js"

export {isOperationNode, isTableNode} from "./compositeSchemaSlice.js"
export const {createOperation, removeOperation, removeTable} = slice.actions;
export default slice.reducer;