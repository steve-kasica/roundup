import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import {
  selectActiveColumnIdsByParentId,
  selectColumnIdsByParentId,
  selectColumnsById,
} from "../../slices/columnsSlice";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { group } from "d3";
import { isTableId } from "../../slices/tablesSlice";
import deleteColumnsWorker from "./worker";

export default function* deleteColumnsSaga() {
  // Main watcher for delete columns requests
  // If the column to be deleted is an operation's column, then the watcher
  // will recurse into the child tables/operations to delete the appropriate
  // columns as well.
  yield takeEvery(deleteColumnsRequest.type, function* (action) {
    const tablesToAlter = [];
    let { columnIds } = action.payload;
    columnIds = Array.isArray(columnIds) ? columnIds : [columnIds];
    const columns = yield select((state) =>
      selectColumnsById(state, columnIds)
    );
    const columnsToDeleteByParentId = group(columns, (col) => col.parentId);

    for (let [parentId, columnsToDelete] of columnsToDeleteByParentId) {
      if (isTableId(parentId)) {
        tablesToAlter.push({
          tableId: parentId,
          columnsToDelete,
        });
      } else {
        // If we're deleting operation columns, then we need to recurse into the children
        // tables/operations, map the operation columns to the appropriate table columns
        // and dispatch a delete columns request with those child columns.
        const childColumnIdsToDelete = [];
        const operation = yield select((state) =>
          selectOperationsById(state, parentId)
        );
        const childColumnIds = yield select((state) =>
          selectActiveColumnIdsByParentId(state, operation.childIds)
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
        yield put(deleteColumnsRequest({ columnIds: childColumnIdsToDelete }));
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
        const currentColumnIds = yield select(
          (state) => selectOperationsById(state, operationId).columnIds
        );
        const allColumnIds = yield select((state) =>
          selectColumnIdsByParentId(state, operationId)
        );
        const orphanedColumnIds = allColumnIds.filter(
          (id) => !currentColumnIds.includes(id)
        );
        if (orphanedColumnIds.length > 0) {
          yield put(deleteColumnsRequest({ columnIds: orphanedColumnIds }));
        }
      }
    }
    yield null;
  });

  // If tables are deleted, we need to delete their columns as well
  // yield takeLatest(deleteTablesSuccess, function* (action) {
  //   const { tableIds } = action.payload;
  //   // Extract all column IDs from the deleted tables
  //   const columnIdsToRemove = tableIds.flatMap((table) => table.columnIds);
  //   if (columnIdsToRemove.length > 0) {
  //     yield put(deleteColumnsRequest({ columnIds: columnIdsToRemove }));
  //   }
  // });

  // If an operation `columnIds` property update has succeeded, we need
  // to check if there are any columns that have been orphaned due to
  // being removed from that operation, and delete those columns.
  //
}
