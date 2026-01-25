/**
 * @fileoverview Update operations saga watcher.
 * @module sagas/updateOperationsSaga/watcher
 *
 * Watches for operation update requests and syncs database views with
 * Redux store state. Handles post-creation setup and table migrations.
 *
 * Features:
 * - Handles updateOperationsRequest actions
 * - Sets default join parameters for new PACK operations
 * - Updates operations when tables change parents
 * - Coordinates child-parent relationships
 *
 * @example
 * // Watcher is started automatically by rootSaga
 */
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
  DEFAULT_JOIN_PREDICATE,
  DEFAULT_JOIN_TYPE,
  OPERATION_TYPE_PACK,
  selectOperationIdByChildId,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { group } from "d3";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, updateOperationsWorker);

  // When an operation is newly created, we need to set its columnCount
  // If the operation is a PACK, we also need to set default join parameters.
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const { operationIds } = action.payload;
    const operationUpdates = [];

    for (const operationId of operationIds) {
      const { operationType } = yield select((state) =>
        selectOperationsById(state, operationId),
      );
      operationUpdates.push({
        id: operationId,
        columnCount: null, // will be set
        // Set default metadata properties if the newly created operation is a PACK
        ...(operationType === OPERATION_TYPE_PACK && {
          joinType: DEFAULT_JOIN_TYPE,
          joinPredicate: DEFAULT_JOIN_PREDICATE,
        }),
      });
    }

    yield put(
      updateOperationsRequest({
        operationUpdates,
      }),
    );
  });

  // When a table is updated, if it's columnIds property has changed
  // and the table is the child of a operation, we need to flag that
  // the operation is out-of-sync.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const rematerializationProperteies = ["columnIds", "childIds"];
    const { changedPropertiesById } = action.payload;
    const operationUpdates = [];
    const focusedOperationId = yield select(selectFocusedObjectId);

    for (const [id, changedProperties] of Object.entries(
      changedPropertiesById,
    )) {
      const hasSchemaChange = changedProperties.some((prop) =>
        rematerializationProperteies.includes(prop),
      );
      if (hasSchemaChange) {
        const { parentId } = yield select((state) =>
          isTableId(id)
            ? selectTablesById(state, id)
            : selectOperationsById(state, id),
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
        }),
      );
    }
  });

  // When a Pack operation's join parameters change, we need to
  // recalculate its pack statistics.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const rematerializationProperteies = ["columnIds", "childIds"];
    const joinParameterProperties = [
      "joinPredicate",
      "joinKey1",
      "joinKey2",
      "childIds",
    ];
    const { changedPropertiesById } = action.payload;
    const operationUpdates = [];

    for (const [id, changedProperties] of Object.entries(
      changedPropertiesById,
    )) {
      const operation = yield select((state) =>
        selectOperationsById(state, id),
      );
      if (
        changedProperties.some(
          (prop) =>
            joinParameterProperties.includes(prop) &&
            operation.operationType === OPERATION_TYPE_PACK,
        )
      ) {
        const hasValidParams =
          operation.operationType === OPERATION_TYPE_PACK &&
          operation.joinKey1 &&
          operation.joinKey2 &&
          operation.joinPredicate &&
          operation.childIds.length === 2;
        if (hasValidParams) {
          operationUpdates.push({
            id,
            matchStats: {}, // matchStats will be recalculated in the worker
          });
        }
      } else if (
        changedProperties.some((prop) =>
          rematerializationProperteies.includes(prop),
        )
      ) {
        const focusedOperationId = yield select(selectFocusedObjectId);
        const { parentId } = yield select((state) =>
          selectOperationsById(state, id),
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
        }),
      );
    }
  });

  // When tables are deleted, we need to remove that table ID from the
  // parent operation's childIds, if any.
  yield takeEvery(deleteTablesSuccess.type, function* (action) {
    const { tableIds } = action.payload;
    const parentOperations = yield select((state) =>
      tableIds.map((tableId) => ({
        tableId,
        operation: selectOperationsById(
          state,
          selectOperationIdByChildId(state, tableId),
        ),
      })),
    );

    const operationUpdates = group(parentOperations, (d) => d.operation.id);
    const updatePayload = [];

    for (const [operationId, entries] of operationUpdates) {
      const childIdsToRemove = entries.map((e) => e.tableId);
      const operation = entries[0].operation;
      const newChildIds = operation.childIds.filter(
        (id) => !childIdsToRemove.includes(id),
      );
      updatePayload.push({
        id: operationId,
        childIds: newChildIds,
      });
    }

    if (updatePayload.length > 0) {
      yield put(
        updateOperationsRequest({
          operationUpdates: updatePayload,
        }),
      );
    }
  });
}
