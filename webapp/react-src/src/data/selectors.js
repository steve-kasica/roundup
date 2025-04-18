import { createSelector } from "@reduxjs/toolkit";
import { stratify as d3Stratify, descending } from "d3";
import { useSelector } from "react-redux";
import { isOperationNode, isTableNode } from "./slices/compositeSchemaSlice";
import { initialState as uiInitialState } from "./uiSlice";
import { getColumnId } from "./slices/sourceColumnsSlice";

const initialState = {
    ui: uiInitialState
};

export const getMaxOperationDepth = (state) => {
    if (Object.keys(state.operations.entities).length === 0) {
        return 0;
    }
    const maxDepth = Object.values(state.operations.entities)
        .map(operation => operation.depth)
        .reduce((max, depth) => Math.max(max, depth), 0);
    return maxDepth;
}

// TODO: memoize, if necessary
export const getRootOperationId = (state) => {
    const nullParentOperations = Object.values(state.operations.entities)
        .filter(operation => operation.parentId === null);
    if (nullParentOperations.length > 1) {
        throw new Error("Multiple root operations found");
    }
    if (nullParentOperations.length === 0) {
        return null;
    }
    return nullParentOperations[0].id;
}

export const getColumnByTableIndex = (state, tableId, index) => {
    const columnId = getColumnId(tableId, index);
    const column = state.sourceColumns.entries[columnId];
    return column;
}

export const getOperationById = (state, operationId) => {
    const operation = state.operations.entities[operationId];
    return operation;
};

export const getTableById = (state, tableId) => {
    const table = state.sourceTables.data[tableId];
    return table;
};

export const getFocusedColumnId = state => state.ui.focused.column;

export const getHoverOperationId = () => useSelector(state => {
    return state.ui.hover.operation;
});

/**
 * 
 */
export const getColumnById = createSelector(
    [
        state => state.sourceColumns.data,
        (_, tableId) => tableId,
        (_, columnId) => columnId
    ],
    (columnsRequest, tableId, columnId) => columnsRequest[tableId].columns
        .find(({id}) => id === columnId)
);
 
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

export const getOperations = (state) => {
    return Object.values(state.operations.entities);
}
// export const getOperations = createSelector(
//     state => state.compositeSchema.data,
//     (data) => Object.values(data)
//         .filter(isOperationNode)
//         .sort(({id: a}, {id: b}) => descending(a,b))
// );

// TODO: memoize, if necessary
export const getFocusedOperation = (state) => {
    const focusedOperationNodeId = state.ui.focused.operation;
    if (focusedOperationNodeId === null) {
        return null;
    } else {
        const operation = state.operations.entities[focusedOperationNodeId];
        if (operation === undefined) {
            throw new Error("Node not found");
        }
        return operation;
    }
}

// // TODO: memoize, if necessary
// export const getMaxColumnsInOperation = (state, operationNodeId) => {
//     const columnCounts = Object.values(state.compositeSchema.data)
//         .filter(node => isTableNode(node) && node.parentId === operationNodeId)
//         .map(tableNode => state.sourceTables.data[tableNode.tableId].columnCount);
//     const max = Math.max(...columnCounts);
//     return max;
// }

export const getColumnsByTableId = createSelector(
    [
        state => state.sourceColumns.data,
        (_, node) => node.data.tableId,
    ],
    (columnData, tableId) => {
        return null;
    }
);

/**
 * Retrieves the complete focus state object from the UI slice
 * 
 * @param {Object} state - The Redux state object with destructured UI property
 * @param {Object} state.ui - The UI slice of the Redux state
 * @returns {Object} The current focus state object
 */
export const getFocused = ({ui}) => ui.focused;

/**
 * Retrieves the ID of the currently focused operation
 * 
 * @param {Object} state - The Redux state object
 * @returns {string|null} The ID of the currently focused operation
 */
export const getFocusedOperationId = (state) => state.ui.focused.operation;

/**
 * Retrieves the ID of the table currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @returns {string|null} The ID of the table being hovered over
 */
export const getHoverTable = (state) => state.ui.hover.table;

export const getHoverTableId = (state) => {
    const hoverTable = state.ui.hover.table;
    return hoverTable === uiInitialState.hover.table ? null : hoverTable;
};

/**
 * Retrieves the index of the column currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @returns {number|null} The index of the column being hovered over
 */
export const getHoverColumnIndex = (state) => state.ui.hover.columnIndex;

/**
 * Determines whether the specified column is currently being hovered over
 * 
 * @param {Object} state - The Redux state object
 * @param {Object} column - The column object to check
 * @param {string} column.tableId - The ID of the table this column belongs to
 * @param {number} column.index - The index of the column within its table
 * @returns {boolean} True if the column is being hovered over, false otherwise
 */
export const isColumnHover = (state, column) => {
    const hoverTable = getHoverTable(state);
    const isTableMatch = isTableHover(state, column.tableId);
    const hoverColumnIndex = getHoverColumnIndex(state);
    return (
        (isTableMatch && (hoverColumnIndex === column.index || hoverColumnIndex === initialState.ui.hover.columnIndex)) ||
        (hoverColumnIndex === column.index && hoverTable === initialState.ui.hover.table)
    );    
}

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

/**
 * Determines whether the specified table is currently being hovered 
 * over directly or indirectly via its parent operation.
 * 
 * @param {Object} state - The Redux state object
 * @param {string} tableId - The ID of the table to check
 * @returns {boolean} True if the table is being hovered over or 
 *  if the table is the child of an operation currently being hovered,
 *  false otherwise
 */
export const isTableHover = (state, tableId) => {
    const hoverTableId = getHoverTable(state);
    return (
        (hoverTableId === tableId) || 
        (hoverTableId === initialState.ui.hover.table && getHoverOperationTablesIds(state).includes(tableId))
    );
}