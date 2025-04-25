import { takeEvery, put, all } from "redux-saga/effects";
import { removeColumnRequest } from "../slices/columnsSlice";
import { createAction } from "@reduxjs/toolkit";

export const removeColumns = createAction("SourceColumn/removeMultipleColumns");

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumns.type, removeColumnsSagaWorker);
}

function* removeColumnsSagaWorker(action) {
  const columnIds = action.payload;

  // Dispatch removeColumnRequest for each columnId in parallel
  yield all(columnIds.map((id) => put(removeColumnRequest(id))));
}
