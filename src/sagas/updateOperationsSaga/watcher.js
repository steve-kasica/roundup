// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.

import { put, select, takeEvery } from "redux-saga/effects";
import { updateOperationsRequest, updateOperationsSuccess } from "./actions";
import updateOperationsWorker from "./worker";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { updateTablesSuccess } from "../updateTablesSaga";
import {
  JOIN_PREDICATES,
  JOIN_TYPES,
  OPERATION_TYPE_PACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { selectFocusedObjectId } from "../../slices/uiSlice";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, updateOperationsWorker);

  // When an operation is newly created, we need to set its columnCount
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const { operationIds } = action.payload;
    const operationUpdates = [];

    for (const operationId of operationIds) {
      const { operationType } = yield select((state) =>
        selectOperationsById(state, operationId)
      );
      operationUpdates.push({
        id: operationId,
        columnCount: null, // will be set
        // Set default metadata properties if the newly created operation is a PACK
        ...(operationType === OPERATION_TYPE_PACK && {
          joinType: JOIN_TYPES.FULL_OUTER,
          joinPredicate: JOIN_PREDICATES.EQUALS,
        }),
      });
    }

    yield put(
      updateOperationsRequest({
        operationUpdates,
      })
    );
  });

  // When a table is updated, if it's columnIds property has changed
  // and the table is the child of a operation, we need to flag that
  // the operation is out-of-sync.
  yield takeEvery(updateTablesSuccess.type, handleRematerializations);
  yield takeEvery(updateOperationsSuccess.type, handleRematerializations);
}

// Note: both tables and operation update success actions will pass
// the same object key in their payloads, `changedPropertiesById`
function* handleRematerializations(action) {
  const rematerializationProperteies = ["columnIds", "childIds"];
  const { changedPropertiesById } = action.payload;
  const operationUpdates = [];
  const focusedOperationId = yield select(selectFocusedObjectId);

  for (const [id, changedProperties] of Object.entries(changedPropertiesById)) {
    const hasSchemaChange = changedProperties.some((prop) =>
      rematerializationProperteies.includes(prop)
    );
    if (hasSchemaChange) {
      const { parentId } = yield select((state) =>
        isTableId(id)
          ? selectTablesById(state, id)
          : selectOperationsById(state, id)
      );

      if (parentId) {
        operationUpdates.push({
          id: parentId,
          ...(parentId === focusedOperationId
            ? {
                // If the operation is focused, we can set it to out-of-sync
                isInSync: false,
              }
            : {
                // If the operation is not focused, we set isMaterialized to null
                // so that when the user focuses on it, it will re-materialize
                isMaterialized: null,
              }),
        });
      }
    }
  }

  if (operationUpdates.length > 0) {
    yield put(
      updateOperationsRequest({
        operationUpdates,
      })
    );
  }
}
