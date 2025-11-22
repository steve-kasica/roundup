import { call, put, select } from "redux-saga/effects";
import {
  addColumns as addColumnsToSlice,
  Column,
} from "../../slices/columnsSlice";
import { createColumnsSuccess } from "./actions";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";
import {
  isTableId,
  selectTablesById,
  updateTables as updateTablesSlice,
} from "../../slices/tablesSlice";
import {
  updateOperations,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
import { CREATION_MODE_INSERTION } from ".";
import generateUUID from "../../lib/utilities/generateUUID";
import { insertColumn } from "../../lib/duckdb";
import { updateTablesRequest } from "../updateTablesSaga";
import { updateOperationsRequest } from "../updateOperationsSaga";

/**
 * The create columns saga assumes that an underlying database table exists
 * and that at a given index in that table, a column exists.
 * The saga creates column objects in the Redux state that map to those
 * underlying database columns.
 * @param {*} action
 */

export default function* createColumnsWorker(action) {
  const { columnLocations, mode } = action.payload;
  const successfulCreations = [];
  const tableIdToColumnNames = new Map();
  const tableUpdates = {};
  const operationUpdates = {};

  if (mode === CREATION_MODE_INSERTION) {
    for (const { parentId, index } of columnLocations) {
      const parentTable = yield select((state) =>
        selectTablesById(state, parentId)
      );
      const column = Column({
        parentId,
        name: "New column",
        databaseName: generateUUID("col_"),
      });
      // For insertion mode, we need to handle things slightly differenly
      yield call(
        insertColumn,
        parentTable.databaseName,
        column.databaseName,
        index
      );
      successfulCreations.push(column);

      if (Object.hasOwnProperty.call(tableUpdates, parentId) === false) {
        tableUpdates[parentId] = [...parentTable.columnIds];
      }
      tableUpdates[parentId].splice(index, 0, column.id);
    }
  } else {
    for (const { parentId, parentDatabaseName, index } of columnLocations) {
      if (!tableIdToColumnNames.has(parentId)) {
        // Fetch column names for this TABLE or VIEW from the DB only once
        const columnDBNames = yield call(
          getTableColumnNames,
          parentDatabaseName
        );
        tableIdToColumnNames.set(parentId, columnDBNames);
      }
      const column = Column({
        parentId,
        databaseName: tableIdToColumnNames.get(parentId)[index],
      });

      successfulCreations.push(column);

      if (isTableId(parentId)) {
        tableUpdates[parentId] = tableUpdates[parentId] || [];
        tableUpdates[parentId].push(column.id);
      } else {
        // Is an operation
        operationUpdates[parentId] = operationUpdates[parentId] || [];
        operationUpdates[parentId].push(column.id);
      }
    }
  }

  // Add new columns to the database slice
  yield put(addColumnsToSlice(successfulCreations));

  // Update tables with new column IDs
  if (Object.keys(tableUpdates).length > 0) {
    yield put(
      updateTablesRequest({
        tableUpdates: Object.entries(tableUpdates).map(
          ([tableId, columnIds]) => ({
            id: tableId,
            columnIds,
          })
        ),
      })
    );
  }

  // Update operations with new column IDs
  if (Object.keys(operationUpdates).length > 0) {
    yield put(
      updateOperationsRequest({
        operationUpdates: Object.entries(operationUpdates).map(
          ([operationId, columnIds]) => ({
            id: operationId,
            columnIds,
          })
        ),
      })
    );
  }

  if (successfulCreations.length > 0) {
    yield put(
      createColumnsSuccess({
        columnIds: successfulCreations.map((col) => col.id),
      })
    );
  }
}
