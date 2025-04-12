import { createSelector } from "@reduxjs/toolkit";
import { stratify as d3Stratify, descending } from "d3";
import { isOperationNode, isTableNode } from "../slices/compositeSchemaSlice";

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
export const getFocusedOperationTablesWithColumns = createSelector(
    [
        state => state.compositeSchema.data,
        state => state.sourceTables.data,
        state => state.sourceColumns.data,
        state => state.ui.focused.operation,
    ],
    (
        schemaData, 
        sourceTablesData, 
        sourceColumnsData, 
        focusedOperationId
    ) => Object.values(schemaData)
            .filter(node => 
                isTableNode(node) && node.parentId === focusedOperationId
            )
            .map(node => ({
                ...sourceTablesData[node.tableId],
                columnIds: sourceColumnsData[node.tableId].columns
                    .map(({id}) => id),
            }))
);

export const stratify = d3Stratify()
    .id(d => d.id)
    .parentId(d => d.parentId || null);

export const getRoot = createSelector(
    state => state.compositeSchema.data,
    (data) => Object.keys(data).length > 0
        ? stratify(Object.values(data))
        : null
);

export const getOperations = createSelector(
    state => state.compositeSchema.data,
    (data) => Object.values(data)
        .filter(isOperationNode)
        .sort(({id: a}, {id: b}) => descending(a,b))
);

export const getFocusedOperation = createSelector(
    [
        state => state.compositeSchema.data,
        state => state.ui.focused.operation
    ],
    (data, focusedOperationNodeId) => {
        if (focusedOperationNodeId === null) {
            return null;
        } else {
            const node = data[focusedOperationNodeId];
            
            if (node === undefined) {
                throw new Error("Node not found");
            } else if (!isOperationNode(node)) {
                throw new Error("Focused node is not an operation");
            }

            return node;
        }
    }
);

// TODO: memoize, if necessary
export const getMaxColumnsInOperation = (state, operationNodeId) => {
    const columnCounts = Object.values(state.compositeSchema.data)
        .filter(node => isTableNode(node) && node.parentId === operationNodeId)
        .map(tableNode => state.sourceTables.data[tableNode.tableId].columnCount);
    const max = Math.max(...columnCounts);
    return max;
}