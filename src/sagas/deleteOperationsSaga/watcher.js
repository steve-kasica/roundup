import { deleteOperationsRequest, deleteOperationsSuccess } from "./actions";
import { put, select, takeEvery, takeLatest } from "redux-saga/effects";
import deleteOperationsWorker from "./worker";
import { isOperationId, selectOperation } from "../../slices/operationsSlice";
import {
  updateOperationsRequest,
  updateOperationsSuccess,
} from "../updateOperationsSaga";

export default function* deleteOperationsWatcher() {
  yield takeEvery(deleteOperationsRequest.type, deleteOperationsWorker);

  // Whenever operations are deleted, also delete their child operations
  yield takeEvery(deleteOperationsSuccess, function* (action) {
    const { operationIds } = action.payload;
    const operations = yield select((state) =>
      operationIds.map((operationId) => selectOperation(state, operationId))
    );
    const operationIdsToDelete = operations
      .flatMap((op) => op.children)
      .filter(isOperationId);
    yield put(deleteOperationsRequest({ operationIds: operationIdsToDelete }));
  });

  // If an operation successfully updates such that it has no children, then delete it
  // Note: the `changedPropertiesByOperation` payload object is in the form { operationId: [ keyUpdated, keyUpdated ]}
  yield takeLatest(updateOperationsSuccess.type, function* (action) {
    const { changedPropertiesByOperation } = action.payload;
    const operationIdsToDelete = [];
    for (const [id, keys] of Object.entries(changedPropertiesByOperation)) {
      if (keys.includes("children")) {
        const operation = yield select((state) => selectOperation(state, id));
        if (operation.children.length === 0) {
          operationIdsToDelete.push(id);
        }
      }
    }
    if (operationIdsToDelete.length > 0) {
      yield put(
        deleteOperationsRequest({ operationIds: operationIdsToDelete })
      );
    }
  });
}
