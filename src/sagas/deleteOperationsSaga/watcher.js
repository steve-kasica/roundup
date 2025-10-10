import { deleteOperationsRequest, deleteOperationsSuccess } from "./actions";
import { select, takeEvery } from "redux-saga/effects";
import deleteOperationsWorker from "./worker";
import { isOperationId, selectOperation } from "../../slices/operationsSlice";

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
    yield deleteOperationsWorker({
      payload: { operationIds: operationIdsToDelete },
    });
  });
}
