/**
 * tableTreeSlice.js
 * 
 * This Redux slice stores a relational query tree in a linked representation
 * [Redux strongly suggests storing nested data in a *normalized form*](https://redux.js.org/usage/structuring-reducers/normalizing-state-shape)
 * 
 */
import { createSlice } from "@reduxjs/toolkit";
import { Operation } from "../lib/types";
import { stratify as d3stratify } from "d3";
import { isOperation, NO_OP } from "../lib/types/Operation";
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
        removeTableFromTree(state, action) {
            const table = action.payload;
            const tableIndex = getIndex(state, table);
            state.tree.splice(tableIndex, 1);

            // If all tables have been removed, reset state
            const tableCount = state.tree.filter(node => isTable(node)).length;
            if (tableCount === 0) {
                state.tree.splice(0, 1);
                state.isEmpty = true;
            }

        },
        addTableToTree(state, action) {
            const table = structuredClone(action.payload);
            const operations = getOperations(state);
            let parent;

            if (operations.length === 0) {
                // initialize
                parent = new Operation(NO_OP);
                state.tree.push(parent);
            } else {
                parent = operations.pop();
            }

            table.operation_group = parent.id;            
            state.tree.push(table);
            state.isEmpty = false;

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
    removeTableFromTree,
    addTableToTree,
    removeOperation,
    reset
} = tableTreeSlice.actions;

export default tableTreeSlice.reducer;