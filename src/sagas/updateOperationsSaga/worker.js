import { put, select } from "redux-saga/effects";
import {
  selectOperationsById,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
import { setFocusedObjectId } from "../../slices/uiSlice";
import { updateOperationsSuccess } from "./actions";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";

export default function* updateOperationsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const raisedAlerts = [];
  const tableUpdates = [];
  const furtherOperationUpdates = [];
  const { operationUpdates } = action.payload;

  for (let operationUpdate of operationUpdates) {
    successfulUpdates.push(operationUpdate);

    // If the operation is updating the `childIds` property,
    // we need to ensure that the corresponding children specify this
    // operation as their `parentId`.
    if (Object.hasOwnProperty.call(operationUpdate, "childIds")) {
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
    }
  }

  if (tableUpdates.length > 0) {
    yield put(updateTablesSlice(tableUpdates));
  }
  yield put(
    updateOperationsSlice([...successfulUpdates, ...furtherOperationUpdates])
  );
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
