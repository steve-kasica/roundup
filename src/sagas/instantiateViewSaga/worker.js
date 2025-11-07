import { call, put, select } from "redux-saga/effects";
import { instantiateViewFailure, instantiateViewSuccess } from "./actions";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  selectOperationQueryData,
} from "../../slices/operationsSlice";
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";

export default function* instantiateViewWorker(action) {
  let { operationId } = action.payload;

  const operation = yield select((state) =>
    selectOperation(state, operationId)
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
      instantiateViewFailure({
        operationId,
        error: error.message,
      })
    );
    return;
  }

  const dimensions = yield call(getTableDimensions, operation.id);

  yield put(
    instantiateViewSuccess({
      operationId,
      dimensions,
    })
  );
}
