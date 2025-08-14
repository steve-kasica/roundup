import { createAction } from "@reduxjs/toolkit";
import { put, select, takeEvery } from "redux-saga/effects";
import { rankColumnsKeyness } from "../../lib/duckdb/rankColumnsKeyness";
import { addTablesToSchemaSuccess } from "../addTablesToSchemaSaga/addTablesToSchemaSaga";
import {
  selectColumnIdsByTableId,
  updateColumns,
} from "../../slices/columnsSlice";

export const computeColumnsKeynessAction = createAction(
  "sagas/computeColumnKeyness"
);

// Watcher saga
// This whole module should be renamed to computeColumnStats (TODO)
export default function* watchComputeColumnKeyness() {
  yield takeEvery(computeColumnsKeynessAction.type, computeColumnKeynessWorker);
  yield takeEvery(addTablesToSchemaSuccess.type, function* (action) {
    const { tableIds } = action.payload;
    const columnIds = yield select((state) =>
      tableIds.map((tableId) => selectColumnIdsByTableId(state, tableId))
    );
    yield put(computeColumnsKeynessAction({ columnIds, tableIds }));
  });
}

function* computeColumnKeynessWorker(action) {
  const { columnIds, tableIds } = action.payload;
  for (let i = 0; i < tableIds.length; i++) {
    const tableId = tableIds[i];
    const columnUpdates = yield rankColumnsKeyness(columnIds[i], tableId);
    yield put(updateColumns(columnUpdates)); // {id, totalRows, uniqueValues, nonNullValues}
  }
}
