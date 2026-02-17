/**
 * @fileoverview Update operations saga watcher.
 * @module sagas/updateOperationsSaga/watcher
 *
 * Watches for operation update requests and syncs database views with
 * Redux store state. Handles post-creation setup and table migrations.
 *
 * Features:
 * - Handles updateOperationsRequest actions
 * - Sets default join parameters for new PACK operations
 * - Updates operations when tables change parents
 * - Coordinates child-parent relationships
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.

import { call, select, takeEvery } from "redux-saga/effects";
import { updateOperationsRequest } from "./actions";
import updateOperationsWorker from "./worker";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import {
  isOperationId,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { ascending, group } from "d3";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { updateTablesSuccess } from "../updateTablesSaga";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  // Pass along any update operations requests to the worker saga, but if
  // the operation is materialized and the update includes schema changes, set isInSync to false.
  yield takeEvery(updateOperationsRequest.type, function* (action) {
    const operationUpdates = action.payload;
    const payload = [];
    const outOfSyncProps = [
      "childIds",
      "joinKey1",
      "joinKey2",
      "joinType",
      "joinPredicate",
    ];
    for (const operationUpdate of operationUpdates) {
      const operation = yield select((state) =>
        selectOperationsById(state, operationUpdate.id),
      );
      if (
        operation.isMaterialized &&
        Object.keys(operationUpdate).some((key) => outOfSyncProps.includes(key))
      ) {
        payload.push({
          ...operationUpdate,
          isInSync: false,
        });
      } else {
        payload.push(operationUpdate);
      }
    }
    yield call(updateOperationsWorker, payload);
  });

  // When tables are deleted, we need to remove that table ID from the
  // parent operation's childIds, if any.
  yield takeEvery(deleteTablesSuccess.type, function* (action) {
    const operationUpdates = [];
    const deletedTables = action.payload;
    const deletedTablesByParentOperation = group(
      deletedTables,
      (table) => table.parentId,
    );

    for (const [parentOperationId, tables] of deletedTablesByParentOperation) {
      if (parentOperationId === null) {
        continue;
      } else {
        const operation = yield select((state) =>
          selectOperationsById(state, parentOperationId),
        );
        operationUpdates.push({
          id: operation.id,
          childIds: operation.childIds.filter(
            (id) => !tables.some((table) => table.id === id),
          ),
          isInSync: operation.isMaterialized ? false : true,
        });
      }

      yield call(updateOperationsWorker, operationUpdates);
    }
  });

  // When an operation is created, if any of its children are operations,
  // then we need to update those operations' parentId property.
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const createdOperations = action.payload;
    const operationUpdates = [];

    for (const operation of createdOperations) {
      for (const childId of operation.childIds) {
        if (!isTableId(childId)) {
          const childOperation = yield select((state) =>
            selectOperationsById(state, childId),
          );
          operationUpdates.push({
            id: childOperation.id,
            parentId: operation.id,
          });
        }
      }
    }

    if (operationUpdates.length > 0) {
      yield call(updateOperationsWorker, operationUpdates);
    }
  });

  /**
   * When columns are created, we need to update the parent operation's
   * columnIds property to include the new columns.
   */
  yield takeEvery(createColumnsSuccess.type, function* (action) {
    const createdColumns = action.payload;
    const workerPayload = [];

    const columnsByParent = group(createdColumns, (col) => col.parentId);

    for (const [parentId, columns] of columnsByParent) {
      if (isOperationId(parentId)) {
        workerPayload.push({
          id: parentId,
          columnIds: columns
            .sort((a, b) => ascending(a.index, b.index))
            .map((col) => col.id),
        });
      }
    }
    if (workerPayload.length > 0) {
      yield call(updateOperationsWorker, workerPayload);
    }
  });

  // If a table re-orders its columns and the table
  // is the child of a materialized operation, then the operation needs to
  // be flagged as out of sync.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const updatedTables = action.payload;
    const payload = [];
    for (const updatedTable of updatedTables) {
      const table = yield select((state) =>
        selectTablesById(state, updatedTable.id),
      );
      if (Object.hasOwn(updatedTable, "columnIds") && table?.parentId) {
        const operation = yield select((state) =>
          selectOperationsById(state, table.parentId),
        );
        if (operation.isMaterialized) {
          payload.push({
            id: operation.id,
            isInSync: false,
          });
        }
      }
    }
    if (payload.length > 0) {
      yield call(updateOperationsWorker, payload);
    }
  });
}
