
import { createSlice } from "@reduxjs/toolkit";
import { stratify as d3Stratify } from "d3";

const initialState = {
    ids: [],
    data: {},
    loading: false,
    error: null,
};

let nodeIdCounter = 0;  // each node gets a unique ID, regardless if it's a table vs operation node

function TableNode(table, parentId) {
    return {
        id: `node-${++nodeIdCounter}`,
        parentId,
        tableId: table.id,
    };
}

export const isTableNode = node => Object.hasOwn(node, "tableId");

function OperationNode(operationType, parentId) {
    return {
        id: `node-${++nodeIdCounter}`,
        parentId,
        operationType,
    };
}

export const isOperationNode = node => Object.hasOwn(node, "operationType");

export const stratify = d3Stratify()
    .id(d => d.id)
    .parentId(d => d.parentId || null);

const slice = createSlice({
    name: "compositeSchema",
    initialState,
    reducers: {
        createOperation: (state, action) => {
            const {operationType, table} = action.payload;
            try {
                const operationNode = new OperationNode(operationType);
                const tableNode = new TableNode(table, operationNode.id);

                // Add operation
                state.data[operationNode.id] = operationNode;
                state.ids.push(operationNode.id);

                // Add table
                state.data[tableNode.id] = tableNode;
                state.ids.push(tableNode.id);
            } catch(error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("Error: `createOperation` failure", error);                        
                }
                state.loading = false;
                state.error = error;
            }
        },
        removeOperation: (state, action) => {
            // TODO
            return;
        },
        addTableToOperation: (state, action) => {
            // TODO
            return;
        },
        simplifyTree: (state, action) => {
            // TODO
            return;
        }
    }
});

export const {createOperation} = slice.actions;

export default slice.reducer;