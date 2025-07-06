import { createAction } from "@reduxjs/toolkit";
import { takeEvery, put, call, all, select } from "redux-saga/effects";
import OpenRefineAPI from "../services/open-refine";
import {
  addColumns,
  addColumnsToLoading,
  Column,
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_NUMERICAL,
  removeColumnsFromLoading,
  updateColumns,
} from "../data/slices/columnsSlice";
import {
  selectTablesById,
  setTableColumnIds,
  TABLE_SOURCE_OPEN_REFINE,
} from "../data/slices/tablesSlice";
import { addTableToSchema } from "./addTableToSchemaSaga";
import { peekTableAction } from "./peekTableSaga";

/**
 * Action creator for initiating the fetch of column metadata.
 *
 * This action is dispatched to trigger the saga responsible for fetching
 * metadata about columns, such as their names, types, and other relevant information.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/fetchColumnMetadataRequest".
 */
export const fetchColumnMetadataRequest = createAction(
  "sagas/fetchColumnMetadataRequest"
);

export const fetchColumnMetadataSuccess = createAction(
  "sagas/fetchColumnMetadataSuccess"
);
export const fetchColumnMetadataFailure = createAction(
  "sagas/fetchColumnMetadataFailure"
);

/**
 * Saga watcher for fetching column metadata.
 *
 * Listens for two actions:
 * 1. `fetchColumnMetadataRequest.type`: Triggers the `fetchColumnMetadataWorker` saga directly
 *    to handle fetching column metadata.
 * 2. `addTableToSchema.type`: When a table is added to the schema, dispatches a `fetchColumnMetadataRequest`
 *    action to fetch metadata for the newly added table, using both remote and local table IDs.
 * 3. `peekTableAction.type`: When a table is peeked at, dispatches a `fetchColumnMetadataRequest`
 *    this mechanism provides some opportunistic data fetching b/c we assume that peeking a table
 *    means the user is interested in combining it in Open Roundup.
 *
 * @generator
 * @yields {ForkEffect} Triggers worker sagas in response to specific actions.
 */
export default function* fetchColumnMetadataWatcher() {
  yield all([
    takeEvery(fetchColumnMetadataRequest.type, fetchColumnMetadataWorker),
    takeEvery(addTableToSchema.type, function* (action) {
      const { tableId } = action.payload;
      yield put(
        fetchColumnMetadataRequest({
          localTableIds: [tableId],
        })
      );
    }),
    takeEvery(peekTableAction.type, function* (action) {
      const { tableId } = action.payload;
      yield put(
        fetchColumnMetadataRequest({
          localTableIds: [tableId],
        })
      );
    }),
  ]);
}

/**
 * Worker saga to handle fetching column metadata for specified tables.
 *
 * This saga receives an action containing an array of local table IDs, selects the corresponding
 * table objects from the Redux state, and for each table sourced from supported sources, triggers
 * a saga to fetch column metadata from those sources, e.g. OpenRefine.
 *
 * @generator
 * @param {Object} action - The Redux action containing payload data.
 * @param {Object} action.payload - The payload object.
 * @param {Array<string|number>} action.payload.localTableIds - Array of local table IDs to fetch metadata for.
 * @yields {Array} Redux-Saga effects for selecting tables and dispatching fetch actions.
 */
function* fetchColumnMetadataWorker(action) {
  const { localTableIds } = action.payload;

  const tables = yield select((state) =>
    localTableIds.map((id) => selectTablesById(state, id))
  );

  yield all(
    tables
      .map((table) => {
        if (table.source === TABLE_SOURCE_OPEN_REFINE) {
          return call(
            fetchColumnMetadataFromOpenRefine,
            table.id,
            table.remoteId
          );
        }
        // Add more sources here as needed:
        // else if (table.source === TABLE_SOURCE_SOMETHING_ELSE) {
        //   return call(fetchColumnMetadataFromSomethingElse, table.id, table.remoteId);
        // }
        // else {
        //   return null; // or skip
        // }
      })
      .filter(Boolean) // Remove any undefined/null results
  );
}

/**
 * Saga to fetch column metadata from OpenRefine for a given table and project.
 *
 * Calls the OpenRefineAPI to retrieve column information, maps the response to
 * Column objects with inferred types (numerical or categorical), and dispatches
 * an action to add these columns to the store. Handles errors by dispatching a
 * failure action with the error message.
 *
 * @generator
 * @param {string|number} tableId - The identifier for the table to which columns belong.
 * @param {string|number} projectId - The OpenRefine project identifier.
 * @yields {Object} Redux-Saga effects for API call and dispatching actions.
 */
function* fetchColumnMetadataFromOpenRefine(tableId, projectId) {
  const { columnIds } = yield select((state) =>
    selectTablesById(state, tableId)
  );
  const columnCount = columnIds.length;

  if (columnIds.every((id) => id !== null)) {
    // If all column IDs are already set, we can skip fetching metadata
    yield put(fetchColumnMetadataSuccess());
    return;
  }
  const columns = Array.from({ length: columnCount }, (_, i) =>
    // Create "empty" columns with some values, tableId, and index
    Column(tableId, i, null, null)
  );

  // Add columns to the store
  yield put(addColumns(columns));

  // Add columns to the loading state
  yield put(addColumnsToLoading(columns.map((c) => c.id)));

  // Set the column IDs for the table
  // This is necessary to ensure the table knows which columns it has
  // and to avoid issues with the table not being able to render correctly
  // when the columns are fetched asynchronously.
  yield put(
    setTableColumnIds({ tableId, columnIds: columns.map((c) => c.id) })
  );

  try {
    const response = yield call(OpenRefineAPI.getColumnsInfo, projectId);
    const columnsInfo = response.map(
      (
        {
          name, // string
          is_numeric, // boolean
          numeric_row_count, // numeric
          non_numeric_row_count, // numeric
          error_row_count, // numeric
          blank_row_count, // numeric
        },
        i
      ) => ({
        id: columns[i].id,
        name,
        columnType:
          is_numeric && numeric_row_count === 0 && non_numeric_row_count > 0
            ? COLUMN_TYPE_NUMERICAL
            : COLUMN_TYPE_CATEGORICAL,
      })
    );

    yield put(updateColumns(columnsInfo));
    yield put(removeColumnsFromLoading(columnsInfo.map((c) => c.id)));
  } catch (error) {
    yield put(
      fetchColumnMetadataFailure(
        error instanceof Error ? error.message : "An error occurred"
      )
    );
  }
}
