import { call, put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  selectOperationQueryData,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
import {
  calcPackColumnCount,
  calcStackColumnCount,
} from "../createOperationsSaga/worker";
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";
import { updateOperationsFailure, updateOperationsSuccess } from "./actions";
import { serializeError } from "../../slices/alertsSlice/utilities/serializers";
import { setFocusedObject } from "../../slices/uiSlice";

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
        selectOperationQueryData(state, operationUpdate)
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
          };
          successfulUpdates.push(operationUpdate);
        } catch (error) {
          console.error("Error creating stack view:", error);
          const children = operationUpdate.children || operation.children;
          operationUpdate.columnCount = yield select((state) =>
            calcStackColumnCount(state, children)
          );
          operationUpdate.rowCount = 0; // TODO
          failedUpdates.push({
            ...operationUpdate,
            error: serializeError(error),
          });
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
          const children = operationUpdate.children || operation.children;
          operationUpdate.columnCount = yield select((state) =>
            calcPackColumnCount(state, children)
          );
          operationUpdate.rowCount = undefined; // We don't actually know the row count for pack ops
          failedUpdates.push({
            ...operationUpdate,
            error: serializeError(error),
          });
        }
      } else if (operation.operationType === OPERATION_TYPE_NO_OP) {
        // No-op operations don't have views to create
        successfulUpdates.push(operationUpdate);
      }
    } else {
      // Just a regular update, no need to re-create the view
      successfulUpdates.push(operationUpdate);
    }
  }

  const combinedUpdates = [...successfulUpdates, ...failedUpdates].map(
    // eslint-disable-next-line no-unused-vars
    ({ error, ...operation }) => operation
  );

  yield put(updateOperationsSlice(combinedUpdates));
  yield put(setFocusedObject(combinedUpdates[combinedUpdates.length - 1].id)); // focus the last operation created

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
    raisedAlerts: updates.map(({ error }) => error),
  });

  if (successfulUpdates.length > 0) {
    yield put(updateOperationsSuccess(formatSagaEndPayload(successfulUpdates)));
  }

  if (failedUpdates.length > 0) {
    yield put(updateOperationsFailure(formatSagaEndPayload(failedUpdates)));
  }
}
