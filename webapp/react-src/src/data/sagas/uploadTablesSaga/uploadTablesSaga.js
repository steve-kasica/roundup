import { createAction } from "@reduxjs/toolkit";
import { put, takeEvery } from "redux-saga/effects";
import { addTables, Table } from "../../slices/tablesSlice";
import { addColumns, Column } from "../../slices/columnsSlice";
import {
  createTables as createDBTables,
  getTableDimensions,
  renameColumns,
  summarizeTable,
} from "../../../lib/duckdb";

export const uploadTablesAction = createAction("sagas/uploadTables");

export default function* uploadTablesSagaWatcher() {
  yield takeEvery(uploadTablesAction.type, uploadTablesSagaWorker);
}

export function* uploadTablesSagaWorker(action) {
  const { filesInfo, source } = action.payload;
  const tables = filesInfo.map((fileInfo) => {
    const tableName = fileInfo.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_]/g, "_");
    const extension = fileInfo.name.split(".").pop().toLowerCase();

    const table = Table(
      source,
      tableName,
      extension,
      fileInfo.size,
      fileInfo.type, // mimeType
      0, // columnCount (to be set later)
      0, // rowCount (to be set later)
      fileInfo.lastModified
    );
    // TODO: add to constructor
    table.fileName = fileInfo.name; // Store original file name
    return table;
  });

  // Create tables in DuckDB from previously registered files
  // identified by their file names
  yield createDBTables(tables);

  // Calculate table metadata from DuckDB
  tables.forEach(async (table) => {
    const { rowCount, columnCount } = await getTableDimensions(table.id);
    table.columnIds = [];
    table.columnCount = columnCount;
    table.rowCount = rowCount;
  });

  // Create column objects for each table from DuckDB
  const columnsArrays = Promise.all(
    tables.map(async (table) =>
      (await summarizeTable(table.id)).map((summary, i) =>
        Column(table.id, i, summary.column_name, summary.column_type)
      )
    )
  );

  // Wait for all columns to be created
  // This will be an array of arrays, where each inner array corresponds to a table's columns
  // e.g. [[Column1, Column2], [Column3, Column4]]
  const tableColumns = yield columnsArrays;

  // Rename DB table columns to match the column IDs
  const renamePromises = tables.map((table, i) =>
    renameColumns(
      table.id,
      tableColumns[i].map((column) => column.name), // old names
      tableColumns[i].map((column) => column.id) // new names
    )
  );

  // Wait for all columns to be renamed
  yield Promise.all(renamePromises);

  // TODO: do I even need this anymore?
  tables.map((table, i) => {
    table.columnIds = tableColumns[i].map(({ id }) => id);
  });

  // Register tables and columns in the store
  // Order of tables vs columns doesn't matter here
  // TODO: dispatch at once in parallel?
  yield put(addTables(tables));
  yield put(addColumns(tableColumns.flat()));
}
