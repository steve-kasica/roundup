import { call, put, select, takeEvery } from "redux-saga/effects";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import alertsSagaWorker from "./worker";
import { checkOperationForAlertsRequest } from "./actions";
import {
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import {
  testStackOperationForFatalErrors,
  testPackOperationForFatalErrors,
} from "../../slices/alertsSlice";
import { selectActiveColumnIdsByParentId } from "../../slices/columnsSlice";

export default function* updateAlertsSagaWatcher() {
  yield takeEvery(checkOperationForAlertsRequest.type, function* (action) {
    const { operationIds } = action.payload;
    const raisedAlerts = [];

    for (let operationId of operationIds) {
      let testResults;
      // For each operation being checked, we need to get its current state
      const operation = yield select((state) =>
        selectOperationsById(state, operationId)
      );
      if (operation.operationType === OPERATION_TYPE_STACK) {
        const childColumnIds = yield select((state) =>
          selectActiveColumnIdsByParentId(state, operation.childIds)
        );
        testResults = testStackOperationForFatalErrors(
          operation,
          childColumnIds.map((columnIds) => columnIds.length)
        );
      } else {
        testResults = testPackOperationForFatalErrors(operation);
      }
      raisedAlerts.push(...testResults.fatalErrors, ...testResults.warnings);
    }
    if (raisedAlerts.length > 0) {
      yield call(alertsSagaWorker, raisedAlerts);
    }
  });

  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const operationIdsToCheck = [];
    const relevantChangedProperties = [
      "operationType",
      "childIds",
      "joinType",
      "joinKey1",
      "joinKey2",
      "joinPredicate",
    ];
    const { changedPropertiesByOperationId } = action.payload;

    Object.entries(changedPropertiesByOperationId).forEach(
      ([operationId, changedProperties]) => {
        const hasRelevantChange = relevantChangedProperties.some((prop) =>
          changedProperties.includes(prop)
        );
        if (hasRelevantChange) {
          // If any of the changed properties are relevant to alerts, we need to handle them.
          operationIdsToCheck.push(operationId);
        }
      }
    );
    yield put(
      checkOperationForAlertsRequest({ operationIds: operationIdsToCheck })
    );
  });

  // yield takeEvery(updateOperationsFailure.type, handleRaisedAlerts);
  // yield takeEvery(createOperationsSuccess.type, handleRaisedAlerts);
  // yield takeEvery(createOperationsFailure.type, handleRaisedAlerts);
}

function* handleRaisedAlerts(action) {
  const { raisedAlerts } = action.payload;
  if (raisedAlerts.length > 0) {
    // If any alerts were raised during creation, pass them along.
    yield call(alertsSagaWorker, raisedAlerts);
  }
}
