import { call, put, select } from "redux-saga/effects";
import { selectOperation } from "../../slices/operationsSlice";
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
    try {
      yield call(dropView, operation.id);
      successfulDeletions.push(operation.id);
    } catch (error) {
      console.error("Error deleting operation:", error);
      failedDeletions.push(operation.id);
    }
    // Remove the view in the database
    // Remove the operation from operations slice
  }

  if (successfulDeletions.length > 0) {
    yield put(deleteOperationsSuccess({ operationIds: successfulDeletions }));
  }
  if (failedDeletions.length > 0) {
    yield put(deleteOperationsFailure({ operationIds: failedDeletions }));
  }
}
