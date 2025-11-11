import { call, put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_NO_OP,
  selectOperation,
  removeOperations as removeOperationsFromSlice,
} from "../../slices/operationsSlice";
import { dropView } from "../../lib/duckdb";
import { deleteOperationsFailure, deleteOperationsSuccess } from "./actions";

export default function* deleteOperationsWorker(action) {
  const successfulDeletions = [];
  const failedDeletions = [];
  let { operationIds } = action.payload;

  // Normalize input to ensure it's always an array
  if (!Array.isArray(operationIds)) {
    operationIds = [operationIds];
  }

  if (operationIds.length === 0) {
    return; // Nothing to delete
  }

  const operations = yield select((state) =>
    operationIds.map((id) => selectOperation(state, id))
  );

  for (const operation of operations) {
    // If the operation corresponds to a view in the database, drop that view
    if (operation.operationType !== OPERATION_TYPE_NO_OP) {
      try {
        yield call(dropView, operation.id);
        yield put(removeOperationsFromSlice(operation.id));
        successfulDeletions.push(operation.id);
      } catch (error) {
        console.error("Error deleting operation:", error);
        failedDeletions.push({ id: operation.id, error });
      }
    } else {
      // For NO_OP operations, just remove from the slice
      yield put(removeOperationsFromSlice(operation.id));
      successfulDeletions.push(operation.id);
    }
  }

  if (successfulDeletions.length > 0) {
    yield put(deleteOperationsSuccess({ operationIds: successfulDeletions }));
  }
  if (failedDeletions.length > 0) {
    yield put(deleteOperationsFailure({ operationIds: failedDeletions }));
  }
}
