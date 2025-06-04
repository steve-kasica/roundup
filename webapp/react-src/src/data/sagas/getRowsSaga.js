/**
 * getRowsSaga.js
 */

import { createAction } from "@reduxjs/toolkit";
import { all, put, select, takeEvery } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import {
  fetchValuesFailure,
  fetchValuesRequest,
  fetchValuesSuccess,
  selectColumnIdsByTableId,
} from "../slices/columnsSlice";
import { incrementRowsExplored } from "../slices/tablesSlice";
import { addTableToSchema } from "./addTableToSchemaSaga";

export const fetchRows = createAction("fetchRows");

export default function* getRowsSagaWatcher() {
  // Run the saga whenever a table is added to the schema
  yield takeEvery(addTableToSchema.type, addTableToSchemaWorker);

  // Run the saga whenever the action is called directly, e.g. for pagination
  yield takeEvery(fetchRows.type, getRowsSagaWorker);
}

function* addTableToSchemaWorker(action) {
  const { tableId } = action.payload;
  yield put(fetchRows({ tableId, start: 0, limit: 1000 }));
}

function* getRowsSagaWorker(action) {
  let tableId = action.payload.tableId;
  let projectId = tableId;
  let start = action.payload.start || 0;
  let limit = action.payload.limit || 1000;

  const columnIds = yield select((state) =>
    selectColumnIdsByTableId(state, tableId)
  );

  const { rowsExplored } = yield select((state) => state.tables.data[tableId]);

  if (start < rowsExplored) {
    // These rows have already been fetched, so we don't need to fetch them again
    return;
  }

  yield all(columnIds.map((id) => put(fetchValuesRequest({ id }))));

  try {
    // Call the OpenRefine API
    const response = yield OpenRefine.getRows(projectId, start, limit);

    const columnValues = response.rows
      .reduce(
        (acc, { cells, i }) => {
          cells.forEach(({ v }, j) => {
            if (!Object.keys(acc[j]).includes(v)) {
              acc[j][v] = [i];
            } else {
              acc[j][v].push(i);
            }
          });
          return acc;
        },
        Array.from(
          { length: response.rows[0].cells.length },
          () => new Object()
        )
      )
      .map((valueCounts, i) => ({ id: columnIds[i], valueCounts }));

    yield all(
      columnValues.map(({ id, valueCounts }) =>
        put(fetchValuesSuccess({ id, valueCounts }))
      )
    );

    yield put(
      incrementRowsExplored({ tableId, rowsExplored: response.rows.length })
    );
  } catch (error) {
    // Dispatch failure action
    console.error("Error fetching rows:", error);
    yield all(
      columnIds.map((id) =>
        put(fetchValuesFailure({ id, error: error.message }))
      )
    );
  }
}
