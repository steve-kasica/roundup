import { createAction } from "@reduxjs/toolkit";
import { select, takeLatest } from "redux-saga/effects";
import { setDrawerContents, setFocusedTableId } from "../slices/uiSlice";
import { put, take } from "redux-saga/effects";
import { COMPONENT_ID as FOCUSED_TABLE_VIEW } from "../../components/TableView/FocusedTableView";
import {
  fetchSourceTableColumnsRequest,
  fetchSourceTableColumnsSuccess,
  selectColumnById,
  selectColumnIdsByTableId,
} from "../slices/columnsSlice";
import { fetchRows } from "./getRowsSaga";

export const peekTableAction = createAction("sagas/peekTable");

export default function* peekTableSagaWatcher() {
  yield takeLatest(peekTableAction.type, peekTableSagaWorker);
}

function* peekTableSagaWorker(action) {
  const { tableId, columnCount } = action.payload;
  // First mark the current table as the focused table in the UI state slice
  yield put(setFocusedTableId(tableId));

  // TODO: fetchSourceTableColumnsRequest should
  // handle the execution logic, and not re-fire if column meta-data is already
  // present. This whole thing should be encapsulated in a fetch column-metadata saga
  const areColumnsFetched = yield select(
    (state) => selectColumnIdsByTableId(state, tableId).length > 0
  );
  if (!areColumnsFetched) {
    // If columns are not fetched, fetch them
    yield put(fetchSourceTableColumnsRequest({ tableId, columnCount }));
    // Wait for the columns to be fetched before opening the drawer
    yield take(fetchSourceTableColumnsSuccess.type);
  }

  // Third
  yield put(fetchRows({ tableId, start: 0, limit: 1000 }));

  // Third, and finally, after column data is fetch, set the drawer contents to the focused table view
  yield put(setDrawerContents(FOCUSED_TABLE_VIEW));
}
