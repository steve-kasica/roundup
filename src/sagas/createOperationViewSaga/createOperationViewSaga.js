import { createAction } from "@reduxjs/toolkit";
import { takeEvery, call, put, select } from "redux-saga/effects";
import {
  addOperation,
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
  updateOperations,
} from "../../slices/operationsSlice";
import {
  addColumns,
  Column,
  COLUMN_TYPE_CATEGORICAL,
  selectColumnById,
  selectColumnIdsByTableId,
} from "../../slices/columnsSlice";
import {
  getTableDimensions,
  createStackView,
  createPackView,
  getColumnNames,
} from "../../lib/duckdb";

// Actions
export const createOperationView = createAction(
  "sagas/createOperationView/request"
);

export const createOperationViewSuccess = createAction(
  "sagas/createOperationView/success"
);

// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.
// This it listen for actions by the operations slice
export default function* createOperationViewSaga() {
  yield takeEvery(createOperationView.type, createOperationViewSagaWorker);
  yield takeEvery(addOperation.type, function* (action) {
    const operation = action.payload;
    yield put(createOperationView(operation.id));
  });
}

// Worker Saga
function* createOperationViewSagaWorker(action) {
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

    let columns;
    // createStackView execute a view creation/update query
    if (operation.operationType === OPERATION_TYPE_PACK) {
      columns = yield select((state) => {
        const columnIds = operation.children
          .map((id) => selectColumnIdsByTableId(state, id))
          .flat();
        const oldColumns = columnIds.map((id) => selectColumnById(state, id));
        const newColumns = oldColumns.map((column, i) =>
          Column(operationId, i, column.name, column.columnType)
        );
        return newColumns;
      });
      yield put(addColumns(columns)); // Pre-add columns so they exist for the view creation

      yield call(
        createPackView,
        queryData,
        columns.map(({ id }) => id)
      );
    } else if (operation.operationType === OPERATION_TYPE_STACK) {
      columns = yield select((state) => {
        const columnIds = selectColumnIdsByTableId(
          state,
          operation.children[0]
        );
        // TODO: what if column is removed?
        const oldColumns = columnIds.map((id) => selectColumnById(state, id));
        const newColumns = oldColumns.map((column, i) =>
          Column(operationId, i, column.name, column.columnType)
        );
        return newColumns;
      });
      yield put(addColumns(columns)); // Pre-add columns so they exist for the view creation

      // includes stack and NO_OP
      // TODO: why does it do NO_OP and how does it not break?
      yield call(
        createStackView,
        queryData,
        columns.map(({ id }) => id)
      );
    } else {
      return; // No view creation needed for other operation types
    }

    // Get dimensions of the operation view
    // This will throw an error if the operation has no rows or columns
    const { rowCount, columnCount } = yield call(
      getTableDimensions,
      operationId
    );
    validateOperationDimensions(operationId, { rowCount, columnCount });
    yield put(
      updateOperations({
        id: operationId,
        rowCount,
      })
    );

    if (operation.error) {
      // Clear any previous error if the operation was successful
      yield put(updateOperations({ id: operationId, error: null }));
    }

    yield put(
      createOperationViewSuccess({
        operationId,
        operationType: operation.operationType,
      })
    );
  } catch (error) {
    console.error("Error creating operation view:", error);
    yield put(
      updateOperations({
        id: operationId,
        error: JSON.stringify(error, Object.getOwnPropertyNames(error)), // Serialize the error
      })
    );
  } finally {
    // // If an error occurs, we still need to update columns associated with this operation
    // // Create or update columns associated with this operation / view
    // const sliceColumns = yield select((state) =>
    //   selectColumnIdsByTableId(state, operationId).map((columnId) =>
    //     selectColumnById(state, columnId)
    //   )
    // );
    // const dbColumns = yield* getDefaultColumns(operationId);
    // if (sliceColumns.length === 0 && dbColumns.length > 0) {
    //   // If operation/view is being created, then no columns exist, create columns
    //   yield put(addColumns(dbColumns));
    //   // Name the columns
    // } else if (sliceColumns.length > 0 && dbColumns.length === 0) {
    //   console.log(
    //     "WOAH! No columns in the database for operation",
    //     operationId
    //   );
    // } else if (sliceColumns.length === 0 && dbColumns.length === 0) {
    //   console.log(
    //     "WOAH! No columns in the slice or database for operation",
    //     operationId
    //   );
    // } else {
    //   // We're updating an existing operation/view b/c there are columns in the slice
    //   // and in the database, so we need to reconcile them
    //   // This is a bit more complex, since we need to check if columns exist in both.
    //   const columnsToAdd = [];
    //   const columnsToRemove = [];
    //   const columnsToUpdate = [];
    //   for (
    //     let i = 0;
    //     i < Math.max(sliceColumns.length, dbColumns.length);
    //     i++
    //   ) {
    //     const sliceColumn = sliceColumns[i];
    //     const dbColumn = dbColumns[i];
    //     if (sliceColumn && dbColumn) {
    //       if (!areColumnsEqual(sliceColumn, dbColumn)) {
    //         // If both slice and db columns exist but are not equal, reconcile by updating the slice column
    //         columnsToUpdate.push({
    //           id: sliceColumn.id,
    //           name: sliceColumn.name, // priority to slice column name, since user may have renamed it
    //           columnType: dbColumn.columnType, // keep the db column type
    //           index: dbColumn.index, // keep the db column index
    //         });
    //       }
    //     } else if (sliceColumn && !dbColumn) {
    //       // If there's a slice column at this index but no db column, remove it
    //       columnsToRemove.push(sliceColumn);
    //     } else if (!sliceColumn && dbColumn) {
    //       // If there's a db column at this index but no slice column, add it
    //       columnsToAdd.push(dbColumn);
    //     }
    //   }
    //   //      yield put(removeColumns(columnsToRemove));
    //   yield put(addColumns(columnsToAdd));
    //   yield put(updateColumns(columnsToUpdate));
    // } // end else block
  } // end finally block
}

function* getDefaultColumns(parentId) {
  const columnIds = yield call(getColumnNames, parentId);
  const columnNames = yield select((state) =>
    columnIds.map((id) => selectColumnById(state, id).name)
  );
  return columnNames.map((name, i) =>
    Column(parentId, i, name, COLUMN_TYPE_CATEGORICAL)
  );
}

// TODO: this would be like a serialize operation query selector in the operations slice
export const selectQueryData = (state, operationId) => {
  const operation = selectOperation(state, operationId);
  const parent = { ...operation };
  parent.children = operation.children.map((id) => {
    let child = { id, columnIds: state.columns.idsByTable[id] };
    return child;
  });
  return parent;
};

// Helper function to validate operation dimensions
function validateOperationDimensions(operationId, dimensions) {
  if (dimensions.rowCount === 0) {
    throw new Error(
      `Operation ${operationId} has no rows. Please check the operation query.`
    );
  }

  if (dimensions.columnCount === 0) {
    throw new Error(
      `Operation ${operationId} has no columns. Please check the operation query.`
    );
  }
}
