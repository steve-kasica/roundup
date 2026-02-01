/**
 * @fileoverview Delete operations saga worker.
 * @module sagas/deleteOperationsSaga/worker
 *
 * Worker saga that removes operations (and their database views) from
 * database and Redux state.
 *
 * Features:
 * - Drops views from DuckDB for PACK/STACK operations
 * - Removes operations from Redux state
 * - Reports successful and failed deletions
 *
 * @example
 * // Called by watcher saga
 * yield call(deleteOperationsWorker, payload);
 */
import { call, put } from "redux-saga/effects";
import { deleteOperations as deleteOperationsFromSlice } from "../../slices/operationsSlice";
import { dropView } from "../../lib/duckdb";
import { deleteOperationsSuccess } from "./actions";

export default function* deleteOperationsWorker(operationsToDelete) {
  let isFailure = false;
  const deletedOperations = [];

  for (const operation of operationsToDelete) {
    const deleteFromDatabase = operation.isMaterialized;
    if (deleteFromDatabase) {
      try {
        yield call(dropView, operation.databaseName);
      } catch (error) {
        isFailure = true;
        console.error(
          "deleteOperationsSaga/worker.js: Error deleting operation:",
          error,
        );
      }
    }
    deletedOperations.push(operation);
  }

  if (!isFailure) {
    yield put(deleteOperationsFromSlice(deletedOperations.map((op) => op.id)));
    yield put(deleteOperationsSuccess(deletedOperations));
  }
}
