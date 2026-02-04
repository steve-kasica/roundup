/**
 * @fileoverview Update tables saga worker.
 * @module sagas/updateTablesSaga/worker
 *
 * Worker saga that updates table properties from database state,
 * including fetching row counts and column metadata.
 *
 * Features:
 * - Fetches table statistics from DuckDB
 * - Updates rowCount and columnIds properties
 * - Tracks which properties changed for downstream sagas
 * - Handles update failures gracefully
 *
 * @example
 * // Called by watcher saga
 * yield call(updateTablesWorker, action);
 */

import { put, call, select } from "redux-saga/effects";
import {
  selectTablesById,
  updateTables as updateTablesSlice,
} from "../../slices/tablesSlice";
import { getTableStats } from "../../lib/duckdb";
import { updateTablesSuccess } from "./actions";

// Define which table attributes require database calls to update
const DATABASE_ATTRIBUTES = ["rowCount"];

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
export default function* updateTablesWorker(tableUpdates) {
  let isFailure = false;

  for (let i = 0; i < tableUpdates.length; i++) {
    let tableUpdate = tableUpdates[i];
    if (
      Object.keys(tableUpdate).some((key) => DATABASE_ATTRIBUTES.includes(key))
    ) {
      const { databaseName, name } = yield select((state) =>
        selectTablesById(state, tableUpdate.id),
      );
      try {
        // TODO: Optimize to only fetch changed attributes
        let databaseUpdates = yield call(getTableStats, databaseName);
        Object.assign(tableUpdate, databaseUpdates[0]);
      } catch (error) {
        isFailure = true;
        alert(`Failed to update table ${name}: ${error.message}`);
        console.error("updateTablesSgaga/worker", error);
      }
    }
  }

  if (!isFailure) {
    // Update the Redux state with the results
    yield put(updateTablesSlice(tableUpdates));
    yield put(updateTablesSuccess(tableUpdates));
  }
}
