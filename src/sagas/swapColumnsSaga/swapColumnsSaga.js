import { takeEvery, put, select } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  clearSelectedColumns,
  selectColumnById,
  selectColumnIdsByTableId,
  updateColumnsArray,
} from "../../slices/columnsSlice";

/**
 * Action creator for swapping two columns in the columns state.
 *
 * This action should be dispatched with a payload containing the identifiers or indices
 * of the columns to be swapped.
 *
 * @function
 * @param {Object} payload - The payload for the swap action.
 * @param {string|number} payload.sourceColumnId - The identifier or index of the source column.
 * @param {string|number} payload.targetColumnId - The identifier or index of the target column.
 * @returns {Object} Redux action with type "columns/swapColumns" and the provided payload.
 */
export const swapColumnsRequest = createAction("sagas/swapColumns/request");

/**
 * Saga watcher for swap columns actions.
 *
 * Listens for every dispatch of the swapColumnsRequest and triggers the swapColumnsSagaWorker.
 * This watcher ensures that whenever a swap columns action is dispatched, the corresponding
 * worker saga is executed to handle the swap logic and related side effects.
 *
 * @generator
 */
export default function* swapColumnsSaga() {
  yield takeEvery(swapColumnsRequest.type, swapColumnsSagaWorker);
}

/**
 * Saga worker to handle swapping columns in the columns state.
 *
 * This generator function is triggered by the swapColumnsRequest. It performs the following steps:
 * 1. Adds the source and target column IDs to the loading state.
 * 2. Dispatches the swapColumns action with the provided source and target IDs.
 * 3. Removes the columns from the loading state.
 * 4. Clears any selected columns.
 *
 * @param {Object} action - The Redux action containing the payload for the swap operation.
 * @param {Object} action.payload - The payload for the swap action.
 * @param {Array<string|number>} action.payload.sourceIds - The IDs of the source columns to swap.
 * @param {Array<string|number>} action.payload.targetIds - The IDs of the target columns to swap.
 * @generator
 */
export function* swapColumnsSagaWorker(action) {
  let { sourceIds, targetIds } = action.payload;

  // Normalize inputs to always be arrays
  sourceIds = Array.isArray(sourceIds) ? sourceIds : [sourceIds];
  targetIds = Array.isArray(targetIds) ? targetIds : [targetIds];

  const swaps = sourceIds.length;

  for (let i = 0; i < swaps; i++) {
    const tableId = yield select(
      (state) => selectColumnById(state, sourceIds[i]).tableId
    );
    const prevColumnOrder = yield select((state) =>
      selectColumnIdsByTableId(state, tableId)
    );

    // Create a copy of the previous column order and swap the source and target columns
    const nextColumnOrder = [...prevColumnOrder];
    const sourceIndex = nextColumnOrder.indexOf(sourceIds[i]);
    const targetIndex = nextColumnOrder.indexOf(targetIds[i]);

    // Swap the columns at their respective indices
    nextColumnOrder[sourceIndex] = targetIds[i];
    nextColumnOrder[targetIndex] = sourceIds[i];

    yield put(addColumnsToLoading([sourceIds[i], targetIds[i]]));
    yield put(updateColumnsArray({ tableId, columnIds: nextColumnOrder }));
    yield put(removeColumnsFromLoading([sourceIds[i], targetIds[i]]));
  }
  yield put(clearSelectedColumns());
}
