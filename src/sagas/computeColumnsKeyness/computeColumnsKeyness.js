import { createAction } from "@reduxjs/toolkit";
import { put, select, takeEvery } from "redux-saga/effects";
import { rankColumnsKeyness } from "../../lib/duckdb/rankColumnsKeyness";
import { createOperationViewSuccess } from "../createOperationViewSaga";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { addTableToSchemaSuccess } from "../addTableToSchemaSaga/addTableToSchemaSaga";
import { selectTablesById } from "../../slices/tablesSlice";
import {
  selectColumnIdsByTableId,
  updateColumns,
} from "../../slices/columnsSlice";

export const computeColumnsKeynessAction = createAction(
  "sagas/computeColumnKeyness"
);

// Watcher saga
export default function* watchComputeColumnKeyness() {
  yield takeEvery(computeColumnsKeynessAction.type, computeColumnKeynessWorker);
  yield takeEvery(addTableToSchemaSuccess.type, function* (action) {
    const { tableId } = action.payload;
    const columnIds = yield select((state) =>
      selectColumnIdsByTableId(state, tableId)
    );
    yield computeColumnKeynessWorker({
      payload: { columnIds, tableId }, // Adjust as needed
    });
  });
}

function* computeColumnKeynessWorker(action) {
  const { columnIds, tableId } = action.payload;
  const result = yield rankColumnsKeyness(columnIds, tableId);
  yield put(updateColumns(result));
}
