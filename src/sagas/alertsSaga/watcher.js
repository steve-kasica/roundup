/**
 * @fileoverview Alert saga watcher for operation validation.
 * @module sagas/alertsSaga/watcher
 *
 * Watches for operation and table updates to trigger alert validation.
 * Automatically checks operations for fatal errors after changes.
 *
 * Features:
 * - Responds to explicit alert check requests
 * - Auto-validates after operation updates
 * - Auto-validates after table updates
 * - Handles PACK and STACK operation-specific validations
 * - Triggers worker saga with raised alerts
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
import { call, select, takeEvery } from "redux-saga/effects";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { validateOperationWorker } from "./worker";
import { selectOperationsById } from "../../slices/operationsSlice";
import { updateTablesSuccess } from "../updateTablesSaga";
import { selectTablesById } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";

export default function* updateAlertsSagaWatcher() {
  // When new operations are created, we need to check them for alerts.
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const operations = action.payload;
    yield call(validateOperationWorker, operations);
  });

  // If certain schema-related operation metadata properties are modified,
  // we need to re-check that operation for alerts.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const operationsToValidate = [];
    const operationUpdates = action.payload;

    const relevantChangedProperties = [
      "operationType",
      "childIds",
      "joinType",
      "joinKey1",
      "joinKey2",
      "joinPredicate",
    ];

    for (const operationUpdate of operationUpdates) {
      const operationId = operationUpdate.id;
      const changedProperties = Object.keys(operationUpdate).filter(
        (key) => key !== "id",
      );
      const operation = yield select((state) =>
        selectOperationsById(state, operationId),
      );

      if (
        relevantChangedProperties.some((prop) =>
          changedProperties.includes(prop),
        )
      ) {
        operationsToValidate.push(operation);
      }

      if (changedProperties.includes("columnIds") && operation.parentId) {
        const parentOperation = yield select((state) =>
          selectOperationsById(state, operation.parentId),
        );
        operationsToValidate.push(parentOperation);
      }
    }

    if (operationsToValidate.length > 0) {
      yield call(validateOperationWorker, operationsToValidate);
    }
  });

  // When tables are updated, we need to check if any operations that depend on
  // those tables need to be re-checked for alerts. For example, if the columnIds of
  // a table change, a stack operation using that table may now have mismatched columns.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const propertiesToCheck = ["columnIds"];
    const tableUpdates = action.payload;
    const operationsToValidate = new Set();
    for (const tableUpdate of tableUpdates) {
      const changedProperties = Object.keys(tableUpdate).filter(
        (key) => key !== "id",
      );
      const { parentId } = yield select((state) =>
        selectTablesById(state, tableUpdate.id),
      );
      if (
        parentId &&
        !operationsToValidate.has(parentId) &&
        changedProperties.some((prop) => propertiesToCheck.includes(prop))
      ) {
        const operation = yield select((state) =>
          selectOperationsById(state, parentId),
        );
        operationsToValidate.add(operation);
      }
    }
    if (operationsToValidate.size > 0) {
      yield call(validateOperationWorker, Array.from(operationsToValidate));
    }
  });
}
