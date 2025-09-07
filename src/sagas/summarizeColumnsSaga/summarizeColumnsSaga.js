import { createAction } from "@reduxjs/toolkit";
import { takeLatest, call, put, select } from "redux-saga/effects";
import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  selectColumnById,
  setErrorForColumn,
  updateColumns,
} from "../../slices/columnsSlice";
import { group } from "d3-array";
import { summarizeTable } from "../../lib/duckdb";

// Action types
export const SUMMARIZE_COLUMN_REQUEST = createAction(
  "summarizeColumnSaga/request"
);
export const SUMMARIZE_COLUMN_SUCCESS = createAction(
  "summarizeColumnSaga/success"
);
export const SUMMARIZE_COLUMN_FAILURE = createAction(
  "summarizeColumnSaga/failure"
);

// Worker saga
function* summarizeColumnsWorker(action) {
  let columnIds = action.payload;
  columnIds = Array.isArray(columnIds) ? columnIds : [columnIds];
  try {
    yield put(addColumnsToLoading(columnIds));
    const columns = yield select((state) =>
      // TODO: make this plural
      columnIds.map((id) => selectColumnById(state, id))
    );
    const columnGroups = group(columns, (c) => c.tableId);
    for (const [tableId, columns] of columnGroups.entries()) {
      const columnIds = columns.map((c) => c.id);
      const summary = yield call(summarizeTable, tableId, columnIds);
      yield put(updateColumns(summary));
    }
    yield put(removeColumnsFromLoading(columnIds));
    yield put(SUMMARIZE_COLUMN_SUCCESS());
  } catch (error) {
    // TODO: doesn't handle multiple columns at once
    console.error("Error in summarizeColumnsWorker:", error);
    yield put(setErrorForColumn(columnIds, error.message));

    yield put(SUMMARIZE_COLUMN_FAILURE({ error }));
  }
}

// Watcher saga
export default function* summarizeColumnsSaga() {
  yield takeLatest(SUMMARIZE_COLUMN_REQUEST, summarizeColumnsWorker);
}
