import { createAction } from "@reduxjs/toolkit";
import { takeEvery, call, put, select } from "redux-saga/effects";
import {
  selectOperation,
  setOperationAttributes,
} from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { addTableToSchemaSuccess } from "../addTableToSchemaSaga/addTableToSchemaSaga";
import { createStackView } from "../../../lib/duckdb/createStackView";
import { selectColumnById } from "../../slices/columnsSlice";
import { removeColumnsSuccessAction } from "../removeColumnsSaga";

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

  // createStackView execute a view creation/update query and returns
  // the results of a query that calculates its dimensions.
  const dimensionsProxy = yield call(createStackView, queryData);
  const dimensions = JSON.parse(
    JSON.stringify(dimensionsProxy, (key, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  )[0];

  yield put(
    setOperationAttributes({ id: operationId, attributes: dimensions })
  );
}

// TODO: this would be like a serialize operation query selector in the operations slice
const selectQueryData = (state, operationId) => {
  const parent = { name: null, children: [] };

  const operation = selectOperation(state, operationId);
  parent.name = operation.name;
  parent.children = operation.children.map((id) => {
    let child = { tableName: null, columnNames: [] };
    if (isTableId(id)) {
      const table = selectTablesById(state, id);
      child.tableName = table.name;
      child.columnNames = state.columns.idsByTable[id].map((columnId) => {
        const column = selectColumnById(state, columnId);
        return column.name;
      });
    } else {
      const operation = selectOperation(state, id);
      child = operation.name;
      child.columnNames = ["*"];
    }
    return child;
  });
  return parent;
};
