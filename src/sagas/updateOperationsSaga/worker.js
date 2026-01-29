/**
 * @fileoverview Update operations saga worker.
 * @module sagas/updateOperationsSaga/worker
 *
 * Worker saga that updates operation properties and recreates database
 * views when operation configuration changes.
 *
 * Features:
 * - Updates operation Redux state
 * - Manages parent-child relationships
 * - Recreates PACK/STACK views on child changes
 * - Calculates match statistics for PACK operations
 * - Syncs column counts with database
 * - Handles loading states during view creation
 *
 * @example
 * // Called by watcher saga
 * yield call(updateOperationsWorker, action);
 */
import { call, put, select } from "redux-saga/effects";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
  updateOperations as updateOperationsSlice,
  selectOperationQueryData,
} from "../../slices/operationsSlice";
import { updateOperationsSuccess } from "./actions";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import {
  calcMatchStats,
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";
import { selectColumnsById } from "../../slices/columnsSlice";

export default function* updateOperationsWorker(operationUpdates) {
  let isFailure = false;

  for (let operationUpdate of operationUpdates) {
    const operation = yield select((state) =>
      selectOperationsById(state, operationUpdate.id),
    );
    if (Object.hasOwnProperty.call(operationUpdate, "isMaterialized")) {
      const queryData = yield select((state) =>
        selectOperationQueryData(state, operationUpdate.id),
      );
      try {
        if (operation.operationType === OPERATION_TYPE_STACK) {
          yield call(createStackView, queryData);
        } else if (operation.operationType === OPERATION_TYPE_PACK) {
          yield call(createPackView, queryData);
        }
        const { columnCount, rowCount } = yield call(
          getTableDimensions,
          operation.databaseName,
        );
        operationUpdate.columnCount = columnCount;
        operationUpdate.rowCount = rowCount;
        operationUpdate.isMaterialized = true;
        operationUpdate.isInSync = true;
      } catch (error) {
        isFailure = true;
        console.error("Error materializing operation:", error, queryData);
      }
    }

    if (Object.hasOwnProperty.call(operationUpdate, "matchStats")) {
      const [leftTableName, rightTableName] = yield select((state) => {
        const childIds = Object.hasOwnProperty.call(operationUpdate, "childIds")
          ? operationUpdate.childIds
          : operation.childIds;
        return [
          (isTableId(childIds[0])
            ? selectTablesById(state, childIds[0])
            : selectOperationsById(state, childIds[0])
          ).databaseName,
          (isTableId(childIds[1])
            ? selectTablesById(state, childIds[1])
            : selectOperationsById(state, childIds[1])
          ).databaseName,
        ];
      });
      const [leftColumnName, rightColumnName] = yield select((state) => {
        return [
          selectColumnsById(
            state,
            Object.hasOwnProperty.call(operationUpdate, "joinKey1")
              ? operationUpdate.joinKey1
              : operation.joinKey1,
          ).databaseName,
          selectColumnsById(
            state,
            Object.hasOwnProperty.call(operationUpdate, "joinKey2")
              ? operationUpdate.joinKey2
              : operation.joinKey2,
          ).databaseName,
        ];
      });

      const joinPredicate = Object.hasOwnProperty.call(
        operationUpdate,
        "joinPredicate",
      )
        ? operationUpdate.joinPredicate
        : operation.joinPredicate;

      try {
        const matchStats = yield call(
          calcMatchStats,
          leftTableName,
          rightTableName,
          leftColumnName,
          rightColumnName,
          joinPredicate,
        );
        operationUpdate.matchStats = matchStats;
      } catch (error) {
        isFailure = true;
        alert("Failure updating match statistics for operation.");
        console.error(
          "updateOperationsSaga/worker.js:",
          "Error calculating match stats for operation:",
          operation.id,
          error,
        );
      }
    }

    // If the operation is updating the `childIds` property,
    // we need to ensure that the corresponding children specify this
    // operation as their `parentId`.
    // if (Object.hasOwnProperty.call(operationUpdate, "childIds")) {
    // operationUpdate.isInSync = false; // Mark as out-of-sync due to child change
    // for (let childId of operationUpdate.childIds) {
    //   let childObject;
    //   if (isTableId(childId)) {
    //     childObject = yield select((state) =>
    //       selectTablesById(state, childId),
    //     );
    //     if (childObject.parentId !== operationUpdate.id) {
    //       tableUpdates.push({
    //         id: childId,
    //         parentId: operationUpdate.id,
    //       });
    //     }
    //   } else {
    //     childObject = yield select((state) =>
    //       selectOperationsById(state, childId),
    //     );
    //     if (childObject.parentId !== operationUpdate.id) {
    //       furtherOperationUpdates.push({
    //         id: childId,
    //         parentId: operationUpdate.id,
    //       });
    //     }
    //   }
    // }
    // } else if (
    //   Object.hasOwnProperty.call(operationUpdate, "operationType") ||
    //   Object.hasOwnProperty.call(operationUpdate, "joinType") ||
    //   Object.hasOwnProperty.call(operationUpdate, "joinPredicate")
    // ) {
    //   operationUpdate.isInSync = false; // Mark as out-of-sync due to type change
    // }
  }

  if (!isFailure) {
    yield put(updateOperationsSlice(operationUpdates));
    yield put(updateOperationsSuccess(operationUpdates));
  }
}
