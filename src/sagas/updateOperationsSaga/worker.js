import { put } from "redux-saga/effects";
import { updateOperations as updateOperationsSlice } from "../../slices/operationsSlice";
import { setFocusedObjectId } from "../../slices/uiSlice";
import { updateOperationsSuccess } from "./actions";

export default function* updateOperationsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const raisedAlerts = [];
  const { operationUpdates } = action.payload;

  for (let operationUpdate of operationUpdates) {
    successfulUpdates.push(operationUpdate);
    //   const { id } = operationUpdate;
    // const operation = yield select((state) => selectOperationsById(state, id));
    // const keys = Object.keys(operationUpdate);
    // // If we're changing the operationType or childIds, then we need to re-create the view
    // if (
    //   keys.includes("operationType") ||
    //   keys.includes("childIds") ||
    //   keys.includes("joinType") ||
    //   keys.includes("joinKey1") ||
    //   keys.includes("joinKey2") ||
    //   keys.includes("joinPredicate")
    // ) {
    //   if (
    //     operationUpdate.operationType === OPERATION_TYPE_STACK ||
    //     (operationUpdate.operationType === undefined &&
    //       operation.operationType === OPERATION_TYPE_STACK)
    //   ) {
    //     const children = operationUpdate.childIds || operation.childIds;
    //     const childColumnCounts = yield select((state) => {
    //       return children.map((childId) => {
    //         return selectTableColumnIds(state, childId).length;
    //       });
    //     });
    //     const { isAllPassing, fatalErrors, warnings } =
    //       testStackOperationForFatalErrors(
    //         {
    //           ...operation,
    //           ...operationUpdate,
    //         },
    //         childColumnCounts
    //       );
    //     if (isAllPassing) {
    //       successfulUpdates.push(operationUpdate);
    //     } else {
    //       console.warn("Fatal alerts raised creating stack view");
    //       failedUpdates.push(operationUpdate);
    //     }
    //     raisedAlerts.push(...fatalErrors, ...warnings);
    //   } else if (
    //     operationUpdate.operationType === OPERATION_TYPE_PACK ||
    //     (operationUpdate.operationType === undefined &&
    //       operation.operationType === OPERATION_TYPE_PACK)
    //   ) {
    //     const { isAllPassing, fatalErrors, warnings } =
    //       testPackOperationForFatalErrors({
    //         ...operation,
    //         ...operationUpdate,
    //       });
    //     if (isAllPassing) {
    //       successfulUpdates.push(operationUpdate);
    //     } else {
    //       console.warn("Error updateOperationsSaga/worker.js:", fatalErrors);
    //       failedUpdates.push(operationUpdate);
    //     }
    //     raisedAlerts.push(...fatalErrors, ...warnings);
    //   } else if (operation.operationType === OPERATION_TYPE_NO_OP) {
    //     // No-op operations don't have views to create
    //     successfulUpdates.push(operationUpdate);
    //   }
    // } else {
    //   // Just a regular update, no need to re-create the view
    //   successfulUpdates.push(operationUpdate);
    // }
  }

  yield put(updateOperationsSlice(successfulUpdates));
  yield put(
    setFocusedObjectId(successfulUpdates[successfulUpdates.length - 1].id)
  );

  const formatSagaEndPayload = (updates) => ({
    // operationIds: updates.map(({ id }) => id),
    changedPropertiesByOperationId: Object.fromEntries(
      updates.map(({ id }) => [
        id,
        Object.keys(
          operationUpdates.find(({ id: updateId }) => updateId === id)
        ).filter((key) => key !== "id"),
      ])
    ),
    // raisedAlerts,
  });

  if (successfulUpdates.length > 0) {
    yield put(updateOperationsSuccess(formatSagaEndPayload(successfulUpdates)));
  }

  // if (failedUpdates.length > 0) {
  //   yield put(updateOperationsFailure(formatSagaEndPayload(failedUpdates)));
  // }
}
