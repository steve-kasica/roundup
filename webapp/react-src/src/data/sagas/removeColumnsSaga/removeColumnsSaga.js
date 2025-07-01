import { put, takeEvery } from "redux-saga/effects";
import {
  addColumnsToLoading,
  removeColumns,
  removeColumnsFromLoading,
  removeFromSelectedColumns,
  updateAttribute,
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
export const removeColumnsAction = createAction("sagas/removeColumn");

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumnsAction.type, removeColumnsSagaWorker);
}

export function* removeColumnsSagaWorker(action) {
  let columnIds = action.payload;

  yield put(addColumnsToLoading(columnIds));

  // Remove from selected columns from all attributes
  // of the columns slice, including loading array
  yield put(removeColumns(columnIds));
}
