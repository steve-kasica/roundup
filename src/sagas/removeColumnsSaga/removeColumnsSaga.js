import { put, select, takeEvery } from "redux-saga/effects";
import {
  addColumnsToLoading,
  removeColumns,
  removeColumnsFromDragging,
  removeColumnsFromLoading,
  removeFromSelectedColumns,
  selectColumnById,
  updateColumns,
} from "../../slices/columnsSlice";
import { createAction } from "@reduxjs/toolkit";
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

export const removeColumnsSuccessAction = createAction(
  "sagas/removeColumns/success"
);

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumnsRequest.type, removeColumnsSagaWorker);
}

export function* removeColumnsSagaWorker(action) {
  let columnIds = action.payload;

  yield put(addColumnsToLoading(columnIds));

  yield put(updateColumns(columnIds.map((id) => ({ id, isRemoved: true }))));
  yield put(removeFromSelectedColumns(columnIds));
  yield put(removeColumnsFromDragging(columnIds));
  yield put(removeColumnsFromLoading(columnIds));

  yield put(removeColumnsSuccessAction(action.payload));
}
