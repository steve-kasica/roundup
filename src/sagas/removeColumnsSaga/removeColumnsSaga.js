import { put, takeEvery } from "redux-saga/effects";
import {
  addColumnsToDropped,
  addColumnsToLoading,
  removeColumnsFromDragging,
  removeColumnsFromLoading,
  removeFromSelectedColumns,
  updateColumns,
} from "../../slices/columnsSlice";
import { createAction } from "@reduxjs/toolkit";

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
  yield put(removeColumnsFromLoading(columnIds));

  // Signal to other sagas that columns have been successfully removed
  yield put(removeColumnsSuccessAction(columnIds));
}
