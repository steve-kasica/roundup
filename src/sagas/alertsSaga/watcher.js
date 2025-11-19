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
import { updateTablesSuccess } from "../updateTablesSaga";
import { selectTablesById } from "../../slices/tablesSlice";

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

  // If certain schema-related operation metadata properties are modified,
  // we need to re-check that operation for alerts.
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

  // When tables are updated, we need to check if any operations that depend on those tables need to be re-checked for alerts.
  // For example, if the columnIds of a table change, a stack operation using that table may now have mismatched columns.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const propertiesToCheck = ["columnIds"];
    const { changedPropertiesByTableId } = action.payload;
    const operationIdsToCheck = new Set();
    for (let [tableId, changedProperties] of Object.entries(
      changedPropertiesByTableId
    )) {
      const { parentId } = yield select((state) =>
        selectTablesById(state, tableId)
      );
      if (
        parentId &&
        !operationIdsToCheck.has(parentId) &&
        changedProperties.some((prop) => propertiesToCheck.includes(prop))
      ) {
        operationIdsToCheck.add(parentId);
      }
    }
    yield put(
      checkOperationForAlertsRequest({
        operationIds: Array.from(operationIdsToCheck),
      })
    );
  });
}
