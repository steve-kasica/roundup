import { createAction } from "@reduxjs/toolkit";
import { takeEvery, call, put, select } from "redux-saga/effects";
import {
  selectOperation,
  setOperationAttributes,
} from "../../data/slices/operationsSlice";
import { isTableId, selectTablesById } from "../../data/slices/tablesSlice";
import { addTableToSchemaSuccess } from "../addTableToSchemaSaga/addTableToSchemaSaga";
import { createStackView } from "../../lib/duckdb/createStackView";
import { selectColumnById } from "../../data/slices/columnsSlice";
import { removeColumnsSuccessAction } from "../removeColumnsSaga";
import { getTableDimensions } from "../../lib/duckdb";

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
// TODO: catch errors and handle them gracefully
function* handleCreateOperationView(operationId) {
  const queryData = yield select((state) =>
    selectQueryData(state, operationId)
  );

  // createStackView execute a view creation/update query
  yield call(createStackView, queryData);
  const dimensions = yield call(getTableDimensions, operationId);

  yield put(
    setOperationAttributes({ id: operationId, attributes: dimensions })
  );
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
