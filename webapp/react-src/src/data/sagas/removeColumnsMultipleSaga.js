import { takeEvery, put, all } from "redux-saga/effects";
import { removeColumnRequest } from "../slices/sourceColumnsSlice";
import { removeMultipleColumns } from "../actions";

export default function* removeColumnsMultipleSaga() {
  yield takeEvery(removeMultipleColumns.type, removeColumnsMultipleSagaWorker);
}

function* removeColumnsMultipleSagaWorker(action) {
  const columnIds = action.payload;
  console.log("removeColumnsMultipleSagaWorker", columnIds);

  // Dispatch removeColumnRequest for each columnId in parallel
  yield all(columnIds.map((id) => put(removeColumnRequest(id))));
}
