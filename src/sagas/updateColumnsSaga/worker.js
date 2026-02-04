/**
 * @fileoverview Update columns saga worker.
 * @module sagas/updateColumnsSaga/worker
 *
 * Worker saga that updates column properties, including fetching
 * statistics from DuckDB and updating column types.
 *
 * Features:
 * - Updates column types in DuckDB
 * - Fetches column statistics (min, max, nullCount, etc.)
 * - Retrieves top value counts for value distribution
 * - Handles both table and operation columns
 * - Batch updates Redux state
 *
 * @example
 * // Called by watcher saga
 * yield call(updateColumnsWorker, action);
 */
import { call, put, select } from "redux-saga/effects";
import {
  COLUMN_TYPE_CATEGORICAL,
  selectColumnsById,
  TOP_VALUES_ATTR,
  updateColumns as updateColumnsSlice,
} from "../../slices/columnsSlice";
import {
  getColumnStats,
  getValueCounts,
  setColumnType,
} from "../../lib/duckdb";
import { updateColumnsSuccess } from "./actions";
import { SUMMARY_ATTRIBUTES } from "../../slices/columnsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";
import { COLUMN_UNIQUE_VALUE_LIMIT } from "../../config";

// Worker saga
export default function* updateColumnsWorker(columnUpdates) {
  let isFailure = false;
  const processedColumnUpdates = [];

  for (let columnUpdate of columnUpdates) {
    const updatingProperties = Object.keys(columnUpdate);
    const column = yield select((state) =>
      selectColumnsById(state, columnUpdate.id),
    );
    let processedColumnUpdate = JSON.parse(JSON.stringify(columnUpdate));

    // TODO: honestly, this should be streamlined into a selector that handles both tables and operations
    const parent = yield select((state) =>
      isTableId(column.parentId)
        ? selectTablesById(state, column.parentId)
        : selectOperationsById(state, column.parentId),
    );

    // TODO: handling column type updates is currently disabled
    // if (updatingProperties.includes("columnType")) {
    //   try {
    //     // We need to update the column type in the database prior to fetching stats
    //     columnUpdate = Object.assign({}, columnUpdate, {
    //       columnType: COLUMN_TYPE_CATEGORICAL,
    //     });
    //   } catch (error) {
    //     alert(
    //       `Failed to update column type for (${
    //         column.name || column.databaseName || column.id
    //       }): ${error.message}`,
    //     );
    //     console.error(
    //       "updateColumnsSaga/worker.js",
    //       `Error updating column type for ${column.id}:`,
    //       error,
    //       "Column update data:",
    //       columnUpdate,
    //     );
    //     isFailure = true;
    //   }
    // }

    if (
      updatingProperties.some((property) =>
        SUMMARY_ATTRIBUTES.includes(property),
      )
    ) {
      try {
        const columnStats = (yield call(getColumnStats, parent.databaseName, [
          column.databaseName,
        ]))[0];
        processedColumnUpdate = { ...processedColumnUpdate, ...columnStats };
      } catch (error) {
        alert(
          `Failed to fetch column statistics for (${
            column.name || column.databaseName || column.id
          }): ${error.message}`,
        );
        console.error(
          "updateColumnsSaga/worker.js",
          `Error fetching stats for column ${column.id}:`,
          error,
          "Column update data:",
          columnUpdate,
        );
        isFailure = true;
      }
    }

    if (updatingProperties.includes(TOP_VALUES_ATTR)) {
      const topValues = yield call(
        getValueCounts,
        parent.databaseName,
        column.databaseName,
        COLUMN_UNIQUE_VALUE_LIMIT,
      );
      processedColumnUpdate = {
        ...processedColumnUpdate,
        topValues,
      };
    }
    processedColumnUpdates.push(processedColumnUpdate);
  }

  if (!isFailure) {
    // Update the column objects in the store (both successful and failed)
    yield put(updateColumnsSlice(processedColumnUpdates));
    yield put(updateColumnsSuccess(processedColumnUpdates));
  }
}
