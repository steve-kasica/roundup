import { createSlice } from "@reduxjs/toolkit";
import { isOperationId } from "./Operation";
import { normalizeInputToArray } from "../utilities";

export const initialState = {
  allIds: [], // Array of operation IDs
  byId: {}, // Normalized operations stored by ID
  rootOperationId: null, // ID of the root operation
};

const operationsSlice = createSlice({
  name: "operations",
  initialState,
  reducers: {
    /**
     * Adds a new operation to the state.
     *
     * @param {Object} state - The current state of the operations slice.
     * @param {Object} action - The action object containing the payload.
     * @param {Object} action.payload - The operation to add.
     * @throws {Error} If an operation with the generated ID already exists.
     *
     * @description
     * Creates a new operation using the provided operation type and child ID.
     * The new operation is added to the state, its ID is pushed to the list of IDs,
     * and it becomes the new rootOperationId operation. This is how Roundup builds the
     * tree structure of operations from the bottom up.
     */
    addOperations(state, action) {
      const operations = normalizeInputToArray(action.payload);
      operations.forEach((operation) => {
        if (state.byId[operation.id]) {
          throw new Error(`Operation with ID ${operation.id} already exists`);
        }
        state.byId[operation.id] = operation;
        state.allIds.push(operation.id);

        state.rootOperationId = operation.id;
      });
    },

    /**
     * Updates one or more operations in the state with new attributes.
     *
     * @param {Object} state - The current state of the operations slice.
     * @param {Object} action - The dispatched action containing payload.
     * @param {Object|Array} action.payload - The payload can be in one of three formats:
     *   1. Array of operation objects: [operation1, operation2, ...]
     *   2. Object with operations array: { operations: [operation1, operation2, ...] }
     *   3. Single operation object: operation
     *
     * @throws {Error} If any operation with the specified ID does not exist in the state.
     *
     * @description
     * Updates existing operations by merging the provided attributes with the current state.
     * Each operation in the input must have an 'id' property that matches an existing operation.
     * The function normalizes different input formats to always process an array of operations.
     */
    updateOperations(state, action) {
      // Normalize input to always be an array
      const operationUpdates = normalizeInputToArray(action.payload);

      operationUpdates.forEach((operationUpdate) => {
        if (!state.byId[operationUpdate.id]) {
          throw new Error(
            `Operation with ID ${operationUpdate.id} does not exist`
          );
        }
        state.byId[operationUpdate.id] = {
          ...state.byId[operationUpdate.id],
          ...operationUpdate,
        };
      });
    },

    /**
     * Deletes an operation from the state by its ID.
     *
     * If the operation to be deleted is the current rootOperationId,
     * attempts to set the rootOperationId to its parent operation.
     * If no parent exists, sets the rootOperationId to null.
     * Also deletes any operations that have a child relationship with the
     * deleted operation (parent).
     *
     * @param {Object} state - The current operations slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|number} action.payload - The ID of the operation to delete.
     */
    deleteOperations(state, action) {
      const operationIdsToDelete = normalizeInputToArray(action.payload);

      operationIdsToDelete.forEach((id) => {
        // Delete the operation itself and other operations that have a
        // parent-child relationship with it
        if (state.rootOperationId === id) {
          state.rootOperationId = null;
        }
        deleteOperationFromState(state, id);
      });
    },
  },
});

export const { addOperations, deleteOperations, updateOperations } =
  operationsSlice.actions;

export default operationsSlice.reducer;

/**
 * Recursively deletes an operation and all its child operations from the state.
 *
 * @param {Object} state - The current state object containing operations data and ids.
 * @param {string} operationId - The ID of the operation to delete.
 *
 * @returns {void}
 */
function deleteOperationFromState(state, operationId) {
  const operationChildren = state.byId[operationId].childIds;
  operationChildren.forEach((childId) => {
    if (isOperationId(childId)) {
      deleteOperationFromState(state, childId);
    }
  });
  delete state.byId[operationId];
  state.allIds = state.allIds.filter((id) => id !== operationId);
}
