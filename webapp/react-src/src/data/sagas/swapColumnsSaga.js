import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  setColumnsIndex,
} from "../slices/columnsSlice";
import { select, fork, all } from "redux-saga/effects";
import { takeEvery, put } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import { createAction } from "@reduxjs/toolkit";
import { swapTableColumnIds } from "../slices/tablesSlice/tablesSlice";

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
export const swapColumnsAction = createAction("sagas/swapColumns");

export default function* swapColumnsSaga() {
  yield takeEvery(swapColumnsAction.type, function* (action) {
    // Accepts either a single target and source id
    // or parallel arrays of target and sources ids
    let targetIds = action.payload.targetIds;
    if (!Array.isArray(targetIds)) targetIds = [targetIds];

    let sourceIds = action.payload.sourceIds;
    if (!Array.isArray(sourceIds)) sourceIds = [sourceIds];

    if (targetIds.length !== sourceIds.length) {
      throw new Error(
        "swapColumnsSaga: targetIds and sourceIds must have the same length"
      );
    }

    // Run a child saga for each pair in parallel
    yield all(
      targetIds.map((targetId, i) =>
        fork(swapColumnsSagaWorker, {
          payload: { targetId, sourceId: sourceIds[i] },
        })
      )
    );
  });
}

/**
 * Saga worker to handle swapping the positions of two columns within a table.
 *
 * This generator function performs the following steps:
 * 1. Retrieves the source and target columns and their names from the Redux state.
 * 2. Swaps the positions of the columns in the column names array.
 * 3. Calls the OpenRefine API to reorder the columns on the backend.
 * 4. Handles errors by dispatching error actions for the affected columns.
 * 5. Updates the Redux state to reflect the new indices and loading status.
 * 6. Updates the order of column IDs in the table.
 *
 * @param {Object} action - The Redux action containing payload information.
 * @param {Object} action.payload - The payload for the action.
 * @param {string} action.payload.sourceId - The ID of the source column to swap.
 * @param {string} action.payload.targetId - The ID of the target column to swap.
 * @yields {Object} Redux-saga effects for state selection, dispatching actions, and calling APIs.
 */
function* swapColumnsSagaWorker(action) {
  const { sourceId, targetId } = action.payload;

  const { sourceColumn, targetColumn, columnNames, projectId } = yield select(
    (state) => {
      const sourceColumn = state.columns.data[sourceId];
      const targetColumn = state.columns.data[targetId];

      let columnNames = state.columns.idsByTable[sourceColumn.tableId].map(
        (id) => state.columns.data[id].name
      );

      const projectId = state.tables.data[sourceColumn.tableId].remoteId;

      return { sourceColumn, targetColumn, columnNames, projectId };
    }
  );
  const sourceIndex = sourceColumn.index;
  const targetIndex = targetColumn.index;

  const csrf_token = "foo";
  yield put(addColumnsToLoading([sourceId, targetId]));

  try {
    // Swap the items in columnNames
    [columnNames[sourceIndex], columnNames[targetIndex]] = [
      columnNames[targetIndex],
      columnNames[sourceIndex],
    ];
    yield OpenRefine.reorderColumns(projectId, columnNames, csrf_token);
  } catch (error) {
    yield put(setErrorForColumn({ id: sourceId, error }));
    yield put(setErrorForColumn({ id: targetId, error }));
  }

  // If the request was successful, update the state
  yield put(
    setColumnsIndex({
      ids: [sourceId, targetId],
      indices: [targetIndex, sourceIndex],
    })
  );
  yield put(removeColumnsFromLoading([sourceId, targetId]));

  // Update the order of the column Ids in the table
  yield put(
    swapTableColumnIds({
      tableId: sourceColumn.tableId,
      sourceIndex,
      targetIndex,
    })
  );
}
