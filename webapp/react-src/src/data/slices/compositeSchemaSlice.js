
import { createSlice } from "@reduxjs/toolkit";
import { stratify as d3Stratify } from "d3";
import { NO_OP } from "../../lib/types/Operation";

const initialState = {
    ids: [],
    prevOperationId: null,
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
            try {
                let operationNode, tableNode;
                const {operationType, table} = action.payload;
                console.log(operationType, table, state.prevOperationId);
                
                if (state.prevOperationId === null) {
                    // initialize
                    operationNode = new OperationNode(operationType);
                    tableNode = new TableNode(table, operationNode.id);

                    state.data[operationNode.id] = operationNode;
                    state.data[tableNode.id] = tableNode;
                    state.ids.push(operationNode.id);
                    state.ids.push(tableNode.id);
                    state.prevOperationId = operationNode.id;
                } else if (state.data[state.prevOperationId].operationType === NO_OP) {
                    // Second table
                    operationNode = new OperationNode(operationType);
                    tableNode = new TableNode(table, operationNode.id);
                    const prevTableNode = new TableNode(
                        { id: Object.values(state.data).find(node => node.parentId === state.prevOperationId).tableId }, 
                        operationNode.id
                    );

                    state.ids = [operationNode.id, prevTableNode.id, tableNode.id];
                    state.data = {};
                    state.data[operationNode.id] = operationNode;
                    state.data[prevTableNode.id] = prevTableNode;
                    state.data[tableNode.id] = tableNode;
                    state.prevOperationId = operationNode.id;          

                } else if (state.data[state.prevOperationId].operationType === operationType) {
                    // add table to previous operation
                    tableNode = new TableNode(table, state.prevOperationId);
                    state.data[tableNode.id] = tableNode;
                    state.ids.push(tableNode.id);
                } else if (state.data[state.prevOperationId].operationType !== operationType) {
                    // Create new operation as a child of the previous operation,
                    // e.g. switching to STACK after PACK or vice versa


                    operationNode = new OperationNode(operationType);
                    tableNode = new TableNode(table, operationNode.id);

                    state.data[state.prevOperationId].parentId = operationNode.id;
                    
                    state.data[operationNode.id] = operationNode;
                    state.data[tableNode.id] = tableNode;                    
                    state.ids.push(operationNode.id);
                    state.ids.push(tableNode.id);                    
                    state.prevOperationId = operationNode.id;
                } else {
                    throw new Error("Unknown state");
                }


                // Add operation
                // state.data[operationNode.id] = operationNode;
                // state.ids.push(operationNode.id);

                // // Add table
                // state.data[tableNode.id] = tableNode;
                // state.ids.push(tableNode.id);
            } catch(error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("createOperation action failure", error);                        
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