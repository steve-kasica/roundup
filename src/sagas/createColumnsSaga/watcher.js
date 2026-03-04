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
import { call, select, takeEvery } from "redux-saga/effects";
import createColumnsWorker from "./worker";
import { createColumnsRequest, insertColumnsRequest } from "./actions";
import { createTablesSuccess } from "../createTablesSaga";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectColumnsById } from "../../slices/columnsSlice";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";

export default function* createColumnsWatcher() {
  yield takeEvery(insertColumnsRequest.type, function* (action) {
    const columnData = action.payload;
    const workerPayload = [];

    const processColumnData = function* (parentId, index, name, fillValue) {
      workerPayload.push({ parentId, index, name, fillValue });
      if (isOperationId(parentId)) {
        const operation = yield select((state) =>
          selectOperationsById(state, parentId),
        );
        if (operation.operationType === OPERATION_TYPE_STACK) {
          // For stack operations, insert a new column into each child table/operation
          // at the specified location
          for (const childId of operation.childIds) {
            yield* processColumnData(childId, index, name, fillValue);
          }
        } else if (operation.operationType === OPERATION_TYPE_PACK) {
          // For pack operations, determine which child table/operation to insert the new column into
          // Modify insertion index related to child table/operation column count
          const leftChildId = operation.childIds[0];
          const leftColumns = yield select((state) =>
            isTableId(leftChildId)
              ? selectTablesById(state, leftChildId).columnIds
              : selectOperationsById(state, leftChildId).columnIds,
          );
          if (index < leftColumns.length) {
            yield* processColumnData(leftChildId, index, name, fillValue);
          } else {
            const rightChildId = operation.childIds[1];
            yield* processColumnData(
              rightChildId,
              index - leftColumns.length,
              name,
              fillValue,
            );
          }
        }
      }
    };

    for (const { parentId, index, name, fillValue } of columnData) {
      yield* processColumnData(parentId, index, name, fillValue);
    }

    yield call(createColumnsWorker, workerPayload, true);
  });

  yield takeEvery(createColumnsRequest.type, function* (action) {
    const columnData = action.payload;
    yield call(createColumnsWorker, columnData, false);
  });

  // When tables are created, create columns for them, but do not
  // add to database since they should already exist.
  yield takeEvery(createTablesSuccess.type, function* (action) {
    const tables = action.payload;
    const workerPayload = [];
    for (const table of tables) {
      const columnNames = yield call(getTableColumnNames, table.databaseName);
      workerPayload.push(
        ...columnNames.map((name, index) => ({
          parentId: table.id, // tables and operations can be parents of columns
          name,
          databaseName: name,
          index,
        })),
      );
    }
    yield call(createColumnsWorker, workerPayload, false);
  });

  // If an operation has been recently materialized as a view,
  // then we need to create columns that represent columns of that view.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const operationUpdates = action.payload;
    const workerPayload = [];
    for (const operationUpdate of operationUpdates) {
      const operationId = operationUpdate.id;
      const changedProperties = Object.keys(operationUpdate).filter(
        (key) => key !== "id",
      );
      if (
        changedProperties.includes("isMaterialized") &&
        operationUpdate.isMaterialized == true
      ) {
        const operation = yield select((state) =>
          selectOperationsById(state, operationId),
        );
        const columnNames = yield call(
          getTableColumnNames,
          operation.databaseName,
        );
        // Get the first child's columns to use user-specified names
        // instead of database column names (which for UNION ALL views
        // inherit auto-generated databaseNames from the first child table)
        const firstChildId = operation.childIds[0];
        let firstChildColumns = [];
        if (firstChildId) {
          const firstChild = yield select((state) =>
            isTableId(firstChildId)
              ? selectTablesById(state, firstChildId)
              : selectOperationsById(state, firstChildId),
          );
          if (firstChild?.columnIds?.length > 0) {
            firstChildColumns = yield select((state) =>
              selectColumnsById(state, firstChild.columnIds),
            );
          }
        }
        workerPayload.push(
          ...columnNames.map((dbName, index) => ({
            parentId: operationId,
            name: firstChildColumns[index]?.name || dbName,
            databaseName: dbName,
            index,
          })),
        );
      }
    }
    if (workerPayload.length > 0) {
      yield call(createColumnsWorker, workerPayload, false);
    }
  });
}
