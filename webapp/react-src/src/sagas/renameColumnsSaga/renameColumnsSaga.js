import { takeLatest, put } from "redux-saga/effects";
import {
  renameColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
} from "../../slices/columnsSlice";
import { createAction } from "@reduxjs/toolkit";
import { clearSelectedColumns } from "../../slices/columnsSlice";

export const renameColumnsAction = createAction("columns/renameColumn");

export default function* renameColumnSaga() {
  yield takeLatest(renameColumnsAction.type, renameColumnsSagaWorker);
}

export function* renameColumnsSagaWorker(action) {
  const { ids, aliases } = action.payload;

  yield put(addColumnsToLoading(ids));
  yield put(renameColumns({ ids, aliases }));
  yield put(removeColumnsFromLoading(ids));
  yield put(clearSelectedColumns());
}
