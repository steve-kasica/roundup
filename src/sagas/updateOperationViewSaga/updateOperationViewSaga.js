import { createAction } from "@reduxjs/toolkit";
import { takeLatest, call, put, select, takeEvery } from "redux-saga/effects";
import {
  JOIN_TYPES,
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  updateOperations,
} from "../../slices/operationsSlice";
import { selectQueryData } from "../createOperationViewSaga/createOperationViewSaga";
import {
  createPackView,
  createStackView,
  getTableDimensions,
} from "../../lib/duckdb";
import {
  addColumns,
  Column,
  dropColumns,
  selectColumnById,
  selectColumnIdsByTableId,
} from "../../slices/columnsSlice";
import { removeColumnsSuccessAction } from "../removeColumnsSaga";
import { selectTablesById } from "../../slices/tablesSlice";

// Action Types
export const updateOperationViewRequest = createAction(
  "sagas/updateOperationView/request"
);

// Worker Saga
function* updateOperationViewSaga(action) {
  const operationId = action.payload;
  try {
    const operation = yield select((state) =>
      selectOperation(state, operationId)
    );

    if (operation.operationType === OPERATION_TYPE_NO_OP) {
      // No operation view needed for NO_OP, just return
      return;
    }

    const queryData = yield select((state) =>
      selectQueryData(state, operationId)
    );

    let columnIds;
    if (operation.operationType === OPERATION_TYPE_STACK) {
      // If the stack operation has added or remove children, update
      // the associated columns in Redux and match those column ids to the view.
      columnIds = yield select(
        (state) => selectColumnIdsByTableId(state, operationId) || []
      );

      const childColumns = yield select((state) => {
        const childIds = operation.children.map(
          (childId) => state.columns.idsByTable[childId] || []
        );
        const childColumns = childIds.map((ids) =>
          ids.map((id) => selectColumnById(state, id))
        );
        return childColumns;
      });

      const columnLengths = childColumns.map((c) => c.length);
      const maxColumnCount = Math.max(...columnLengths);
      const maxColumnIndex = columnLengths.indexOf(maxColumnCount);
      if (columnIds.length > maxColumnCount) {
        yield put(dropColumns(columnIds.slice(maxColumnCount)));
        columnIds = columnIds.slice(0, maxColumnCount);
      } else if (columnIds.length < maxColumnCount) {
        const additionalColumns = childColumns[maxColumnIndex]
          .slice(columnIds.length)
          .map((column) =>
            Column(operationId, column.index, column.name, column.columnType)
          );

        columnIds = [...columnIds, ...additionalColumns.map(({ id }) => id)];
        yield put(addColumns(additionalColumns));
      }
      yield call(createStackView, queryData, columnIds);
    } else if (operation.operationType === OPERATION_TYPE_PACK) {
      // For pack operations, we the columns created when the operation was
      // created is still valid, unless the join type is going to a
      // LEFT or a RIGHT ANTI JOIN, FULL ANTI JOIN is fine.
      let prevColumnIds = yield select((state) => {
        const columnIds = selectColumnIdsByTableId(state, operationId);
        return columnIds;
      });
      let nextColumnIds = [],
        columnIdsToRemove = [],
        columnsToAdd = [];
      if (
        operation.joinType === JOIN_TYPES.LEFT_ANTI ||
        operation.joinType === JOIN_TYPES.RIGHT_ANTI
      ) {
        const leftTableColumnCount = yield select(
          (state) =>
            selectColumnIdsByTableId(state, operation.children[0]).length
        );

        nextColumnIds =
          operation.joinType === JOIN_TYPES.LEFT_ANTI
            ? prevColumnIds.slice(0, leftTableColumnCount)
            : prevColumnIds.slice(leftTableColumnCount);

        // If the join type is LEFT or RIGHT ANTI, we need to drop the columns
        // that are not in the resulting table.
        columnIdsToRemove = prevColumnIds.filter(
          (id) => !nextColumnIds.includes(id)
        );
      } else {
        const nextColumns = yield select((state) => {
          const columnIds = operation.children
            .map((id) => selectColumnIdsByTableId(state, id))
            .flat();
          const oldColumns = columnIds.map((id) => selectColumnById(state, id));
          return oldColumns.map((column, i) =>
            Column(operationId, i, column.name, column.columnType)
          );
        });
        columnsToAdd = nextColumns;
        columnIdsToRemove = prevColumnIds;
        nextColumnIds = nextColumns.map(({ id }) => id);
      }

      if (columnIdsToRemove.length) {
        yield put(dropColumns(columnIdsToRemove));
      }

      if (columnsToAdd.length) {
        yield put(addColumns(columnsToAdd));
      }

      yield call(createPackView, queryData, nextColumnIds);
    }

    const { rowCount, columnCount } = yield call(
      getTableDimensions,
      operationId
    );
    // validateOperationDimensions(operationId, { rowCount, columnCount });
    yield put(
      updateOperations({
        id: operationId,
        rowCount,
        error: null, // Clear any previous error
      })
    );
  } catch (error) {
    console.error("Error updating operation view:", error);
    yield put(
      updateOperations({
        id: operationId,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)), // Serialize the error
      })
    );
  }
}

// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.
// This it listen for actions by the operations and columns slice
export default function* watchUpdateOperationView() {
  yield takeLatest(updateOperationViewRequest.type, updateOperationViewSaga);
  yield takeLatest(updateOperations.type, function* (action) {
    const operationId = action.payload.id;
    const updatedAttributes = Object.keys(action.payload);
    const dependentProps = [
      "children", // affects both stack and pack operations
      "operationType", // affects both stack and pack operations
      "joinType", // specific to pack operations
      "joinKey1", // specific to pack operations
      "joinKey2", // specific to pack operations
      "joinPredicate", // specific to pack operations
    ];

    // If the operation has updated any of the dependent properties,
    // update the view
    if (updatedAttributes.some((attr) => dependentProps.includes(attr))) {
      yield put(updateOperationViewRequest(operationId));
    }
  });

  // After columns are removed, update the operation view if the table has one
  yield takeEvery(removeColumnsSuccessAction.type, function* (action) {
    const columnIds = action.payload;
    const table = yield select((state) => {
      const column = selectColumnById(state, columnIds[0]);
      return selectTablesById(state, column.tableId);
    });

    if (table.operationId) {
      yield put(updateOperationViewRequest(table.operationId));
    }
  });
}
