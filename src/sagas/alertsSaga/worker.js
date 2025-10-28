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
import { addAlerts } from "../../slices/alertsSlice/alertsSlice";

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

  for (const item of items) {
    if (Object.hasOwnProperty.call(item, "error")) {
      // Fatal error alert for failed operations
      alerts.push(item.error);
    }

    // Validate operations in warnings
    if (isOperationId(item.id)) {
      const operation = select((state) => selectOperation(state, item.id));
      if (operation.operationType === OPERATION_TYPE_PACK) {
        alerts.push(...validatePackOperation(operation));
      }
    }
  }

  if (alerts.length > 0) {
    yield put(addAlerts(alerts));
  }

  yield null;
}
