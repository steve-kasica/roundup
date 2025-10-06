import { createAction } from "@reduxjs/toolkit";
import { takeLatest, put, select, call } from "redux-saga/effects";
import {
  addColumns,
  appendToSelectedColumns,
  Column,
} from "../../slices/columnsSlice";
import { selectTablesById } from "../../slices/tablesSlice/tableSelectors";
import { updateTables } from "../../slices/tablesSlice/tablesSlice";
import { insertColumn } from "../../lib/duckdb";

/**
 * Action types (adjust imports if your project centralizes action types)
 */
export const insertNewColumnRequest = createAction(
  "sagas/insertNewColumnSaga/request"
);
export const insertNewColumnSuccess = createAction(
  "sagas/insertNewColumnSaga/success"
);
export const insertNewColumnFailure = createAction(
  "sagas/insertNewColumnSaga/failure"
);

/**
 * Worker saga
 * api should expose an `insertColumn(boardId, columnData)` method that returns a Promise.
 *
 * action.payload expected shape: { boardId, column }
 */
export function* handleInsertNewColumn(action) {
  console.log("handleInsertNewColumn action:", action);
  try {
    const { tableId, insertionIndex } = action.payload || {};
    if (!tableId || insertionIndex < 0 || insertionIndex === undefined) {
      throw new Error("Missing tableId or insertionIndex in payload");
    }

    const table = yield select((state) => selectTablesById(state, tableId));
    if (!table) {
      throw new Error(`Table with id ${tableId} not found`);
    }

    // Create new column metadata
    const column = Column(table.id, insertionIndex, {
      name: "New Column",
      columnType: "NULL",
      approxUnique: 0,
      avg: null,
      count: table.rowCount || 0,
      max: null,
      min: null,
      nullPercentage: 1,
      q25: null,
      q50: null,
      q75: null,
      std: null,
    });

    // Add new column to global state before DB operation to get the ID assigned
    yield put(addColumns([column]));

    // Insert new column into DuckDB
    yield call(insertColumn, tableId, column.id, insertionIndex);

    // Update table's columnIds to include the new column at the correct index
    yield put(
      updateTables({
        id: tableId,
        columnIds: table.columnIds.toSpliced(insertionIndex, 0, column.id),
      })
    );

    // Add new column to selectedColumns so it displays in UI immediately
    yield put(appendToSelectedColumns(column.id));

    // dispatch success with returned data
    yield put(insertNewColumnSuccess(action.payload));
  } catch (error) {
    yield put(insertNewColumnFailure(error));
  }
}

/**
 * Create a root saga for insert new column.
 * Accepts an api object to keep the saga testable and decoupled from implementations.
 *
 * Usage:
 *   import api from 'services/api';
 *   import createInsertNewColumnSaga from './insertNewColumnSaga';
 *   yield all([createInsertNewColumnSaga(api)()]);
 *
 * Or if combined with other sagas:
 *   export default function* rootSaga() { yield all([createInsertNewColumnSaga(api)()]); }
 */
export default function* createInsertNewColumnSaga() {
  yield takeLatest(insertNewColumnRequest.type, handleInsertNewColumn);
}
