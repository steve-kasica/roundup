/**
 * updateTablesSaga.js
 *
 * This file defines Redux Saga logic for updating tables within the application state from information an
 * external source, e.g. DuckDB.
 *
 * It updates the following properties in `updateData`:
 *    - rowCount <Number>
 *    - columnIds <Array>
 *
 * Exports:
 * - updateTablesRequest: Redux action creator to trigger the saga for updating tables.
 * - updateTablesSuccess: Redux action creator to indicate successful table updates.
 * - updateTablesFailure: Redux action creator to indicate failed table updates.
 * - updateTablesSagaWatcher: Saga watcher that listens for updateTablesRequest action and invokes the worker saga.
 *
 * Main Logic:
 * - The saga worker (updateTablesSagaWorker) manages the process of updating table data.
 * - Handles loading states, error handling, and success scenarios.
 * - Updates the application state based on the table update results.
 */

import { put, call, select } from "redux-saga/effects";
import {
  selectTablesById,
  updateTables as updateTablesSlice,
} from "../../slices/tablesSlice";
import { getTableStats } from "../../lib/duckdb";
import { updateTablesFailure, updateTablesSuccess } from "./actions";
import { DATABASE_ATTRIBUTES } from "../../slices/tablesSlice";

/**
 * Saga worker to handle the logic of updating tables.
 *
 * @generator
 * @param {Object} action - The action object
 * @param {Object} action.payload - The action payload
 * @param {string|string[]} action.payload.tableIds - The ID(s) of the table(s) to update
 * @param {Object} action.payload.updateData - The data to update the table(s) with
 * @yields {Effect} Various saga effects for handling the update process
 */
export default function* updateTablesWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  let { tableUpdates } = action.payload;

  for (let tableUpdate of tableUpdates) {
    const table = yield select((state) =>
      selectTablesById(state, tableUpdate.id)
    );

    try {
      let databaseUpdates = {};
      if (
        Object.keys(tableUpdate).some((key) =>
          DATABASE_ATTRIBUTES.includes(key)
        )
      ) {
        databaseUpdates = yield call(getTableStats, table.databaseName);
        tableUpdate = { ...tableUpdate, ...databaseUpdates[0] };
      }
      successfulUpdates.push(tableUpdate);
    } catch (error) {
      tableUpdate.error = JSON.stringify(error);
      failedUpdates.push(tableUpdate);
    }
  }

  // Update the Redux state with the results
  yield put(updateTablesSlice(successfulUpdates));

  if (failedUpdates.length > 0) {
    yield put(
      updateTablesFailure({
        tableIds: failedUpdates.map(({ id }) => id),
      })
    );
  }

  if (successfulUpdates.length > 0) {
    yield put(
      updateTablesSuccess({
        tableIds: successfulUpdates.map(({ id }) => id),
      })
    );
  }
}
