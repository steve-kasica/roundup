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
import { incrementRowsExplored } from "../slices/sourceTablesSlice";
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

  yield all(columnIds.map((id) => put(fetchValuesRequest({ id }))));

  try {
    // Call the OpenRefine API
    const response = yield OpenRefine.getRows(projectId, start, limit);

    const columnValues = response.rows
      .reduce(
        (acc, { cells }) => {
          cells.forEach(({ v }, i) => {
            if (!Object.keys(acc[i]).includes(v)) {
              acc[i][v] = 1;
            } else {
              acc[i][v]++;
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
