/**
 * @fileoverview Delete columns saga worker.
 * @module sagas/deleteColumnsSaga/worker
 *
 * Worker saga that removes columns from DuckDB tables and Redux state.
 *
 * Features:
 * - Drops columns from DuckDB tables
 * - Removes columns from Redux state
 * - Updates parent table columnIds arrays
 * - Supports state-only deletion (no DB operation)
 * - Handles deletion failures gracefully
 *
 * @example
 * // Called by watcher saga
 * yield call(deleteColumnsWorker, tablesToAlter);
 */
import { put, select } from "redux-saga/effects";
import { deleteColumns as deleteColumnsFromSlice } from "../../slices/columnsSlice";
import { deleteColumnsSuccess, deleteColumnsFailure } from "./actions";
import { dropColumns } from "../../lib/duckdb";
import { selectTablesById } from "../../slices/tablesSlice";
import { updateTablesRequest } from "../updateTablesSaga";

/**
 * Worker saga for handling column removal.
 *
 * @param {Object} action - The action object containing the payload.
 *
 * @yields {void}
 */
export default function* deleteColumnsWorker(tablesToAlter) {
  const successfulDeletions = [];
  const failedDeletions = [];
  const tableUpdates = [];

  for (let { tableId, columnsToDelete, deleteFromDatabase } of tablesToAlter) {
    const columnIdsToDelete = columnsToDelete.map((col) => col.id);
    if (deleteFromDatabase) {
      const { databaseName: parentDatabaseName, columnIds: allTableColumnIds } =
        yield select((state) => selectTablesById(state, tableId));
      const columnDatabaseNames = columnsToDelete.map(
        (col) => col.databaseName
      );
      try {
        // Call the database function to drop columns
        yield dropColumns(parentDatabaseName, columnDatabaseNames);
        successfulDeletions.push(...columnIdsToDelete);
        tableUpdates.push({
          id: tableId,
          columnIds: allTableColumnIds.filter(
            (id) => !columnIdsToDelete.includes(id)
          ),
        });
      } catch (error) {
        alert(`Error deleting columns: ${error.message}`);
        console.error(
          `Failed to drop columns [${columnDatabaseNames.join(
            ", "
          )}] from table ${tableId}:`,
          error
        );
        failedDeletions.push(...columnIdsToDelete);
      }
    } else {
      // Do not delete from database, just from state
      successfulDeletions.push(...columnIdsToDelete);
    }
  }

  if (successfulDeletions.length > 0) {
    yield put(deleteColumnsFromSlice(successfulDeletions));
    yield put(deleteColumnsSuccess(successfulDeletions));
  }

  if (tableUpdates.length > 0) {
    yield put(updateTablesRequest({ tableUpdates }));
  }

  if (failedDeletions.length > 0) {
    yield put(
      deleteColumnsFailure({
        columnIds: failedDeletions,
        error: "One or more columns failed to delete.",
      })
    );
  }
}
