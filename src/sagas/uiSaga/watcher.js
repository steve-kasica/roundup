/**
 * @fileoverview Delete tables saga watcher.
 * @module sagas/uiSaga/watcher
 *
 */
import { put, takeEvery } from "redux-saga/effects";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import {
  removeFromHiddenColumnIds,
  removeFromHoveredColumnIds,
  removeFromSelectedColumnIds,
  removeFromSelectedTableIds,
} from "../../slices/uiSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";

export default function* uiSaga() {
  yield takeEvery(deleteColumnsSuccess.type, function* (action) {
    const columnIds = action.payload.map((col) => col.id);
    yield put(removeFromHiddenColumnIds(columnIds));
    yield put(removeFromSelectedColumnIds(columnIds));
    yield put(removeFromHoveredColumnIds(columnIds));
  });

  yield takeEvery(deleteTablesSuccess.type, function* (action) {
    const tables = action.payload;
    const tableIds = tables.map(({ id }) => id);
    yield put(removeFromSelectedTableIds(tableIds));
  });
}
