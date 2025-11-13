import { deleteOperationsRequest, deleteOperationsSuccess } from "./actions";
import { put, select, takeEvery, takeLatest } from "redux-saga/effects";
import deleteOperationsWorker from "./worker";
import {
  isOperationId,
  selectOperationsById,
} from "../../slices/operationsSlice";
import {
  updateOperationsRequest,
  updateOperationsSuccess,
} from "../updateOperationsSaga";

export default function* deleteOperationsWatcher() {
  yield takeEvery(deleteOperationsRequest.type, deleteOperationsWorker);

  // Whenever operations are deleted, also delete their child operations
  // yield takeEvery(deleteOperationsSuccess, function* (action) {
  //   const { operationIds } = action.payload;
  //   const operations = yield select((state) =>
  //     operationIds.map((operationId) => selectOperationsById(state, operationId))
  //   );
  //   // TODO
  //   // if (operations.length > 0) {
  //   //   const operationIdsToDelete = operations
  //   //     .flatMap((op) => op.childIds)
  //   //     .filter(isOperationId);
  //   //   yield put(
  //   //     deleteOperationsRequest({ operationIds: operationIdsToDelete })
  //   //   );
  //   // }
  // });

  // If an operation successfully updates such that it has no children, then delete it
  // Note: the `changedPropertiesByOperation` payload object is in the form { operationId: [ keyUpdated, keyUpdated ]}
  yield takeLatest(updateOperationsSuccess.type, function* (action) {
    const { changedPropertiesByOperation } = action.payload;
    const operationIdsToDelete = [];
    for (const [id, keys] of Object.entries(changedPropertiesByOperation)) {
      if (keys.includes("children")) {
        const operation = yield select((state) =>
          selectOperationsById(state, id)
        );
        if (operation.childIds.length === 0) {
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
