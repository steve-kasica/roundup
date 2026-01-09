/**
 * @fileoverview Delete columns saga watcher.
 * @module sagas/deleteColumnsSaga/watcher
 *
 * Watches for column deletion requests and coordinates the deletion process.
 * Handles recursive deletion for operation columns by propagating to child
 * tables/operations.
 *
 * Features:
 * - Handles deleteColumnsRequest actions
 * - Expands operation column deletes to child tables
 * - Groups columns by parent for batch processing
 * - Supports PACK and STACK operation column propagation
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import {
  selectColumnIdsByParentId,
  selectColumnIdsByParentId,
  selectColumnsById,
} from "../../slices/columnsSlice";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { group } from "d3";
import { isTableId } from "../../slices/tablesSlice";
import deleteColumnsWorker from "./worker";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { selectOrphanedColumnIds } from "../../slices/columnsSlice/selectors";

export default function* deleteColumnsSaga() {
  // Main watcher for delete columns requests
  // If the column to be deleted is an operation's column, then the watcher
  // will recurse into the child tables/operations to delete the appropriate
  // columns as well.
  yield takeEvery(deleteColumnsRequest.type, function* (action) {
    let { columnIds, recurse, deleteFromDatabase } = action.payload;
    columnIds = Array.isArray(columnIds) ? columnIds : [columnIds];

    const columns = yield select((state) =>
      selectColumnsById(state, columnIds)
    );

    const columnsToDeleteByParentId = group(columns, (col) => col.parentId);

    const tablesToAlter = [];
    for (let [parentId, columnsToDelete] of columnsToDeleteByParentId) {
      if (isTableId(parentId) || (!isOperationId(parentId) && !recurse)) {
        tablesToAlter.push({
          tableId: parentId,
          columnsToDelete,
          deleteFromDatabase,
        });
      } else if (isOperationId(parentId) && recurse) {
        // If we're deleting operation columns, then we need to recurse into the children
        // tables/operations, map the operation columns to the appropriate table columns
        // and dispatch a delete columns request with those child columns.
        const childColumnIdsToDelete = [];
        const operation = yield select((state) =>
          selectOperationsById(state, parentId)
        );
        const childColumnIds = yield select((state) =>
          selectColumnIdsByParentId(state, operation.childIds)
        );
        for (let { id } of columnsToDelete) {
          const columnIndex = operation.columnIds.indexOf(id);
          if (operation.operationType === OPERATION_TYPE_PACK) {
            childColumnIdsToDelete.push(
              columnIndex > childColumnIds[0].length - 1
                ? childColumnIds[1][columnIndex - childColumnIds[0].length]
                : childColumnIds[0][columnIndex]
            );
          } else if (operation.operationType === OPERATION_TYPE_STACK) {
            childColumnIdsToDelete.push(
              ...childColumnIds
                // eslint-disable-next-line no-unused-vars
                .map((tableColumnIds, i) =>
                  tableColumnIds.filter((_, j) => j === columnIndex)
                )
                .flat()
            );
          }
        }
        yield put(
          deleteColumnsRequest({
            columnIds: childColumnIdsToDelete,
            recurse: true,
            deleteFromDatabase,
          })
        );
      }
    }
    yield call(deleteColumnsWorker, tablesToAlter);
  });

  // When schema-related properties of an operation are updated,
  // we need to re-create the operation's columns, so this saga
  // must delete any orphaned columns that belonged to that opeation.
  yield takeLatest(updateOperationsSuccess.type, function* (action) {
    const { changedPropertiesById } = action.payload;

    for (let [operationId, changedProperties] of Object.entries(
      changedPropertiesById
    )) {
      if (changedProperties.includes("columnIds")) {
        const orphanedColumnIds = yield select((state) =>
          selectOrphanedColumnIds(state, operationId)
        );
        if (orphanedColumnIds.length > 0) {
          // Bypass deleteColumnsRequest to avoid recursing into table columns
          // since we're just swapping out operation columns here.
          yield put(
            deleteColumnsRequest({
              columnIds: orphanedColumnIds,
              recurse: false,
              deleteFromDatabase: false,
            })
          );
        }
      }
    }
  });

  // If tables are deleted, we need to delete their columns as well
  // TODO: I don't think I do this anymore do I?
  yield takeLatest(deleteTablesSuccess, function* (action) {
    const { tableIds } = action.payload;
    // Extract all column IDs from the deleted tables
    const orphanedColumnIds = yield select((state) =>
      selectColumnIdsByParentId(state, tableIds)
    );
    if (orphanedColumnIds.length > 0) {
      yield put(
        deleteColumnsRequest({
          columnIds: orphanedColumnIds.flat(),
          recurse: false,
          deleteFromDatabase: false, // Tables are already deleted from DB when table was deleted
        })
      );
    }
  });
}
