// Worker saga

import { put, select } from "redux-saga/effects";
import { validateNonKeyColumn } from "../../slices/alertsSlice/Alerts/PackOperationAlerts/NonKeyColumn";
import { selectTablesById } from "../../slices/tablesSlice";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  selectOperation,
} from "../../slices/operationsSlice";
import { selectColumnById } from "../../slices/columnsSlice";
import {
  addAlerts,
  removeAlertsBySourceIds,
} from "../../slices/alertsSlice/alertsSlice";
import { selectAllSourceIdsWithAlerts } from "../../slices/alertsSlice/alertsSelectors";

const validatePackOperation = (operation) => {
  const warnings = [];
  const tables = select((state) =>
    operation.children.map((id) => selectTablesById(state, id))
  );
  const keyColumns = select((state) => {
    return [
      selectColumnById(state, operation.joinKey1),
      selectColumnById(state, operation.joinKey2),
    ];
  });

  warnings.push(validateNonKeyColumn(operation, tables[0], keyColumns[0]));
  warnings.push(validateNonKeyColumn(operation, tables[1], keyColumns[1]));
  return warnings.filter(Boolean);
};

export default function* alertsSagaWorker(items) {
  const alerts = [];
  const idsToClear = [];
  const itemsWithAlerts = yield select(selectAllSourceIdsWithAlerts);

  for (const item of items) {
    const itemAlerts = [];
    if (Object.hasOwnProperty.call(item, "error")) {
      // Fatal error alert for failed operations
      itemAlerts.push(item.error);
    }

    // Validate operations in warnings
    if (isOperationId(item.id)) {
      const operation = select((state) => selectOperation(state, item.id));
      if (operation.operationType === OPERATION_TYPE_PACK) {
        itemAlerts.push(...validatePackOperation(operation));
      }
    }

    if (itemAlerts.length > 0) {
      alerts.push(...itemAlerts);
    } else if (itemsWithAlerts.includes(item.id)) {
      // itemAlerts is empty now, but there were existing alerts
      // for this item, so we need to clear them.
      idsToClear.push(item.id);
    }
  } // end for loop

  if (alerts.length > 0) {
    yield put(addAlerts(alerts));
  }

  // If any objects were validation and no alerts were raised, clear existing alerts
  if (idsToClear.length > 0) {
    yield put(removeAlertsBySourceIds(idsToClear));
  }
}
