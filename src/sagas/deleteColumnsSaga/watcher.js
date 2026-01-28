/**
 * @fileoverview Delete columns saga watcher.
 * @module sagas/deleteColumnsSaga/watcher
 *
 * Watches for actions that trigger column deletions, including direct requests
 * for column deletion as well as side-effects from the successful completion of other
 * sagas (e.g., table deletions, operation updates). The watcher also handles recursive
 * deletion for operation columns by propagating to child tables/operations.
 *
 */
import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import {
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
import {
  selectAllColumnIdsByParentId,
  selectOrphanedColumnIds,
} from "../../slices/columnsSlice/selectors";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";

export default function* deleteColumnsSaga() {
  // Main watcher for delete columns requests
  // If the column to be deleted is an operation's column, then the watcher
  // will recurse into the child tables/operations to delete the appropriate
  // columns as well.
  yield takeEvery(deleteColumnsRequest.type, function* (action) {
    const deleteFromDatabase = true;
    const columnsToDelete = [];

    const processColumnIds = function* (columnIds) {
      const columns = yield select((state) =>
        selectColumnsById(state, columnIds),
      );
      for (let col of columns) {
        columnsToDelete.push(col);
        if (isOperationId(col.parentId)) {
          const indexInOperation = yield select((state) => {
            const operation = selectOperationsById(state, col.parentId);
            return operation.columnIds.indexOf(col.id);
          });

          // recursive case, column belong to an operation
          const { operationType, childIds } = yield select((state) =>
            selectOperationsById(state, col.parentId),
          );
          const childColumnIds = yield select((state) => {
            return selectColumnIdsByParentId(state, childIds);
          });
          if (operationType === OPERATION_TYPE_STACK) {
            const childColsToDelete = childColumnIds
              // eslint-disable-next-line no-unused-vars
              .map((tableColumnIds, i) =>
                tableColumnIds.filter((_, j) => j === indexInOperation),
              )
              .flat();
            yield* processColumnIds(childColsToDelete);
          } else {
            // PACK operation
            const tableIndex =
              indexInOperation >= childColumnIds[0].length ? 1 : 0;
            const childColId =
              childColumnIds[tableIndex][
                tableIndex === 0
                  ? indexInOperation
                  : indexInOperation - childColumnIds[0].length
              ];
            yield* processColumnIds([childColId]);
          }
        }
      }
    };

    yield* processColumnIds(action.payload);

    yield call(deleteColumnsWorker, columnsToDelete, deleteFromDatabase);
  });

  // If tables are deleted, we need to delete their columns as well
  yield takeLatest(deleteTablesSuccess, function* (action) {
    const deleteFromDatabase = false; // Tables are already deleted from DB when table was deleted
    const tables = action.payload;
    const tableIds = tables.map(({ id }) => id);
    // Extract all column IDs from the deleted tables
    const orphanedColumnIds = yield select((state) =>
      selectAllColumnIdsByParentId(state, tableIds).flat(),
    );
    if (orphanedColumnIds.length > 0) {
      const orphanedColumns = yield select((state) =>
        selectColumnsById(state, orphanedColumnIds),
      );
      yield call(deleteColumnsWorker, orphanedColumns, deleteFromDatabase);
    }
  });

  // If an operation is deleted, we need to delete its columns as well
  yield takeLatest(deleteOperationsSuccess.type, function* (action) {
    const deleteFromDatabase = false; // Operations are already deleted from DB when operation was deleted
    const deletedOperations = action.payload;
    // Extract all column IDs from the deleted operations
    const orphanedColumnIds = yield select((state) =>
      selectAllColumnIdsByParentId(
        state,
        deletedOperations.map((op) => op.id),
      ).flat(),
    );
    if (orphanedColumnIds.length > 0) {
      yield call(deleteColumnsWorker, orphanedColumnIds, deleteFromDatabase);
    }
  });

  // When schema-related properties of an operation are updated,
  // we need to re-create the operation's columns, so this saga
  // must delete any orphaned columns that belonged to that opeation.
  yield takeLatest(updateOperationsSuccess.type, function* (action) {
    const deleteFromDatabase = false;
    const { changedPropertiesById } = action.payload;

    for (let [operationId, changedProperties] of Object.entries(
      changedPropertiesById,
    )) {
      if (changedProperties.includes("columnIds")) {
        const orphanedColumnIds = yield select((state) =>
          selectOrphanedColumnIds(state, operationId),
        );
        // Bypass deleteColumnsRequest to avoid recursing into table columns
        // since we're just swapping out operation columns here.
        yield call(deleteColumnsWorker, orphanedColumnIds, deleteFromDatabase);
      }
    }
  });
}
