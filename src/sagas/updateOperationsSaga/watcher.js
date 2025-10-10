// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.

import { select, takeEvery } from "redux-saga/effects";
import { updateOperationsRequest } from "./actions";
import {
  updatePackOperationWorker,
  updateStackOperationWorker,
} from "./worker";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
} from "../../slices/operationsSlice";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, function* (action) {
    const { operationUpdate } = action.payload;
    const operation = yield select((state) =>
      selectOperation(state, operationUpdate.id)
    );
    if (
      operation.operationType === OPERATION_TYPE_NO_OP &&
      Object.hasOwnProperty.call(operationUpdate, "operationType")
    ) {
      // Special case: NO_OP is being changed to another type (only happens once)
      if (operationUpdate.operationType === OPERATION_TYPE_PACK) {
        yield updatePackOperationWorker({ operationUpdate });
      } else if (operationUpdate.operationType === OPERATION_TYPE_STACK) {
        yield updateStackOperationWorker({ operationUpdate });
      }
    } else if (operation.operationType === OPERATION_TYPE_PACK) {
      yield updatePackOperationWorker({ operationUpdate });
    } else if (operation.operationType === OPERATION_TYPE_STACK) {
      yield updateStackOperationWorker({ operationUpdate });
    }
  });
}
