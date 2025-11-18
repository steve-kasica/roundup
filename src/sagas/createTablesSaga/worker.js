import { call, put } from "redux-saga/effects";
import { addTables, Table } from "../../slices/tablesSlice";
import {
  createTables as createDBTables,
  getTableDimensions,
} from "../../lib/duckdb";
import { createTablesFailure, createTablesSuccess } from "./actions";
import generateUUID from "../../lib/utilities/generateUUID";

export default function* createTablesWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  const { tablesInfo } = action.payload;

  for (const info of tablesInfo) {
    try {
      const databaseName = generateUUID("t");
      yield call(createDBTables, databaseName, info.fileName);
      const { rowCount, columnCount } = yield call(
        getTableDimensions,
        databaseName
      );
      const table = Table({
        source: info.source,
        databaseName,
        name: info.name,
        fileName: info.fileName, // fileName is the original name of the file uploaded
        extension: info.extension,
        size: info.size,
        mimeType: info.mimeType,
        dateLastModified: info.dateLastModified,
        rowCount,
        columnIds: new Array(columnCount),
      });
      successfulCreations.push(table);
    } catch (error) {
      console.error("Error creating tables:", error);
      failedCreations.push(tablesInfo);
    }
  }

  yield put(addTables(successfulCreations));

  if (successfulCreations.length > 0) {
    yield put(
      createTablesSuccess({
        tableIds: successfulCreations.map((t) => t.id),
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(createTablesFailure({ tablesInfo }));
  }
}
