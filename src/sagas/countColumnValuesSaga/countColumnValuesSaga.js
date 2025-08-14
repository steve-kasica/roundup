import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import { getValueCounts } from "../../lib/duckdb";
import {
  selectColumnIdsByTableId,
  updateColumns,
} from "../../slices/columnsSlice";
import { addTablesToSchemaSuccess } from "../addTablesToSchemaSaga/addTablesToSchemaSaga";

/**
 * Redux action creator for initiating the getting of values.
 *
 * This action is dispatched to trigger the saga responsible for getting values from the API or data source.
 *
 * @function
 * @returns {Object} Redux action with type "saga/getValues".
 */
export const getValuesAction = createAction("saga/countColumnValues/request");

/**
 * Saga watcher that listens for the `getValuesAction` action type and triggers the `getValuesSaga`.
 * Utilizes `takeLatest` to ensure only the latest fetch request is processed,
 * cancelling any previous pending requests if a new one is dispatched.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `getValuesSaga` when `getValuesAction` is dispatched.
 */
export default function* countColumnValuesSagaWatcher() {
  yield takeLatest(getValuesAction.type, countColumnValuesSagaWorker);
  yield takeEvery(addTablesToSchemaSuccess.type, function* (action) {
    const { tableIds } = action.payload;
    const columnIds = yield select((state) =>
      tableIds.map((tableId) => selectColumnIdsByTableId(state, tableId))
    );
    yield put(getValuesAction({ columnIds, tableIds })); // Assuming you want to fetch for the first tableId
  });
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
function* countColumnValuesSagaWorker(action) {
  // columnIds is a 2D array of column IDs, tableIds is an array of table IDs
  let { columnIds, tableIds } = action.payload;

  // Normalize the payload to always be an array of column IDs
  columnIds = Array.isArray(columnIds) ? columnIds : [columnIds];

  const limit = 1000; // Default limit for values

  for (let i = 0; i < tableIds.length; i++) {
    const tableId = tableIds[i];
    const ids = columnIds[i];
    // Get value counts for each column
    const columns = [];
    for (const id of ids) {
      try {
        const values = yield call(getValueCounts, tableId, id, limit);
        columns.push({ id, values });
      } catch (error) {
        console.error(`Failed to get value counts for column ${id}:`, error);
      }
    }
    // Dispatch action to store the value counts in Redux state
    yield put(updateColumns(columns));
  }
}
