import { call, select, takeLatest } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import { selectColumnById } from "../../data/slices/columnsSlice";
import {
  selectTablesById,
  TABLE_SOURCE_OPEN_REFINE,
} from "../../data/slices/tablesSlice";
import { group } from "d3";

/**
 * Redux action creator for initiating the getting of values.
 *
 * This action is dispatched to trigger the saga responsible for getting values from the API or data source.
 *
 * @function
 * @returns {Object} Redux action with type "saga/getValues".
 */
export const getValuesAction = createAction("saga/getValues");

/**
 * Saga watcher that listens for the `getValuesAction` action type and triggers the `getValuesSaga`.
 * Utilizes `takeLatest` to ensure only the latest fetch request is processed,
 * cancelling any previous pending requests if a new one is dispatched.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `getValuesSaga` when `getValuesAction` is dispatched.
 */
export default function* watchGetValuesSaga() {
  yield takeLatest(getValuesAction.type, getValuesSaga);
}

/**
 * Saga to handle fetching values for columns from a specific data source.
 *
 * @generator
 * @param {Object} action - The dispatched Redux action.
 * @param {string|number} action.payload - The ID of the column to fetch values for.
 * @yields {Object} Redux Saga effects for selecting state and calling APIs.
 *
 * Selects the column and its parent table from the Redux state.
 * If the table's source is OpenRefine, triggers a fetch subroutine for values from OpenRefine.
 */
function* getValuesSaga(action) {
  const columnIds = Array.isArray(action.payload)
    ? action.payload
    : [action.payload];

  const columns = yield select((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );

  const columnsByTable = group(columns, (column) => column.tableId);

  for (const [tableId, columnGroup] of columnsByTable.entries()) {
    const table = yield select((state) => selectTablesById(state, tableId));
    if (table.source === TABLE_SOURCE_OPEN_REFINE) {
      yield call(fetchOpenRefineValues, table.remoteId, columnGroup);
    } else {
      console.warn(
        `getValuesSaga: Unsupported table source "${table.source}" for table ID ${tableId}.`
      );
    }
  }
}
