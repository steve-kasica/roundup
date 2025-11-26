import { call, put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
  updateOperations as updateOperationsSlice,
  selectOperationQueryData,
} from "../../slices/operationsSlice";
import { setFocusedObjectId } from "../../slices/uiSlice";
import { updateOperationsSuccess } from "./actions";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";

export default function* updateOperationsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const raisedAlerts = [];
  const tableUpdates = [];
  const furtherOperationUpdates = [];
  const { operationUpdates } = action.payload;

  for (let operationUpdate of operationUpdates) {
    const operation = yield select((state) =>
      selectOperationsById(state, operationUpdate.id)
    );

    // If the operation is updating the `childIds` property,
    // we need to ensure that the corresponding children specify this
    // operation as their `parentId`.
    if (Object.hasOwnProperty.call(operationUpdate, "childIds")) {
      operationUpdate.isInSync = false; // Mark as out-of-sync due to child change
      for (let childId of operationUpdate.childIds) {
        let childObject;
        if (isTableId(childId)) {
          childObject = yield select((state) =>
            selectTablesById(state, childId)
          );
          if (childObject.parentId !== operationUpdate.id) {
            tableUpdates.push({
              id: childId,
              parentId: operationUpdate.id,
            });
          }
        } else {
          childObject = yield select((state) =>
            selectOperationsById(state, childId)
          );
          if (childObject.parentId !== operationUpdate.id) {
            furtherOperationUpdates.push({
              id: childId,
              parentId: operationUpdate.id,
            });
          }
        }
      }
    } else if (Object.hasOwnProperty.call(operationUpdate, "isMaterialized")) {
      const queryData = yield select((state) =>
        selectOperationQueryData(state, operation.id)
      );
      try {
        if (operation.operationType === OPERATION_TYPE_STACK) {
          yield call(createStackView, queryData);
        } else if (operation.operationType === OPERATION_TYPE_PACK) {
          yield call(createPackView, queryData);
        }
        const { columnCount, rowCount } = yield call(
          getTableDimensions,
          operation.databaseName
        );
        operationUpdate.columnCount = columnCount;
        operationUpdate.rowCount = rowCount;
        operationUpdate.isMaterialized = true;
        operationUpdate.isInSync = true;
      } catch (error) {
        console.error("Error materializing operation:", error, queryData);
        operationUpdate.isMaterialized = false;
      }
    } else if (Object.hasOwnProperty.call(operationUpdate, "operationType")) {
      operationUpdate.isInSync = false; // Mark as out-of-sync due to type change
    }
    // TODO: need to update isInSync when table change their column order or are removed
    successfulUpdates.push(operationUpdate);
  }

  if (tableUpdates.length > 0) {
    yield put(updateTablesSlice(tableUpdates));
  }
  yield put(
    updateOperationsSlice([...successfulUpdates, ...furtherOperationUpdates])
  );

  const formatSagaEndPayload = (updates) => ({
    // operationIds: updates.map(({ id }) => id),
    changedPropertiesById: Object.fromEntries(
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
