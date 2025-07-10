import { createAction } from "@reduxjs/toolkit";
import { takeEvery, call, put, select } from "redux-saga/effects";
import {
  clearOperationError,
  selectOperation,
  setOperationAttributes,
  setOperationError,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { addTableToSchemaSuccess } from "../addTableToSchemaSaga/addTableToSchemaSaga";
import { selectColumnById } from "../../slices/columnsSlice";
import { removeColumnsSuccessAction } from "../removeColumnsSaga";
import { getTableDimensions, createStackView } from "../../lib/duckdb";

// Actions
export const createOperationView = createAction(
  "sagas/createOperationView/request"
);

// Watcher Saga
export default function* createOperationViewSaga() {
  // After a table is added to the schema, create or update an operation view
  yield takeEvery(addTableToSchemaSuccess.type, function* (action) {
    const { tableId } = action.payload;
    const table = yield select((state) => selectTablesById(state, tableId));
    yield handleCreateOperationView(table.operationId);
  });

  // After columns are removed, update the operation view if the table has one
  yield takeEvery(removeColumnsSuccessAction.type, function* (action) {
    const { columnIds } = action.payload;
    const table = yield select((state) => {
      const column = selectColumnById(state, columnIds[0]);
      return selectTablesById(state, column.tableId);
    });

    if (table.operationId) {
      yield handleCreateOperationView(table.operationId);
    }
  });
}

// Worker Saga
function* handleCreateOperationView(operationId) {
  try {
    const operation = yield select((state) =>
      selectOperation(state, operationId)
    );
    const queryData = yield select((state) =>
      selectQueryData(state, operationId)
    );

    // createStackView execute a view creation/update query
    yield call(createStackView, queryData);
    const dimensions = yield call(getTableDimensions, operationId);

    yield put(
      setOperationAttributes({ id: operationId, attributes: dimensions })
    );

    if (operation.error) {
      // Clear any previous error if the operation was successful
      yield put(clearOperationError({ operationId }));
    }
  } catch (error) {
    console.error("Error creating operation view:", error);
    if (error.message.includes("Binder Error")) {
      yield put(
        setOperationError({
          operationId,
          error: JSON.stringify(error, Object.getOwnPropertyNames(error)), // Serialize the error
        })
      );
    } else {
      throw error; // Re-throw for global error handling
    }
  }
}

// TODO: this would be like a serialize operation query selector in the operations slice
const selectQueryData = (state, operationId) => {
  const parent = { id: null, children: [] };

  const operation = selectOperation(state, operationId);
  parent.id = operation.id;
  parent.children = operation.children.map((id) => {
    let child = { tableName: null, columnIds: [] };
    if (isTableId(id)) {
      const table = selectTablesById(state, id);
      child.id = table.id;
      child.columnIds = state.columns.idsByTable[id];
    } else {
      const operation = selectOperation(state, id);
      child.id = operation.id;
      child.columnIds = ["*"];
    }
    return child;
  });
  return parent;
};
