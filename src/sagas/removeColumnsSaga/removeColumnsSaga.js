import { put, takeEvery } from "redux-saga/effects";
import { addColumnsToLoading, removeColumns } from "../../slices/columnsSlice";
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

export const removeColumnsSuccessAction = createAction(
  "sagas/removeColumnSuccess"
);

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumnsAction.type, removeColumnsSagaWorker);
}

export function* removeColumnsSagaWorker(action) {
  let columnIds = action.payload;
  console.log(`Removing columns with IDs: ${columnIds.join(", ")}`);

  yield put(addColumnsToLoading(columnIds));

  // Remove from selected columns from all attributes
  // of the columns slice, including loading array
  yield put(removeColumns(columnIds));
  console.log(`Removing columns with IDs: ${columnIds.join(", ")}`);

  yield put(removeColumnsSuccessAction(action.payload));
}
