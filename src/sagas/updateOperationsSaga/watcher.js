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
import { isTableId } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import {
  isOperationId,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { ascending, group } from "d3";
import { createColumnsSuccess } from "../createColumnsSaga/actions";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, function* (action) {
    const operationUpdates = action.payload;
    yield call(updateOperationsWorker, operationUpdates);
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

  // TODO: address how state should update when child of materialized operation changes
  // // When a table is updated, if it's columnIds property has changed
  // // and the table is the child of a operation, we need to flag that
  // // the operation is out-of-sync.
  // yield takeEvery(updateTablesSuccess.type, function* (action) {
  //   const rematerializationProperteies = ["columnIds", "childIds"];
  //   const { changedPropertiesById } = action.payload;
  //   const operationUpdates = [];
  //   const focusedOperationId = yield select(selectFocusedObjectId);

  //   for (const [id, changedProperties] of Object.entries(
  //     changedPropertiesById,
  //   )) {
  //     const hasSchemaChange = changedProperties.some((prop) =>
  //       rematerializationProperteies.includes(prop),
  //     );
  //     if (hasSchemaChange) {
  //       const { parentId } = yield select((state) =>
  //         isTableId(id)
  //           ? selectTablesById(state, id)
  //           : selectOperationsById(state, id),
  //       );

  //       if (parentId) {
  //         operationUpdates.push({
  //           id: parentId,
  //           ...(parentId === focusedOperationId
  //             ? {
  //                 // If the operation is focused, we can set it to out-of-sync
  //                 isInSync: false,
  //               }
  //             : {
  //                 // If the operation is not focused, we set isMaterialized to null
  //                 // so that when the user focuses on it, it will re-materialize
  //                 isMaterialized: null,
  //               }),
  //         });
  //       }
  //     }
  //   }

  //   if (operationUpdates.length > 0) {
  //     yield put(
  //       updateOperationsRequest({
  //         operationUpdates,
  //       }),
  //     );
  //   }
  // });
}
