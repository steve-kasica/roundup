import { createAction } from "@reduxjs/toolkit";
import { call, put, takeEvery } from "redux-saga/effects";
import { getDuckDB } from "../../../lib/duckdb/duckdbClient";
import { addTables, Table } from "../../slices/tablesSlice";
import { addColumns, Column } from "../../slices/columnsSlice";

export const tableUploadSuccess = createAction("sagas/tableUpload");

export default function* tableUploadWatcher() {
  yield takeEvery(tableUploadSuccess.type, tableUploadWorker);
}

export function* tableUploadWorker(action) {
  const { tableName } = action.payload;
  const db = yield call(getDuckDB);
  const conn = yield call([db, db.connect]);

  // TODO: what if table already exists?

  const columnsQuery = yield call(
    [conn, conn.query],
    `PRAGMA table_info('${tableName}')`
  );
  const columns = columnsQuery
    .toArray()
    .map(({ name, type }, i) => Column(null, i, name, type));

  const rowCountQuery = yield call(
    [conn, conn.query],
    `SELECT COUNT(*) AS count FROM "${tableName}"`
  );
  const rowCount = Number(rowCountQuery.toArray()[0].count);

  const table = Table(
    "foo",
    "openrefine",
    tableName,
    columns.length, // TODO: remove this
    rowCount,
    new Date().toISOString(),
    new Date().toISOString(),
    []
  );

  columns.forEach((column) => {
    column.tableId = table.id;
  });

  table.columnIds = columns.map((column) => column.id);

  yield put(addTables([table]));

  yield put(addColumns(columns));

  yield call([conn, conn.close]);
}
