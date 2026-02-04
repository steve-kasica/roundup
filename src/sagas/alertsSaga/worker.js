/**
 * @fileoverview Alert saga worker for managing alert state.
 * @module sagas/alertsSaga/worker
 *
 * Processes raised alerts and manages alert lifecycle in Redux state.
 * Handles adding new alerts, clearing resolved alerts, and cleaning up
 * orphaned alerts.
 *
 * Features:
 * - Compares new alerts against existing alerts
 * - Adds newly raised alerts to state
 * - Removes resolved/passing alerts
 * - Cleans up orphaned alerts
 * - Batch updates for efficiency
 *
 * @example
 * // Called by watcher saga with raised alerts
 * yield call(alertsSagaWorker, [{ id: 'source_1', alerts: [...] }]);
 */
// Worker saga

import { call, put, select } from "redux-saga/effects";
import {
  addAlerts as addAlertsToSlice,
  deleteAlerts as deleteAlertsFromSlice,
} from "../../slices/alertsSlice/alertsSlice";
import {
  selectAlertIdsBySourceId,
  validateIncongruentTables,
  validateMissingJoinPredicate,
  validateMissingJoinType,
  validateMissingLeftJoinKey,
  validateMissingRightJoinKey,
} from "../../slices/alertsSlice";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import {
  selectColumnIdsByParentId,
  selectColumnsById,
} from "../../slices/columnsSlice";
import { validateHeterogeneousColumnTypes } from "../../slices/alertsSlice/Alerts/Warnings/HeterogeneousColumnTypes";

export function* processAlerts(raisedAlerts) {
  const alertsToAdd = [];
  const alertsToDelete = [];

  for (const { id, alerts } of raisedAlerts) {
    const associatedAlerts = yield select((state) =>
      selectAlertIdsBySourceId(state, id),
    );
    const existingAlerts = new Set(associatedAlerts);

    for (const alert of alerts) {
      const isRaised = existingAlerts.has(alert.id);
      if (isRaised && !alert.isPassing) {
        // Alert already exists, and is not resolved, so no action needed
        // Silenced alerts will also fall into this category
        existingAlerts.delete(alert.id);
      } else if (isRaised && alert.isPassing) {
        // Alert was raised but it is now passing, so clear it
        alertsToDelete.push(alert.id);
        existingAlerts.delete(alert.id);
      } else if (!isRaised && !alert.isPassing) {
        // New alert is raised
        alertsToAdd.push(alert);
      }
    }

    // Any remaining alerts in existingAlerts are no longer raised
    for (const alertId of existingAlerts) {
      alertsToDelete.push(alertId);
    }

    if (alertsToAdd.length > 0) {
      yield put(addAlertsToSlice(alertsToAdd));
    }

    // If any objects were validation and no alerts were raised, clear existing alerts
    if (alertsToDelete.length > 0) {
      yield put(deleteAlertsFromSlice(alertsToDelete));
    }
  }
}

export function* validateOperationWorker(operations) {
  for (let operation of operations) {
    if (operation.operationType === OPERATION_TYPE_STACK) {
      yield call(validateStackOperationWorker, operation);
    } else if (operation.operationType === OPERATION_TYPE_PACK) {
      yield call(validatePackOperationWorker, operation);
    } else {
      throw new Error(
        `Unsupported operation type "${operation.operationType}" for alert checking.`,
      );
    }
  }
}

export function* validateStackOperationWorker(operation) {
  const childColumns = yield select((state) => {
    const childColumnIdsMatrix = selectColumnIdsByParentId(
      state,
      operation.childIds,
    );
    const childColumns = childColumnIdsMatrix.map((columnIds) =>
      selectColumnsById(state, columnIds),
    );
    return childColumns;
  });

  const childColumnCounts = childColumns.map((columns) => columns.length);
  const childColumnTypes = childColumns.map((columns) =>
    columns.map((column) => column.columnType),
  );

  const results = [
    validateIncongruentTables(operation, childColumnCounts),
    validateHeterogeneousColumnTypes(operation, childColumnTypes),
  ];

  yield call(processAlerts, [{ id: operation.id, alerts: results }]);
}

export function* validatePackOperationWorker(operation) {
  const results = [
    validateMissingLeftJoinKey(operation),
    validateMissingRightJoinKey(operation),
    validateMissingJoinPredicate(operation),
    validateMissingJoinType(operation),
  ];
  yield call(processAlerts, [{ id: operation.id, alerts: results }]);
}
