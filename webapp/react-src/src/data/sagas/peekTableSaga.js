import { createAction } from "@reduxjs/toolkit";
import { takeLatest } from "redux-saga/effects";
import { setDrawerContents, setSelectedTables } from "../slices/uiSlice";
import { put } from "redux-saga/effects";
import { COMPONENT_ID as SELECTED_TABLE_VIEW } from "../../components/TableView/SelectedTableView";
import { fetchRows } from "./getRowsSaga";

export const peekTableAction = createAction("sagas/peekTable");

export default function* peekTableSagaWatcher() {
  yield takeLatest(peekTableAction.type, peekTableSagaWorker);
}

function* peekTableSagaWorker(action) {
  const { tableId } = action.payload;
  // First mark the current table as the focused table in the UI state slice
  yield put(setSelectedTables(tableId));

  // Second, fetch the first 1000 rows of the table
  yield put(fetchRows({ tableId, start: 0, limit: 1000 }));

  // Third, set the drawer contents to the focused table view
  yield put(setDrawerContents(SELECTED_TABLE_VIEW));
}
