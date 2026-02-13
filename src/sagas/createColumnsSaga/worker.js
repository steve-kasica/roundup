/**
 * @fileoverview Create columns saga worker.
 * @module sagas/createColumnsSaga/worker
 *
 * Worker saga that creates column objects in Redux state mapped to
 * underlying database columns. Handles both initialization (reading
 * existing columns) and insertion (adding new columns) modes.
 *
 * Features:
 * - Creates Column objects in Redux state
 * - Inserts new columns into DuckDB tables
 * - Fetches column names from database for initialization
 * - Updates table/operation columnIds arrays
 * - Generates unique database column identifiers
 *
 * @example
 * // Called by watcher saga
 * yield call(createColumnsWorker, action);
 */
import { call, put, select } from "redux-saga/effects";
import {
  addColumns as addColumnsToSlice,
  Column,
} from "../../slices/columnsSlice";
import { createColumnsSuccess } from "./actions";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";
import generateUUID from "../../lib/utilities/generateUUID";
import { insertColumn } from "../../lib/duckdb";

/**
 * The create columns saga assumes that an underlying database table exists
 * and that at a given index in that table, a column exists.
 * The saga creates column objects in the Redux state that map to those
 * underlying database columns.
 * @param {*} action
 */

export default function* createColumnsWorker(
  columnData,
  addToDatabase = false,
) {
  let isFailure = false;
  const columnsCreated = [];

  for (const { parentId, index, name, fillValue, databaseName } of columnData) {
    const parentTable = yield select((state) =>
      isTableId(parentId)
        ? selectTablesById(state, parentId)
        : selectOperationsById(state, parentId),
    );
    const column = Column({
      parentId,
      name: name || "New column",
      databaseName: databaseName || generateUUID("column"),
      index,
    });
    if (addToDatabase) {
      try {
        yield call(
          insertColumn,
          parentTable.databaseName,
          column.databaseName,
          index,
          "TEXT",
          fillValue,
        );
      } catch (error) {
        isFailure = true;
        alert("Error inserting column into database: " + error.message);
        console.error("createColumnSaga/worker: error inserting column", error);
      }
    }
    columnsCreated.push(column);
  }

  if (!isFailure) {
    yield put(addColumnsToSlice(columnsCreated));
    yield put(createColumnsSuccess(columnsCreated));
  }
}
