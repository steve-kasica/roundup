import { call, put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
// TODO, maybe this should be in update, rather than create?
import { selectQueryData } from "../createOperationsSaga/worker";
import { createPackView, getTableDimensions } from "../../lib/duckdb";
import { updateOperationsFailure, updateOperationsSuccess } from "./actions";

export function* updatePackOperationWorker({ operationUpdate }) {
  let isError = false;
  const operation = yield select((state) =>
    selectOperation(state, operationUpdate.id)
  );

  const triggerProps = [
    "operationType",
    "joinType",
    "joinKey1",
    "joinKey2",
    "joinPredicate",
    "children",
  ];
  const hasTriggerProp = Object.keys(operationUpdate).some((key) =>
    triggerProps.includes(key)
  );

  if (hasTriggerProp) {
    const queryData = yield select((state) =>
      selectQueryData(state, operation.id)
    );
    try {
      yield call(createPackView, queryData, operation.columnIds);
      const { rowCount } = yield call(getTableDimensions, operation.id);
      operationUpdate.rowCount = rowCount;
      operationUpdate.error = null;
    } catch (error) {
      isError = true;
      console.error("Error creating pack view:", error);
      operationUpdate.rowCount = null;
      operationUpdate.error = JSON.stringify(error);
    } finally {
      yield put(updateOperationsSlice(operationUpdate));
    }
  }

  if (!isError) {
    yield put(updateOperationsSuccess({ operationId: operation.id }));
  } else {
    yield put(
      updateOperationsFailure({
        failedUpdates: [{ operationId: operation.id }],
      })
    );
  }
}

export function* updateStackOperationWorker({ operationUpdate }) {
  let isError = false;
  const triggerProps = ["children"];

  const hasTriggerProp = Object.keys(operationUpdate).some((key) =>
    triggerProps.includes(key)
  );
  if (hasTriggerProp) {
    const queryData = yield select((state) =>
      selectQueryData(state, operationUpdate.id)
    );
    try {
      // yield call(createStackView, queryData, operationUpdate.columnIds);
    } catch (error) {
      console.error("Error creating stack view:", error);
      isError = true;
      operationUpdate.error = JSON.stringify(error);
    } finally {
      yield put(updateOperationsSlice(operationUpdate));
    }
  }

  if (!isError) {
    yield put(updateOperationsSuccess({ operationId: operationUpdate.id }));
  } else {
    yield put(
      updateOperationsFailure({
        operationId: operationUpdate.id,
      })
    );
  }
}
