/**
 * @fileoverview Create tables saga worker.
 * @module sagas/createTablesSaga/worker
 *
 * Worker saga that creates DuckDB tables from uploaded files and
 * corresponding Table objects in Redux state.
 *
 * Features:
 * - Creates tables in DuckDB from file content
 * - Generates unique database identifiers
 * - Fetches initial row/column counts
 * - Creates Table objects in Redux state
 * - Handles creation failures gracefully
 *
 * @example
 * // Called by watcher saga
 * yield call(createTablesWorker, action);
 */
import { call, put } from "redux-saga/effects";
import { addTables, Table } from "../../slices/tablesSlice";
import {
  createTables as createDBTables,
  getTableDimensions,
} from "../../lib/duckdb";
import { createTablesSuccess } from "./actions";
import generateUUID from "../../lib/utilities/generateUUID";

export default function* createTablesWorker(tablesData) {
  let isFailure = false;
  const createdTables = [];

  for (let i = 0; i < tablesData.length; i++) {
    const tableData = tablesData[i];
    const databaseName = generateUUID("t");
    let rowCount, columnCount;
    try {
      yield call(createDBTables, databaseName, tableData.fileName);
      const dimensions = yield call(getTableDimensions, databaseName);
      rowCount = dimensions.rowCount;
      columnCount = dimensions.columnCount;
    } catch (error) {
      alert(`Failed to create table ${tableData.name}: ${error.message}`);
      console.error("createTablesSaga/worker: Error creating tables:", error);
      isFailure = true;
    }
    const table = Table({
      source: tableData.source,
      databaseName,
      name: tableData.name,
      fileName: tableData.fileName, // fileName is the original name of the file uploaded
      extension: tableData.extension,
      size: tableData.size,
      mimeType: tableData.mimeType,
      dateLastModified: tableData.dateLastModified,
      rowCount,
      columnIds: new Array(columnCount),
    });
    console.log("Created table:", table);
    createdTables.push(table);
  }

  if (!isFailure) {
    yield put(addTables(createdTables));
    yield put(createTablesSuccess(createdTables));
  }
}
