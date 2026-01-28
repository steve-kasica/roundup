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
import { deleteColumnsSuccess } from "./actions";
import { dropColumns } from "../../lib/duckdb";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";
import { group } from "d3";

/**
 * Worker saga for handling column removal.
 *
 * @param {Object} action - The action object containing the payload.
 *
 * @yields {void}
 */
export default function* deleteColumnsWorker(
  columnsToDelete,
  deleteFromDatabase = true,
) {
  let isFailure = false;

  const columnIdsToDeleteGroupedByParent = group(
    columnsToDelete,
    (col) => col.parentId,
  );

  for (let [parentId, columns] of columnIdsToDeleteGroupedByParent) {
    if (deleteFromDatabase) {
      const { databaseName: parentDatabaseName } = yield select((state) =>
        isTableId(parentId)
          ? selectTablesById(state, parentId)
          : selectOperationsById(state, parentId),
      );
      const columnDatabaseNames = columns.map((col) => col.databaseName);
      try {
        // Call the database function to drop columns
        yield dropColumns(parentDatabaseName, columnDatabaseNames);
      } catch (error) {
        isFailure = true;
        alert(`Error deleting columns: ${error.message}`);
        console.error(
          `deleteColumnsSaga/worker.js: Failed to drop columns [${columnDatabaseNames.join(
            ", ",
          )}] from parent object ${parentId}:`,
          error,
        );
      }
    }

    if (!isFailure) {
      yield put(deleteColumnsFromSlice(columnsToDelete.map((col) => col.id)));
      yield put(deleteColumnsSuccess(columnsToDelete));
    }
  }
}
// for (let {
//   tableId: parentId,
//   columnsToDelete,
//   deleteFromDatabase,
// } of tablesToAlter) {
//   const columnIdsToDelete = columnsToDelete.map((col) => col.id);
//   if (deleteFromDatabase) {
//     const { databaseName: parentDatabaseName } = yield select((state) =>
//       isTableId(parentId)
//         ? selectTablesById(state, parentId)
//         : selectOperationsById(state, parentId),
//     );
//     const columnDatabaseNames = columnsToDelete.map(
//       (col) => col.databaseName,
//     );
//     try {
//       // Call the database function to drop columns
//       yield dropColumns(parentDatabaseName, columnDatabaseNames);
//       successfulDeletions.push(
//         ...columnsToDelete.map((col) => ({ id: col.id, parentId })),
//       );
//     } catch (error) {
//       alert(`Error deleting columns: ${error.message}`);
//       console.error(
//         `deleteColumnsSaga/worker.js: Failed to drop columns [${columnDatabaseNames.join(
//           ", ",
//         )}] from parent object ${parentId}:`,
//         error,
//       );
//     }
//   } else {
//     // Do not delete from database, just from state
//     successfulDeletions.push(
//       ...columnsToDelete.map((col) => ({ id: col.id, parentId })),
//     );
//   }
// }
