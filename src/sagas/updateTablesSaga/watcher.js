/**
 * @fileoverview Update tables saga watcher.
 * @module sagas/updateTablesSaga/watcher
 *
 * Watches for table update requests and triggers the worker saga.
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { call, put, select, takeEvery } from "redux-saga/effects";
import { updateTablesRequest } from "./actions";
import updateTablesWorker from "./worker";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import { group } from "d3";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";

/**
 * Saga watcher that listens for the `updateTablesRequest` action and triggers the corresponding worker saga.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `updateTablesSagaWorker` whenever the `updateTablesRequest` action is dispatched.
 */
export default function* updateTablesSagaWatcher() {
  yield takeEvery(updateTablesRequest.type, function* (action) {
    yield call(updateTablesWorker, action.payload);
  });

  // If a column is deleted, we need to delete it's ID from the parent table's columnIds array
  yield takeEvery(deleteColumnsSuccess.type, function* (action) {
    const deletedColumns = action.payload;
    const tableUpdates = [];

    const deletedColumnGroups = group(deletedColumns, (col) => col.parentId);

    for (const [parentId, columns] of deletedColumnGroups) {
      if (isTableId(parentId)) {
        tableUpdates.push({
          id: parentId,
          columnIds: (yield select(
            (state) => selectTablesById(state, parentId).columnIds,
          )).filter((id) => !columns.some((col) => col.id === id)),
        });
      }
    }
    // delete columns may belong to operations
    if (tableUpdates.length > 0) {
      yield call(updateTablesWorker, tableUpdates);
    }
  });

  // If an operation is created that includes tables, we need to update those tables' parentId property
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const createdOperations = action.payload;
    const tableUpdates = [];

    for (const operation of createdOperations) {
      for (const childId of operation.childIds) {
        if (isTableId(childId)) {
          tableUpdates.push({
            id: childId,
            parentId: operation.id,
          });
        }
      }
    }

    if (tableUpdates.length > 0) {
      yield call(updateTablesWorker, tableUpdates);
    }
  });
}
