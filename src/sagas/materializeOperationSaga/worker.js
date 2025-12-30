/**
 * @fileoverview Materialize operation saga worker.
 * @module sagas/materializeOperationSaga/worker
 *
 * Worker saga that creates DuckDB views for PACK and STACK operations.
 * Syncs database view state with operation configuration.
 *
 * Features:
 * - Creates PACK views (column joins)
 * - Creates STACK views (row unions)
 * - Fetches view dimensions after creation
 * - Reports success with dimensions or failure with error
 *
 * @example
 * // Called by watcher saga
 * yield call(materializeOperationWorker, action);
 */
import { call, put, select } from "redux-saga/effects";
import {
  materializeOperationFailure,
  materializeOperationSuccess,
} from "./actions";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
  selectOperationQueryData,
} from "../../slices/operationsSlice";
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";

export default function* materializeOperationWorker(action) {
  let { operationId } = action.payload;

  const operation = yield select((state) =>
    selectOperationsById(state, operationId)
  );
  const queryData = yield select((state) =>
    selectOperationQueryData(state, operation)
  );
  try {
    if (operation.operationType === OPERATION_TYPE_PACK) {
      yield call(createPackView, queryData);
    } else if (operation.operationType === OPERATION_TYPE_STACK) {
      yield call(createStackView, queryData);
    }
  } catch (error) {
    yield put(
      materializeOperationFailure({
        operationId,
        error: error.message,
      })
    );
    return;
  }

  const dimensions = yield call(getTableDimensions, operation.id);

  yield put(
    materializeOperationSuccess({
      operationId,
      dimensions,
    })
  );
}
