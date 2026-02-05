/**
 * @fileoverview Delete tables saga watcher.
 * @module sagas/uiSaga/watcher
 *
 */
import { put, select, takeEvery } from "redux-saga/effects";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import {
  clearSelectedTableIds,
  removeFromHiddenColumnIds,
  removeFromHoveredColumnIds,
  removeFromSelectedColumnIds,
  removeFromSelectedTableIds,
  selectFocusedObjectId,
  setFocusedObjectId,
} from "../../slices/uiSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";
import { createTablesSuccess } from "../createTablesSaga/actions";

export default function* uiSaga() {
  // When a column is deleted, make just its ID no longer selected/hidden/hovered
  yield takeEvery(deleteColumnsSuccess.type, function* (action) {
    const columnIds = action.payload.map((col) => col.id);
    yield put(removeFromHiddenColumnIds(columnIds));
    yield put(removeFromSelectedColumnIds(columnIds));
    yield put(removeFromHoveredColumnIds(columnIds));
  });

  // When tables are deleted, make just their IDs no longer selected
  yield takeEvery(deleteTablesSuccess.type, function* (action) {
    const tables = action.payload;
    const tableIds = tables.map(({ id }) => id);
    yield put(removeFromSelectedTableIds(tableIds));
  });

  yield takeEvery(deleteOperationsSuccess.type, function* (action) {
    const deletedOperations = action.payload;
    const focusedObjectId = yield select(selectFocusedObjectId);

    // If the focused object is one of the deleted operations, clear focus
    if (deletedOperations.some((op) => op.id === focusedObjectId)) {
      yield put(setFocusedObjectId(null));
    }
  });

  // When a table is created, clear selected table IDs and set focus
  yield takeEvery(createTablesSuccess.type, function* (action) {
    const createdTables = action.payload;

    yield put(clearSelectedTableIds());

    const lastCreatedTable = createdTables[createdTables.length - 1];
    yield put(setFocusedObjectId(lastCreatedTable.id));
  });

  // When an operation is created, clear selected table IDs and set focus
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const createdOperations = action.payload;

    yield put(clearSelectedTableIds());

    const lastOperation = createdOperations[createdOperations.length - 1];
    yield put(setFocusedObjectId(lastOperation.id));
  });
}
