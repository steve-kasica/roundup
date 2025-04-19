
 
/**
 * Get source table metadata for all tables that are a child
 * of the focused operation, with columnIds associated with
 * the given tables.
 */
// export const getFocusedOperationTablesWithColumns = createSelector(
//     [
//         state => state.compositeSchema.data,
//         state => state.sourceTables.data,
//         state => state.sourceColumns.data,
//         state => state.ui.focused.operation,
//     ],
//     (
//         schemaData, 
//         sourceTablesData, 
//         sourceColumnsData, 
//         focusedOperationId
//     ) => Object.values(schemaData)
//             .filter(node => 
//                 isTableNode(node) && node.parentId === focusedOperationId
//             )
//             .map(node => ({
//                 ...sourceTablesData[node.tableId],
//                 columnIds: sourceColumnsData[node.tableId].columns
//                     .map(({id}) => id),
//             }))
// );

// export const stratify = d3Stratify()
//     .id(d => d.id)
//     .parentId(d => d.parentId || null);

// export const getRoot = createSelector(
//     state => state.compositeSchema.data,
//     (data) => Object.keys(data).length > 0
//         ? stratify(Object.values(data))
//         : null
// );


// export const getOperations = createSelector(
//     state => state.compositeSchema.data,
//     (data) => Object.values(data)
//         .filter(isOperationNode)
//         .sort(({id: a}, {id: b}) => descending(a,b))
// );



// // TODO: memoize, if necessary
// export const getMaxColumnsInOperation = (state, operationNodeId) => {
//     const columnCounts = Object.values(state.compositeSchema.data)
//         .filter(node => isTableNode(node) && node.parentId === operationNodeId)
//         .map(tableNode => state.sourceTables.data[tableNode.tableId].columnCount);
//     const max = Math.max(...columnCounts);
//     return max;
// }



// /**
//  * Determines whether the specified column is currently being hovered over
//  * 
//  * @param {Object} state - The Redux state object
//  * @param {Object} column - The column object to check
//  * @param {string} column.tableId - The ID of the table this column belongs to
//  * @param {number} column.index - The index of the column within its table
//  * @returns {boolean} True if the column is being hovered over, false otherwise
//  */
// export const isColumnHover = (state, column) => {
//     const hoverTable = getHoverTable(state);
//     const isTableMatch = isTableHover(state, column.tableId);
//     const hoverColumnIndex = getHoverColumnIndex(state);
//     return (
//         (isTableMatch && (hoverColumnIndex === column.index || hoverColumnIndex === initialState.ui.hover.columnIndex)) ||
//         (hoverColumnIndex === column.index && hoverTable === initialState.ui.hover.table)
//     );    
// }

// export const getHoverOperationTablesIds = (state) => {
//     const hoverOperationId = state.ui.hover.operation;
//     if (hoverOperationId) {
//         return Object.values(state.compositeSchema.data)
//             .filter((node) => isTableNode(node) && node.parentId === hoverOperationId)
//             .map(node => node.tableId);
//     } else {
//         return [];
//     } 
// };