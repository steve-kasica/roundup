/**
 * @fileoverview Create columns saga watcher.
 * @module sagas/createColumnsSaga/watcher
 *
 * Watches for column creation requests and coordinates the creation process.
 * Handles both initialization (new table columns) and insertion (adding columns)
 * modes. Supports recursive column creation for operation hierarchies.
 *
 * Features:
 * - Handles createColumnsRequest actions
 * - Auto-creates columns after successful table creation
 * - Expands operation column inserts to child tables
 * - Supports PACK and STACK operation column propagation
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { call, put, select, takeEvery } from "redux-saga/effects";
import createColumnsWorker from "./worker";
import { createColumnsRequest } from "./actions";
import { createTablesSuccess } from "../createTablesSaga";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { CREATION_MODE_INITIALIZATION, CREATION_MODE_INSERTION } from ".";
import { updateOperationsSuccess } from "../updateOperationsSaga";

export default function* createColumnsWatcher() {
  yield takeEvery(createColumnsRequest.type, function* (action) {
    const { columnLocations, mode } = action.payload;
    // If we are inserting columns into an operation, we need to
    // instead insert columns into each child tables/operations of that operation.
    if (
      mode === CREATION_MODE_INSERTION &&
      columnLocations.some(({ parentId }) => isOperationId(parentId))
    ) {
      const nextPayload = [];
      const operationUpdates = columnLocations.filter(({ parentId }) =>
        isOperationId(parentId)
      );
      for (const { parentId, index } of operationUpdates) {
        const operation = yield select((state) =>
          selectOperationsById(state, parentId)
        );
        if (operation.operationType === OPERATION_TYPE_STACK) {
          // For stack operations, insert a new column into each child table/operation
          // at the specified location
          nextPayload.push(
            ...operation.childIds.map((childId) => ({
              parentId: childId,
              index,
            }))
          );
        } else if (operation.operationType === OPERATION_TYPE_PACK) {
          // For pack operations, determine which child table/operation to insert the new column into
          // Modify insertion index related to child table/operation column count
          const leftColumns = yield select((state) =>
            isTableId(operation.childIds[0])
              ? selectTablesById(state, operation.childIds[0]).columnIds
              : selectOperationsById(state, operation.childIds[0]).columnIds
          );
          if (index < leftColumns.length) {
            nextPayload.push({
              parentId: operation.childIds[0],
              index,
            });
          } else {
            nextPayload.push({
              parentId: operation.childIds[1],
              index: index - leftColumns.length,
            });
          }
        }
      } // end for loop through operationUpdates
      yield put(
        createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: nextPayload,
        })
      );
    } else {
      yield call(createColumnsWorker, action);
    }
  });

  // When tables are created, create columns for them
  yield takeEvery(createTablesSuccess.type, function* (action) {
    const { tableIds } = action.payload;
    const tables = yield select((state) => selectTablesById(state, tableIds));
    for (const table of tables) {
      yield put(
        createColumnsRequest({
          columnLocations: Array.from({ length: table.columnIds.length }).map(
            (_, index) => ({
              parentId: table.id, // tables and operations can be parents of columns
              parentDatabaseName: table.databaseName,
              index,
            })
          ),
        })
      );
    }
  });

  // If an operation has been recently materialized as a view,
  // then we need to create columns that represent columns of that view.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const { changedPropertiesById } = action.payload;
    const columnLocations = [];

    for (const [id, changedProperties] of Object.entries(
      changedPropertiesById
    )) {
      if (changedProperties.includes("isMaterialized")) {
        const operation = yield select((state) =>
          selectOperationsById(state, id)
        );
        if (operation.isMaterialized) {
          columnLocations.push(
            ...Array.from({ length: operation.columnCount }).map(
              (_, index) => ({
                parentId: id,
                parentDatabaseName: operation.databaseName,
                index,
              })
            )
          );
        }
      }
    }

    if (columnLocations.length > 0) {
      yield put(
        createColumnsRequest({
          mode: CREATION_MODE_INITIALIZATION,
          columnLocations,
        })
      );
    }
  });
}
