/**
 * tableTreeSlice.js
 * -------------------------------------------------------------------
 * 
 * This Redux slice stores a relational query tree in a linked 
 * representation [Redux strongly suggests storing nested data in a *normalized form*](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
 * 
 */
import { createSlice } from "@reduxjs/toolkit";
import { stratify as d3stratify } from "d3";
import Operation, { isOperation, isStackOperation, NO_OP, STACK } from "../lib/types/Operation";
import { isTable } from "../lib/types/Table";

const initialState = {
    tree: [],
    isEmpty: true,
    errors: null
};

export const tableTreeSlice = createSlice({
    name: "tableTree",
    initialState,
    reducers: {
        insertTableInGroup(state, action) {
            const {table, focusedNode} = action.payload;

            const isOperationPresent = state.tree
                .filter(node => node.id === focusedNode.id)
                .length === 1;

            if (!isOperationPresent) 
                throw Error(`operation not found ${focusedNode}`);

            // Deep clone the table object
            const clonedTable = structuredClone(table);
            clonedTable.operation_group = focusedNode.id;
            state.tree.push(clonedTable);
        },

        /**
         * removeTable
         * 
         * @param {*} state 
         * @param {*} action 
         */
        removeTable(state, action) {
            const table = action.payload;
            const tableIndex = getIndex(state, table);
            state.tree.splice(tableIndex, 1);

            // TODO, what if removing tree creates an empty operation?

            // If all tables have been removed, reset state
            if (state.tree.filter(isTable).length === 0) {
                state.tree.splice(0, 1);
                state.isEmpty = true;
            }

        },
        /**
         * Recursively 
         * @param {object} state 
         * @param {object} action 
         */
        removeOperation(state, action) {
            const operationId = action.payload.id;
            stratify(state.tree)
                .find(({data}) => data.id === operationId)
                .descendants()
                    .map(({data}) => state.tree.indexOf(d => d.id === data.id))
                    .forEach(index => state.tree.splice(index, 1));
            
            if (state.tree.length === 0) {
                state.isEmpty = true;
            }
        },
        addTable(state, {payload}) {
            const operation = new Operation(payload.operationType);

            const table = structuredClone(payload.table);
            table.operation_group = operation.id;

            if (state.tree.length > 0) {
                // Assign new table and root of previous tree as
                // children of the new operation
                state.tree.at(0).operation_group = operation.id;
            }

            state.tree.splice(0, 0, operation, table);

            if (payload.operationType === STACK && state.tree.length > 2) {
                state.tree = simplifyTree(state.tree);
            }
        },
        setColumnProperty(state, {payload}) {
            const {column, property, value} = payload;
            const table = state.tree
                .filter(node => isTable(node) && node.id === column.tableId).at(0);
            const column2 = table.columns.filter(c => c.id === column.id).at(0);
            column2[property] = value;
        },
        reset() {
            return initialState;
        }
    }
});

function getOperations(state) {
    return state.tree.filter(node => isOperation(node));
}

function getIndex(state, node) {
    const index = state.tree.map(({id}) => id).indexOf(node.id);
    if (index === -1)
        throw new Error("node not present")
    return index;
}

function isNodePresent(tree, id) {
    tree.map(node => node.id).includes(id)
}

function simplifyTree(tree) {
    const root = stratify(tree);
    const nodesToRemove = [];

    // Group stack operations together
    root.each((node) => {
        if (node.children) {
            node.children.forEach(child => {
                if (isStackOperation(node.data) && isStackOperation(child.data)) {
                    child.children.forEach(({data}) => data.operation_group = node.data.id);
                    nodesToRemove.push(child.data.id);
                }
            });
        }
    });

    return root.descendants()
        .map(n => n.data)
        .filter(d => !(isOperation(d) && nodesToRemove.includes(d.id)));
}

/**
 * stratify
 * -------------------------------------------------
 * A helper function for transforming a tree-structured data from a 
 * linked representation to a D3 [*hierarchy*](https://d3js.org/d3-hierarchy/hierarchy) instance (nested representation)
 * `useSelector` often uses this function to stratify this slice
 * 
 * @param {Array} data 
 * @returns {Hierarchy}
 */
export function stratify(data) {
    return d3stratify()
        .id(d => d.id)
        .parentId(d => d.operation_group)
        (data);
}

export function isTreeEmpty(state) {
    return (state.tree.length === 0);
}

export const {
    insertTableInGroup,
    removeTable,
    removeOperation,
    addTable,
    setColumnProperty,
    reset
} = tableTreeSlice.actions;

export default tableTreeSlice.reducer;