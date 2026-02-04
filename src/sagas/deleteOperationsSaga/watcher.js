/**
 * @fileoverview Delete operations saga watcher.
 * @module sagas/deleteOperationsSaga/watcher
 *
 * Watches for operation deletion requests and triggers the worker saga.
 * Auto-deletes operations that become childless after updates.
 *
 * Features:
 * - Handles deleteOperationsRequest actions
 * - Auto-deletes operations with no children
 * - Coordinates with updateOperationsSuccess
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { deleteOperationsRequest } from "./actions";
import { call, put, select, takeEvery, takeLatest } from "redux-saga/effects";
import deleteOperationsWorker from "./worker";
import {
  isOperationId,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { updateOperationsSuccess } from "../updateOperationsSaga";

export default function* deleteOperationsWatcher() {
  // Watch for delete operation requests, if the operation to be deleted has child operations,
  // those child operations should be deleted by the worker saga as well.
  yield takeEvery(deleteOperationsRequest.type, function* (action) {
    const operationIds = action.payload;
    const operationsToDelete = [];
    const operations = yield select((state) =>
      selectOperationsById(state, operationIds),
    );
    // Recursively collect all operation IDs including nested child operations
    function* collectOperationIds(ops) {
      for (const operation of ops) {
        operationsToDelete.push(operation);

        // If the operation has child operations, recursively collect them
        const childOperationIds = operation.childIds.filter(isOperationId);
        if (childOperationIds.length > 0) {
          const childOperations = yield select((state) =>
            selectOperationsById(state, childOperationIds),
          );
          yield* collectOperationIds(childOperations);
        }
      }
    }

    yield* collectOperationIds(operations);

    yield call(deleteOperationsWorker, operationsToDelete);
  });

  // If an operation successfully updates such that it has no children (`childIds` = []),
  // then delete it.
  // Note: the `changedPropertiesByOperation` payload object is in the form
  // { operationId: [ keyUpdated, keyUpdated ]}
  yield takeLatest(updateOperationsSuccess.type, function* (action) {
    const operationUpdates = action.payload;
    const operationsToDelete = [];
    for (const operationUpdate of operationUpdates) {
      const operationId = operationUpdate.id;
      const changedProperties = Object.keys(operationUpdate).filter(
        (key) => key !== "id",
      );
      if (changedProperties.includes("childIds")) {
        const operation = yield select((state) =>
          selectOperationsById(state, operationId),
        );
        if (operation.childIds.length === 0) {
          operationsToDelete.push(operation);
        }
      }
    }

    if (operationsToDelete.length > 0) {
      yield call(deleteOperationsWorker, operationsToDelete);
    }
  });
}
