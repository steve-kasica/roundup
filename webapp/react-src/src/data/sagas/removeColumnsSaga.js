import { put, call, select, takeEvery, fork, all } from "redux-saga/effects";
import {
  removeColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  selectColumnById,
} from "../slices/columnsSlice";
import OpenRefine from "../../services/open-refine";
import { createAction } from "@reduxjs/toolkit";
import { selectTablesById } from "../slices/tablesSlice/tableSelectors";
import { removeTableColumnId } from "../slices/tablesSlice/tablesSlice";

/**
 * Action creator for removing columns.
 *
 * This action is dispatched to trigger the removal of columns from the state.
 * The payload should contain information about which columns to remove.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/removeColumn" and payload.
 */
export const removeColumnsAction = createAction("sagas/removeColumn");

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumnsAction.type, function* (action) {
    // Accepts either a single id or an array of ids
    let ids = action.payload;
    if (!Array.isArray(ids)) ids = [ids];
    // Run a child saga for each id in parallel
    yield all(ids.map((id) => fork(removeColumnsSagaWorker, { payload: id })));
  });
}

function* removeColumnsSagaWorker(action) {
  const id = action.payload;

  const { tableId, name } = yield select((state) =>
    selectColumnById(state, id)
  );
  const { remoteId: projectId } = yield select((state) =>
    selectTablesById(state, tableId)
  );

  const csrf_token = "csrf_token"; // TODO: get this from the OpenRefine API

  yield put(addColumnsToLoading(id));

  try {
    // Call the OpenRefine API
    yield call(OpenRefine.removeColumn, projectId, name, csrf_token);
  } catch (error) {
    yield put(setErrorForColumn({ id, error }));
  }

  // Remove column from source columns slice
  yield put(removeColumns(id));

  // If successful, remove loading state for the column
  yield put(removeColumnsFromLoading(id));

  // Remove column id from the table's columnIds
  yield put(removeTableColumnId({ tableId, columnId: id }));
}
