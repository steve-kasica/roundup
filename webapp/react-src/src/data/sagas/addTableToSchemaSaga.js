import { createAction } from "@reduxjs/toolkit";
import { select, takeEvery, put } from "redux-saga/effects";
import {
  addChildToOperation,
  addOperation,
  changeOperationType,
  OPERATION_TYPE_NO_OP,
  selectOperation,
  selectRootOperation,
} from "../slices/operationsSlice";

export const addTableToSchema = createAction("sagas/addTableToSchema");

export const ADD_TABLE_EVENT = "add-table";
export const ADD_OPERATION_EVENT = "add-operation";

export default function* addTableToSchemaSagaWatcher() {
  yield takeEvery(addTableToSchema.type, addTableToSchemaSagaWorker);
}
/**
 * Saga worker to add a table to the schema
 * @param {Object} action - The action object
 * @param {string} action.payload.tableId - The ID of the table to add
 */
function* addTableToSchemaSagaWorker(action) {
  const { tableId, operationType } = action.payload;

  const rootOperationId = yield select(selectRootOperation);

  if (!rootOperationId) {
    // Initialize
    yield put(
      addOperation({ operationType: OPERATION_TYPE_NO_OP, childId: tableId })
    );
  } else {
    const rootOperation = yield select((state) =>
      selectOperation(state, rootOperationId)
    );
    if (rootOperation.operationType === OPERATION_TYPE_NO_OP) {
      // Second table added, change root operation type
      yield put(
        changeOperationType({
          operationId: rootOperation.id,
          operationType,
        })
      );
      yield put(
        addChildToOperation({
          operationId: rootOperation.id,
          childId: tableId,
        })
      );
    } else if (rootOperation.operationType === operationType) {
      yield put(
        addChildToOperation({ operationId: rootOperation.id, tableId })
      );
    } else {
      // Different operation type, create a new operation, add it as the new root operation
      yield put(addOperation({ operationType, tableId }));
    }
  }
}
