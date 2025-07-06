import { put, takeLatest } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import { removeChildFromOperation } from "../../data/slices/operationsSlice";
import {
  addTablesToLoading,
  removeTablesFromLoading,
  setTablesAttribute,
} from "../../data/slices/tablesSlice";

/**
 *     removeChildFromOperation(state, action) {
      const { operationId, childId } = action.payload;
 */

export const removeTablesAction = createAction("sagas/removeTables");

// Watcher saga: spawns a new removeTablesSaga task on each REMOVE_TABLES_REQUEST
export default function* RemoveTablesSagaWatcher() {
  yield takeLatest(removeTablesAction.type, removeTablesSagaWorker);
}

// Worker saga: will be fired on REMOVE_TABLES_REQUEST actions
function* removeTablesSagaWorker(action) {
  let { operationIds, tableIds } = action.payload;

  if (!Array.isArray(tableIds)) {
    tableIds = [tableIds];
  }
  if (!Array.isArray(operationIds)) {
    operationIds = [operationIds];
  }
  if (operationIds.length !== tableIds.length) {
    throw new Error("operationIds and tableIds must have the same length");
  }

  yield put(addTablesToLoading(tableIds));

  yield put(
    removeChildFromOperation({
      operationId: operationIds[0],
      childId: tableIds[0],
    })
  );

  yield put(
    setTablesAttribute({
      ids: tableIds,
      attribute: "operationId",
      value: null,
    })
  );

  yield put(removeTablesFromLoading(tableIds));
}
