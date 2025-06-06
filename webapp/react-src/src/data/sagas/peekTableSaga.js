import { createAction } from "@reduxjs/toolkit";
import { takeLatest } from "redux-saga/effects";
import { setDrawerContents, setSelectedTables } from "../slices/uiSlice";
import { put } from "redux-saga/effects";
import { COMPONENT_ID as SELECTED_TABLE_VIEW } from "../../components/TableView/SelectedTableView";

/**
 * Action creator for initiating the peek table saga.
 *
 * This action is dispatched to trigger the saga responsible for peeking into a table's data.
 * Other sagas can use this action to initiate the peek table process, e.g. fetching column metadata
 *
 * @function
 * @returns {Object} Redux action with type "sagas/peekTable"
 */
export const peekTableAction = createAction("sagas/peekTable");

export default function* peekTableSagaWatcher() {
  yield takeLatest(peekTableAction.type, peekTableSagaWorker);
}

function* peekTableSagaWorker(action) {
  const { tableId } = action.payload;
  // First mark the current table as the focused table in the UI state slice
  yield put(setSelectedTables(tableId));

  // Third, set the drawer contents to the focused table view
  yield put(setDrawerContents(SELECTED_TABLE_VIEW));
}
