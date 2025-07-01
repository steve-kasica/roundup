import { createSlice } from "@reduxjs/toolkit";
import Operation, { isOperationId, OPERATION_TYPE_NO_OP } from "./Operation";
import {
  selectOperation,
  selectParentOperation,
  selectRootOperation,
} from "./operationsSelectors";

const initialState = {
  data: {}, // Normalized operations stored by ID
  ids: [], // Array of operation IDs
  root: null, // ID of the root operation
  focused: null, // ID of the currently focused operation
  hovered: null, // ID of the currently hovered operation
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
     * @param {Object} action.payload - The payload for the action.
     * @param {string} action.payload.operationType - The type of operation to add.
     * @param {string} action.payload.childId - The ID of the child operation.
     * @throws {Error} If an operation with the generated ID already exists.
     *
     * @description
     * Creates a new operation using the provided operation type and child ID.
     * If a root operation exists, the new operation will include it as a child.
     * The new operation is added to the state, its ID is pushed to the list of IDs,
     * and it becomes the new root operation. This is how we build the tree structure
     * of operations from the bottom up.
     */
    addOperation(state, action) {
      const operation = action.payload;
      if (state.data[operation.id]) {
        throw new Error(`Operation with ID ${operation.id} already exists`);
      }
      if (state.root) {
        operation.children = [...operation.children, state.root];
      }
      state.data[operation.id] = operation;
      state.ids.push(operation.id);
      state.root = operation.id; // Set the new operation as the root
    },

    /**
     * Removes an operation from the state by its ID.
     *
     * If the operation to be removed is the current root, attempts to set the root to its parent operation.
     * If no parent exists, sets the root to null.
     * Also removes any operations that have a child relationship with the removed operation (parent).
     *
     * @param {Object} state - The current operations slice state.
     * @param {Object} action - The Redux action object.
     * @param {string|number} action.payload - The ID of the operation to remove.
     */
    removeOperation(state, action) {
      const id = action.payload;

      // If the operation to remove is the root, we need to find a new root
      if (state.root === id) {
        const parentOperationId = selectParentOperation(
          { operations: state },
          id
        );
        state.root = parentOperationId || null; // Set the new root or null if no parent exists
      }

      // Remove the operation itself and other operations that have a
      // parent-child relationship with it
      removeOperationFromState(state, id);
    },

    /**
     * Reducer to change the type of a specific operation.
     *
     * @param {Object} state - The current state of the operations slice.
     * @param {Object} action - The dispatched action containing payload.
     * @param {Object} action.payload - The payload for the action.
     * @param {string|number} action.payload.operationId - The unique identifier of the operation to update.
     * @param {string} action.payload.operationType - The new type to assign to the operation.
     *
     * @returns {void}
     */
    changeOperationType(state, action) {
      const { operationId, operationType } = action.payload;
      const operation = selectOperation({ operations: state }, operationId);
      operation.operationType = operationType;
    },

    /**
     * Adds a child ID to the specified operation's children array.
     *
     * @param {Object} state - The current Redux state for operations.
     * @param {Object} action - The dispatched action containing payload.
     * @param {Object} action.payload - The payload for the action.
     * @param {string|number} action.payload.operationId - The ID of the parent operation.
     * @param {string|number} action.payload.childId - The ID of the child operation to add.
     *
     * @description Note that `childId` is either a table ID or an operation ID depending on the context in which this action is called.
     * @returns {void}
     */
    addChildToOperation(state, action) {
      const { operationId, childId } = action.payload;
      const operation = selectOperation({ operations: state }, operationId);
      operation.children.push(childId);
    },

    /**
     * Removes a child (operation or table) from the specified operation.
     * If the child is itself an operation, it is also removed from the state.
     * If the operation has no remaining children after removal, the operation itself is removed from the state.
     *
     * @param {Object} state - The current Redux slice state containing operations.
     * @param {Object} action - The Redux action containing payload data.
     * @param {string} action.payload.operationId - The ID of the parent operation.
     * @param {string} action.payload.childId - The ID of the child to remove.
     */
    removeChildFromOperation(state, action) {
      const { operationId, childId } = action.payload;
      const operation = selectOperation({ operations: state }, operationId);
      operation.children = operation.children.filter((id) => id !== childId);

      if (isOperationId(childId)) {
        // If the child is an operation, we need to remove it from the state
        removeOperationFromState(state, childId);
      }

      // If no tables remain, remove the operation itself
      if (operation.children.length === 0) {
        removeOperationFromState(state, operationId);
        // If the removed operation was the root, set root to null
        if (state.root === operationId) {
          state.root = null;
        }
      }
    },

    /**
     * Sets the currently focused operation by its ID.
     *
     * @param {Object} state - The current state of the operations slice.
     * @param {Object} action - The dispatched action containing the payload.
     * @param {string|number} action.payload.id - The ID of the operation to focus.
     */
    setFocusedOperation(state, action) {
      const { id } = action.payload;
      state.focused = id;
    },

    /**
     * Sets the currently hovered operation by its ID.
     *
     * @param {Object} state - The current state of the operations slice.
     * @param {Object} action - The Redux action object.
     * @param {string|number} action.payload - The ID of the operation to set as hovered.
     */
    setHoveredOperation(state, action) {
      const id = action.payload;
      state.hovered = id;
    },
  },
});

export const {
  addOperation,
  removeOperation,
  changeOperationType,
  addChildToOperation,
  removeChildFromOperation,
  setFocusedOperation,
  setHoveredOperation,
} = operationsSlice.actions;

export default operationsSlice.reducer;

/**
 * Recursively removes an operation and all its child operations from the state.
 *
 * @param {Object} state - The current state object containing operations data and ids.
 * @param {string} operationId - The ID of the operation to remove.
 *
 * @returns {void}
 */
function removeOperationFromState(state, operationId) {
  const operation = selectOperation({ operations: state }, operationId);
  if (!operation) return;

  // Recursively remove all children that are operations
  operation.children
    .filter(isOperationId)
    .forEach((childId) => removeOperationFromState(state, childId));

  delete state.data[operationId];
  state.ids = state.ids.filter((id) => id !== operationId);
  state.hovered = state.hovered === operationId ? null : state.hovered;
  state.focused = state.focused === operationId ? null : state.focused;
}
