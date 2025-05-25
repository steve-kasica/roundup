import { createAction } from "@reduxjs/toolkit";
import { select, takeEvery, put } from "redux-saga/effects";
import {
  addTableToOperation,
  appendOperation,
  appendOperationPostInitialization,
  initializeOperations,
  OPERATION_TYPE_NO_OP,
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

  const { rootOperation } = yield select((state) => {
    return {
      // columnCount: table ? table.columnCount : 0,
      rootOperation: selectRootOperation(state),
    };
  });

  if (!rootOperation) {
    yield put(initializeOperations({ tableId }));
  } else if (rootOperation.operationType === OPERATION_TYPE_NO_OP) {
    yield put(appendOperationPostInitialization({ operationType, tableId }));
  } else if (rootOperation.operationType === operationType) {
    yield put(addTableToOperation({ operationId: rootOperation.id, tableId }));
  } else {
    yield put(appendOperation({ operationType, tableId }));
  }
}
