import { createAction } from "@reduxjs/toolkit";
import { all, takeEvery, put } from "redux-saga/effects";
import { swapColumnsRequest } from "../slices/columnsSlice";

export const swapColumnIndices = createAction("columns/swapColumnIndices");

export default function* swapColumnIndicesSaga() {
  yield takeEvery(swapColumnIndices.type, swapColumnIndicesSagaWorker);
}

function* swapColumnIndicesSagaWorker(action) {
  const { sourceColumnIds, targetColumnIds } = action.payload;

  yield all(
    sourceColumnIds.map((sourceId, i) =>
      put(swapColumnsRequest({ sourceId, targetId: targetColumnIds[i] }))
    )
  );
}
