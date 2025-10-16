import { call, put, select, takeEvery } from "redux-saga/effects";
import createColumnsWorker from "./worker";
import { createColumnsRequest } from "./actions";
import { createTablesSuccess } from "../createTablesSaga";
import {
  createOperationsFailure,
  createOperationsSuccess,
} from "../createOperationsSaga/actions";
import {
  OPERATION_TYPE_NO_OP,
  selectOperation,
} from "../../slices/operationsSlice";
import { selectTablesById } from "../../slices/tablesSlice";
import { CREATION_MODE_INITIALIZATION } from ".";
import {
  updateOperationsSuccess,
  updateOperationsFailure,
} from "../updateOperationsSaga";

// Create a shared function for handling both success and failure operations
const handleOperations = function* (action) {
  const { operationIds } = action.payload;
  const operations = yield select((state) =>
    operationIds.map((id) => selectOperation(state, id))
  );
  for (const { id, operationType, columnCount } of operations) {
    if (operationType === OPERATION_TYPE_NO_OP) {
      continue;
    }
    yield put(
      createColumnsRequest({
        mode: CREATION_MODE_INITIALIZATION,
        columnInfo: Array.from({ length: columnCount }).map((_, index) => ({
          parentId: id,
          index,
        })),
      })
    );
  }
};

const handleTables = function* (action) {
  const { tableIds } = action.payload;
  const tables = yield select((state) => selectTablesById(state, tableIds));
  for (const { id, initialColumnCount } of tables) {
    yield put(
      createColumnsRequest({
        mode: CREATION_MODE_INITIALIZATION,
        columnInfo: Array.from({ length: initialColumnCount }).map(
          (_, index) => ({
            parentId: id, // tables and operations can be parents of columns
            index,
          })
        ),
      })
    );
  }
};

// Handle operation updates by checking if 'children' property changed
const handleOperationUpdates = function* (action) {
  const { changedPropertiesByOperation } = action.payload;

  const operationIdsToUpdate = Object.entries(
    changedPropertiesByOperation
  ).reduce((acc, [id, changedProperties]) => {
    if (changedProperties.includes("children")) {
      acc.push(id);
    }
    return acc;
  }, []);

  if (operationIdsToUpdate.length > 0) {
    yield call(handleOperations, {
      payload: { operationIds: operationIdsToUpdate },
    });
  }
};

export default function* createColumnsWatcher() {
  yield takeEvery(createColumnsRequest.type, createColumnsWorker);

  // When tables are created, create columns for them
  yield takeEvery(createTablesSuccess.type, handleTables);

  // If an operation is successfully created, create columns for it
  yield takeEvery(createOperationsSuccess.type, handleOperations);

  // If an operation is created but fails, we still want to create
  // columns for it so the user can see the error in the UI
  yield takeEvery(createOperationsFailure.type, handleOperations);

  // if an operation is updated, we may need to create columns for it
  // depending upon if the property that changes also triggered a
  // change in the underlying database view
  yield takeEvery(updateOperationsSuccess.type, handleOperationUpdates);

  // If an operation update fails, we still want to create columns for it
  // so the user can see the error in the UI
  yield takeEvery(updateOperationsFailure.type, handleOperationUpdates);
}
