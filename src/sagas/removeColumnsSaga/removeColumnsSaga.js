import { put, select, takeEvery } from "redux-saga/effects";
import {
  addColumnsToDropped,
  addColumnsToLoading,
  removeColumnsFromDragging,
  removeColumnsFromLoading,
  removeFromSelectedColumns,
  selectColumnById,
  updateColumns,
} from "../../slices/columnsSlice";
import { createAction } from "@reduxjs/toolkit";
import { group } from "d3";
import { selectTablesById, updateTables } from "../../slices/tablesSlice";

/**
 * Action creator for removing columns.
 *
 * This action is dispatched to trigger the removal of columns from the state.
 * The payload should contain information about which columns to remove.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/removeColumn" and payload.
 */
export const removeColumnsRequest = createAction("sagas/removeColumns/request");

// createOperationViewSaga listens for this action
export const removeColumnsSuccessAction = createAction(
  "sagas/removeColumns/success"
);

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumnsRequest.type, removeColumnsSagaWorker);
}

/**
 * Worker saga for handling column removal.
 *
 * @param {Object} action - The action object containing the payload.
 *
 * Steps:
 * 1. Normalize the payload to ensure it's always an array of column IDs.
 * 2. Dispatch actions to update the state:
 *    1. Add column IDs to `state.columns.loading`
 *    2. Add column IDs to `state.columns.dropped`
 *    3. Remove column IDs from `state.columns.selected`
 *    4. Remove column IDs from `state.columns.dragging`
 *    5. Remove column IDs from associated table in `state.tables`
 *    6. Remove columns IDs from `state.columns.loading`
 * 3. Dispatch a success action to signal that the columns have been removed.
 *
 * @yields {void}
 */
export function* removeColumnsSagaWorker(action) {
  let columnIds = action.payload;
  // Normalize input to ensure it's always an array
  if (!Array.isArray(columnIds)) {
    columnIds = [columnIds];
  }

  yield put(addColumnsToLoading(columnIds));
  yield put(addColumnsToDropped(columnIds));
  yield put(removeFromSelectedColumns(columnIds));
  yield put(removeColumnsFromDragging(columnIds));

  // Remove columnIds from the `table` slice, where
  // the current mapping between columns and tables is
  // maintained
  const updatedTables = yield select((state) => {
    const data = columnIds.map((columnId) => {
      const column = selectColumnById(state, columnId);
      return {
        tableId: column?.tableId,
        columnId,
      };
    });
    const columnIdGroups = group(data, (d) => d.tableId);
    console.log(columnIdGroups);
    return Array.from(columnIdGroups, ([tableId, values]) => {
      const table = selectTablesById(state, tableId);
      const excludeList = values.map(({ columnId }) => columnId);
      return {
        id: table.id,
        columnIds: table.columnIds.filter(
          (columnId) => !excludeList.includes(columnId)
        ),
      };
    });
  });
  yield put(updateTables(updatedTables));

  yield put(removeColumnsFromLoading(columnIds));

  // Signal to other sagas that columns have been successfully removed
  yield put(removeColumnsSuccessAction(columnIds));
}
