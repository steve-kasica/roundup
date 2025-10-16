import { call, put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
// TODO, maybe this should be in update, rather than create?
import {
  calcPackColumnCount,
  calcStackColumnCount,
  selectQueryData,
} from "../createOperationsSaga/worker";
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";
import { updateOperationsFailure, updateOperationsSuccess } from "./actions";
import { serializeError } from "../../components/Errors/PackErrors";

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
    if (
      keys.includes("operationType") ||
      keys.includes("children") ||
      keys.includes("joinType") ||
      keys.includes("joinKey1") ||
      keys.includes("joinKey2") ||
      keys.includes("joinPredicate")
    ) {
      const queryData = yield select((state) =>
        selectQueryData(state, operationUpdate)
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
          operationUpdate.error = serializeError(error);
          const children = operationUpdate.children || operation.children;
          operationUpdate.columnCount = yield select((state) =>
            calcStackColumnCount(state, children)
          );
          operationUpdate.rowCount = 0; // TODO
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
          console.error("Error updateOperationsSaga/worker.js:", error);
          operationUpdate.error = serializeError(error);
          const children = operationUpdate.children || operation.children;
          operationUpdate.columnCount = yield select((state) =>
            calcPackColumnCount(state, children)
          );
          operationUpdate.rowCount = undefined; // We don't actually know the row count for pack ops
          failedUpdates.push(operationUpdate);
        }
      }
    } else {
      // Just a regular update, no need to re-create the view
      successfulUpdates.push(operationUpdate);
    }
  }

  const combinedUpdates = [...successfulUpdates, ...failedUpdates];
  combinedUpdates[combinedUpdates.length - 1].isFocused = true;

  yield put(updateOperationsSlice(combinedUpdates));

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
