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
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";
import { updateOperationsFailure, updateOperationsSuccess } from "./actions";

export default function* updateOperationsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const { operationUpdates } = action.payload;

  for (let operationUpdate of operationUpdates) {
    const keys = Object.keys(operationUpdate);
    const operation = yield select((state) =>
      selectOperation(state, operationUpdate.id)
    );

    // If we're changing the operationType or children, then we need to re-create the view
    if (keys.includes("operationType") || keys.includes("children")) {
      const queryData = yield select((state) =>
        selectQueryData(
          state,
          operationUpdate.id,
          operationUpdate.children || operation.children // if just switching type, keep existing children, children field in update will be null
        )
      );
      if (
        operationUpdate.operationType === OPERATION_TYPE_STACK ||
        (operationUpdate.operationType === undefined &&
          operation.operationType === OPERATION_TYPE_STACK)
      ) {
        try {
          yield call(createStackView, queryData);
          const { rowCount, columnCount } = yield call(
            getTableDimensions,
            operationUpdate.id
          );
          operationUpdate = {
            ...operationUpdate,
            rowCount,
            columnCount,
            error: null,
          };
          successfulUpdates.push(operationUpdate);
        } catch (error) {
          console.error("Error creating stack view:", error);
          operationUpdate.error = JSON.stringify(error);
          failedUpdates.push(operationUpdate);
        }
      } else if (
        operationUpdate.operationType === OPERATION_TYPE_PACK ||
        (operationUpdate.operationType === undefined &&
          operation.operationType === OPERATION_TYPE_PACK)
      ) {
        try {
          yield call(createPackView, queryData);
          const { rowCount, columnCount } = yield call(
            getTableDimensions,
            operationUpdate.id
          );
          operationUpdate = {
            ...operationUpdate,
            rowCount,
            columnCount,
            error: null,
          };
          successfulUpdates.push(operationUpdate);
        } catch (error) {
          console.error("Error creating pack view:", error);
          operationUpdate.error = JSON.stringify(error);
          failedUpdates.push(operationUpdate);
        }
      }
    }
  }

  yield put(updateOperationsSlice([...successfulUpdates, ...failedUpdates]));

  const formatSagaEndPayload = (updates) => ({
    operationIds: updates.map(({ id }) => id),
    changedPropertiesByOperation: Object.fromEntries(
      updates.map(({ id }) => [
        id,
        Object.keys(
          operationUpdates.find(({ id: updateId }) => updateId === id)
        ).filter((key) => key !== "id"),
      ])
    ),
  });

  if (successfulUpdates.length > 0) {
    yield put(updateOperationsSuccess(formatSagaEndPayload(successfulUpdates)));
  }

  if (failedUpdates.length > 0) {
    yield put(updateOperationsFailure(formatSagaEndPayload(failedUpdates)));
  }
}
