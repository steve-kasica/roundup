import { takeLatest, put } from "redux-saga/effects";
import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  updateColumns,
} from "../../slices/columnsSlice";
import { createAction } from "@reduxjs/toolkit";
import { clearSelectedColumns } from "../../slices/columnsSlice";

export const renameColumnsRequest = createAction(
  "columns/renameColumns/request"
);

export default function* renameColumnSaga() {
  yield takeLatest(renameColumnsRequest.type, renameColumnsSagaWorker);
}

// name is constant, used for renaming multiple columns
// to the same name
export function* renameColumnsSagaWorker(action) {
  let { ids, name } = action.payload;

  // Normalize ids to always be an array
  ids = Array.isArray(ids) ? ids : [ids];

  yield put(addColumnsToLoading(ids));
  yield put(updateColumns(ids.map((id) => ({ id, name }))));
  yield put(clearSelectedColumns());
  yield put(removeColumnsFromLoading(ids));
}
