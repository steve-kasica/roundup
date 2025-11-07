import { put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
import { updateOperationsFailure, updateOperationsSuccess } from "./actions";
import { setFocusedObject } from "../../slices/uiSlice";
import {
  testPackOperationForFatalErrors,
  testStackOperationForFatalErrors,
} from "../../slices/alertsSlice/Alerts/Errors/utilities";
import { selectActiveColumnCountByTableId } from "../../slices/columnsSlice";

export default function* updateOperationsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const raisedAlerts = [];
  const { operationUpdates } = action.payload;

  for (let operationUpdate of operationUpdates) {
    const { id } = operationUpdate;
    const keys = Object.keys(operationUpdate);
    const operation = yield select((state) => selectOperation(state, id));

    // If we're changing the operationType or children, then we need to re-create the view
    if (
      keys.includes("operationType") ||
      keys.includes("children") ||
      keys.includes("joinType") ||
      keys.includes("joinKey1") ||
      keys.includes("joinKey2") ||
      keys.includes("joinPredicate")
    ) {
      if (
        operationUpdate.operationType === OPERATION_TYPE_STACK ||
        (operationUpdate.operationType === undefined &&
          operation.operationType === OPERATION_TYPE_STACK)
      ) {
        const children = operationUpdate.children || operation.children;
        const childColumnCounts = yield select((state) => {
          return children.map((childId) =>
            selectActiveColumnCountByTableId(state, childId)
          );
        });
        const { isAllPassing, fatalErrors, warnings } =
          testStackOperationForFatalErrors(
            {
              ...operation,
              ...operationUpdate,
            },
            childColumnCounts
          );
        if (isAllPassing) {
          successfulUpdates.push(operationUpdate);
        } else {
          console.warn("Fatal alerts raised creating stack view");
          failedUpdates.push(operationUpdate);
        }
        raisedAlerts.push(...fatalErrors, ...warnings);
      } else if (
        operationUpdate.operationType === OPERATION_TYPE_PACK ||
        (operationUpdate.operationType === undefined &&
          operation.operationType === OPERATION_TYPE_PACK)
      ) {
        const { isAllPassing, fatalErrors, warnings } =
          testPackOperationForFatalErrors({
            ...operation,
            ...operationUpdate,
          });
        if (isAllPassing) {
          successfulUpdates.push(operationUpdate);
        } else {
          console.warn("Error updateOperationsSaga/worker.js:", fatalErrors);
          failedUpdates.push(operationUpdate);
        }
        raisedAlerts.push(...fatalErrors, ...warnings);
      } else if (operation.operationType === OPERATION_TYPE_NO_OP) {
        // No-op operations don't have views to create
        successfulUpdates.push(operationUpdate);
      }
    } else {
      // Just a regular update, no need to re-create the view
      successfulUpdates.push(operationUpdate);
    }
  }

  const combinedUpdates = [...successfulUpdates, ...failedUpdates];

  yield put(updateOperationsSlice(combinedUpdates));
  // TODO add to watcher for a UI Saga
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
    raisedAlerts,
  });

  if (successfulUpdates.length > 0) {
    yield put(updateOperationsSuccess(formatSagaEndPayload(successfulUpdates)));
  }

  if (failedUpdates.length > 0) {
    yield put(updateOperationsFailure(formatSagaEndPayload(failedUpdates)));
  }
}
