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
import { ascending, group } from "d3";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";

/**
 * Saga watcher that listens for the `updateTablesRequest` action and triggers the corresponding worker saga.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `updateTablesSagaWorker` whenever the `updateTablesRequest` action is dispatched.
 */
export default function* updateTablesSagaWatcher() {
  yield takeEvery(updateTablesRequest.type, function* (action) {
    const workerPayload = action.payload;
    yield call(updateTablesWorker, workerPayload);
  });

  // If a column is deleted, we need to delete it's ID from the parent table's columnIds array
  // If that table still exists, deleteColumns saga does listen for deleteTablesSuccess actions.
  yield takeEvery(deleteColumnsSuccess.type, function* (action) {
    const deletedColumns = action.payload;
    const tableUpdates = [];

    const deletedColumnGroups = group(deletedColumns, (col) => col.parentId);

    for (const [parentId, columns] of deletedColumnGroups) {
      if (isTableId(parentId)) {
        const table = yield select((state) =>
          selectTablesById(state, parentId),
        );
        if (table) {
          tableUpdates.push({
            id: parentId,
            columnIds: (yield select(
              (state) => selectTablesById(state, parentId).columnIds,
            )).filter((id) => !columns.some((col) => col.id === id)),
          });
        }
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

  yield takeEvery(createColumnsSuccess.type, function* (action) {
    const createdColumns = action.payload;
    const workerPayload = [];

    const columnsByParent = group(createdColumns, (col) => col.parentId);

    for (const [parentId, columns] of columnsByParent) {
      if (isTableId(parentId)) {
        const table = yield select((state) =>
          selectTablesById(state, parentId),
        );
        if (table.columnIds.every((id) => id === null)) {
          // We are initializing columns for a table, so we can just set columnIds to the new columns
          workerPayload.push({
            id: parentId,
            columnIds: columns
              .sort((a, b) => ascending(a.index, b.index))
              .map((col) => col.id),
          });
        } else if (columns.length === 1) {
          // We are inserting new columns into an existing table, so we need to add the new columns to the existing columnIds array
          workerPayload.push({
            id: parentId,
            columnIds: [...table.columnIds].toSpliced(
              columns[0].index,
              0,
              columns[0].id,
            ),
          });
        }
      }
    }
    if (workerPayload.length > 0) {
      yield call(updateTablesWorker, workerPayload);
    }
  });

  // If an operation is updated and has tables as children, we need to update those tables' parentId property
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const updatedOperations = action.payload;
    const tableUpdates = [];
    for (const operation of updatedOperations) {
      if (Object.hasOwn(operation, "childIds")) {
        for (const childId of operation.childIds) {
          if (isTableId(childId)) {
            const table = yield select((state) =>
              selectTablesById(state, childId),
            );
            if (table.parentId !== operation.id) {
              tableUpdates.push({
                id: childId,
                parentId: operation.id,
              });
            }
          }
        }
      }
    }
    if (tableUpdates.length > 0) {
      yield call(updateTablesWorker, tableUpdates);
    }
  });

  // If an operation is deleted and has tables as children,
  // we need to set those tables' parentId property to null
  yield takeEvery(deleteOperationsSuccess.type, function* (action) {
    const deletedOperations = action.payload;
    const tableUpdates = [];
    for (const operation of deletedOperations) {
      if (Object.hasOwn(operation, "childIds")) {
        for (const childId of operation.childIds) {
          if (isTableId(childId)) {
            const table = yield select((state) =>
              selectTablesById(state, childId),
            );
            if (table.parentId === operation.id) {
              tableUpdates.push({
                id: childId,
                parentId: null,
              });
            }
          }
        }
      }
    }
    if (tableUpdates.length > 0) {
      yield call(updateTablesWorker, tableUpdates);
    }
  });
}
