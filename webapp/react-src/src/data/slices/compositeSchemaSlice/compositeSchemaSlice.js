
import { createSlice } from "@reduxjs/toolkit";
import { stratify as d3Stratify } from "d3";
import { NO_OP } from "../../../lib/types/Operation";

const initialState = {
    selectedTables: [],
    prevOperationId: null,
    data: {},
    loading: false,
    error: null,
};

let nodeIdCounter = 0;  // each node gets a unique ID, regardless if it's a table vs operation node

function TableNode(table, parentId) {
    const id = `node-${++nodeIdCounter}`;
    return {
        id,
        nodeId: id,
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
                
                if (state.prevOperationId === null) {
                    // initialize
                    operationNode = new OperationNode(operationType);
                    tableNode = new TableNode(table, operationNode.id);

                    state.data[operationNode.id] = operationNode;
                    state.data[tableNode.id] = tableNode;
                    state.prevOperationId = operationNode.id;
                    state.selectedTables.push(tableNode.tableId);
                } else if (state.data[state.prevOperationId].operationType === NO_OP) {
                    // Second table
                    operationNode = new OperationNode(operationType);
                    tableNode = new TableNode(table, operationNode.id);
                    const prevTableNode = new TableNode(
                        { id: Object.values(state.data).find(node => node.parentId === state.prevOperationId).tableId }, 
                        operationNode.id
                    );

                    state.data = {};
                    state.data[operationNode.id] = operationNode;
                    state.data[prevTableNode.id] = prevTableNode;
                    state.data[tableNode.id] = tableNode;
                    state.prevOperationId = operationNode.id;
                    state.selectedTables.push(tableNode.tableId); 

                } else if (state.data[state.prevOperationId].operationType === operationType) {
                    // add table to previous operation
                    tableNode = new TableNode(table, state.prevOperationId);
                    state.data[tableNode.id] = tableNode;
                    state.selectedTables.push(tableNode.tableId);
                } else if (state.data[state.prevOperationId].operationType !== operationType) {
                    // Create new operation as a child of the previous operation,
                    // e.g. switching to STACK after PACK or vice versa

                    operationNode = new OperationNode(operationType);
                    tableNode = new TableNode(table, operationNode.id);

                    state.data[state.prevOperationId].parentId = operationNode.id;
                    
                    state.data[operationNode.id] = operationNode;
                    state.data[tableNode.id] = tableNode;                    
                    state.prevOperationId = operationNode.id;
                    state.selectedTables.push(tableNode.tableId);
                } else {
                    throw new Error("Unknown state");
                }
            } catch(error) {
                if (process.env.NODE_ENV === "development") {
                    console.error("createOperation action failure", error);                        
                }
                state.loading = false;
                state.error = error;
            }
        },

        removeTable: (state, action) => {
            const nodeId = action.payload;
            const nodeToRemove = state.data[nodeId];

            // Remove table from selected tables
            state.selectedTables = state.selectedTables.filter(
                tableId => (tableId !== nodeToRemove.tableId)
            );

            // If the removed node is an only child, remove parent operation
            const siblingCount = Object.values(state.data).filter(node => 
                node.parentId === nodeToRemove.parentId &&
                node.id !== nodeToRemove.id
            ).length;
            if (siblingCount === 0) {
                delete state.data[nodeToRemove.parentId];
                // TODO: what if this operation was the previous operation?
            }

            // Remove node
            delete state.data[nodeId];

            // If all nodes have been removed reset state
            if (Object.keys(state.data).length === 0) {
                state.prevOperationId = initialState.prevOperationId;
            }
        },

        removeOperation: (state, action) => {
            const nodeId = action.payload;
            const nodeToRemove = state.data[nodeId];

            // remove all children from node
            getAllChildNodes(state.data, nodeToRemove.id).forEach(nodeId => {
                if (isTableNode(state.data[nodeId])) {
                    // TODO: maybe selectedTables should be memoized
                    // TODO: is is more efficient to calculate this
                    //    with a set difference?
                    state.selectedTables = state.selectedTables.filter(
                        tableId => (tableId) !== state.data[nodeId].tableId
                    );
                }
                delete state.data[nodeId];
            });

            // If the removed operation is the only child in the parent operation, 
            // then also remove the parent operation
            if (nodeToRemove.parentId !== null) {
                // Only iterate over the data again if there is a parent operation
                const siblingCount = Object.values(state.data).filter(node => 
                    node.parentId === nodeToRemove.parentId &&
                    node.id !== nodeToRemove.id
                ).length;
                if (siblingCount === 0) {
                    delete state.data[nodeToRemove.parentId];
                    // TODO: what if this operation was the previous operation?
                    // TODO: what if the parent operation was the previous operation?
                    //    can I get previous operation from state history?
                }
            }

            // Remove operation node
            delete state.data[nodeId];

            // If all nodes have been removed reset state
            if (Object.keys(state.data).length === 0) {
                state.prevOperationId = initialState.prevOperationId;
            }
        }
    }
});

/* Recursively finds all child nodes in a dictionary given a parent node ID
 * 
 * @param {Object} dictionary - Dictionary containing nodes with parent-child relationships
 * @param {string|number} parentNodeId - ID of the parent node to start from
 * @returns {Array} - Array containing all child node IDs
 */
function getAllChildNodes(dictionary, parentNodeId) {
  // Initialize array to store all child nodes
  const allChildren = [];
  
  // Iterate through all items in the dictionary
  Object.entries(dictionary).forEach(([nodeId, nodeData]) => {
    // Check if this node's parent is the one we're looking for
    if (nodeData.parentId === parentNodeId) {
      // Add this node to our result
      allChildren.push(nodeId);

      if (isOperationNode(nodeData)) {
        // Recursively find all children of this node
        const childNodes = getAllChildNodes(dictionary, nodeData.id);
        allChildren.push(...childNodes);
      }
    }
  });
  
  return allChildren;
}

export default slice;
