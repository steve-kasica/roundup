import { call, put } from "redux-saga/effects";
import { addTables, Table } from "../../slices/tablesSlice";
import { createTables as createDBTables } from "../../lib/duckdb";
import { createTablesFailure, createTablesSuccess } from "./actions";

export default function* createTablesWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  const { tablesInfo } = action.payload;

  const tables = tablesInfo.map((fileInfo) =>
    Table(
      fileInfo.source,
      fileInfo.name,
      fileInfo.fileName, // fileName is the original name of the file uploaded
      fileInfo.extension,
      fileInfo.size,
      fileInfo.mimeType,
      fileInfo.dateLastModified
    )
  );

  for (const table of tables) {
    try {
      // Create new table objects for each uploaded file

      // Create tables in DuckDB from previously registered files
      // identified by their file names in the Table object
      const [{ rowCount, columnCount }] = yield call(createDBTables, table);
      table.rowCount = rowCount;
      table.initialColumnCount = columnCount;
      successfulCreations.push(table);
    } catch (error) {
      console.error("Error creating tables:", error);
      table.rowCount = 0;
      table.initialColumnCount = 0;
      table.error = JSON.stringify(error);
      failedCreations.push(table);
    }
  }

  yield put(addTables(tables));

  if (successfulCreations.length > 0) {
    yield put(
      createTablesSuccess({
        tableIds: successfulCreations.map((t) => t.id),
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(
      createTablesFailure({ tableIds: failedCreations.map((t) => t.id) })
    );
  }
}
