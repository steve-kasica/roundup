import { call, put, select, takeEvery } from "redux-saga/effects";
import createColumnsWorker from "./worker";
import { createColumnsRequest } from "./actions";
import { createTablesSuccess } from "../createTablesSaga";
import {
  OPERATION_TYPE_NO_OP,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { selectTablesById } from "../../slices/tablesSlice";
import { CREATION_MODE_INITIALIZATION } from ".";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { materializeOperationSuccess } from "../materializeOperationSaga/actions";
import { useSelector } from "react-redux";

// Create a shared function for handling both success and failure operations
const handleOperations = function* (action) {
  const { operationIds } = action.payload;
  const operations = yield select((state) =>
    operationIds.map((id) => selectOperationsById(state, id))
  );
  for (const { id, operationType, columnCount } of operations) {
    if (operationType === OPERATION_TYPE_NO_OP) {
      continue;
    }
    yield put(
      createColumnsRequest({
        mode: CREATION_MODE_INITIALIZATION,
        columnInfo: Array.from({ length: columnCount }).map((_, index) => ({
          parentId: id,
          index,
        })),
      })
    );
  }
};

const handleTables = function* (action) {
  const { tableIds } = action.payload;
  const tables = yield select((state) => selectTablesById(state, tableIds));
  for (const { id, initialColumnCount } of tables) {
    yield put(
      createColumnsRequest({
        mode: CREATION_MODE_INITIALIZATION,
        columnInfo: Array.from({ length: initialColumnCount }).map(
          (_, index) => ({
            parentId: id, // tables and operations can be parents of columns
            index,
          })
        ),
      })
    );
  }
};

export default function* createColumnsWatcher() {
  yield takeEvery(createColumnsRequest.type, createColumnsWorker);

  // When tables are created, create columns for them
  yield takeEvery(createTablesSuccess.type, function* (action) {
    const { tableIds } = action.payload;
    const tables = yield select((state) => selectTablesById(state, tableIds));
    for (const table of tables) {
      yield put(
        createColumnsRequest({
          columnLocations: Array.from({ length: table.columnIds.length }).map(
            (_, index) => ({
              parentId: table.id, // tables and operations can be parents of columns
              parentDatabaseName: table.databaseName,
              index,
            })
          ),
        })
      );
    }
  });

  // If an operation has been recently materialized as a view,
  // then we need to create columns that represent columns of that view.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
    const { changedPropertiesByOperationId } = action.payload;
    const columnLocations = [];

    for (const [id, changedProperties] of Object.entries(
      changedPropertiesByOperationId
    )) {
      if (changedProperties.includes("isMaterialized")) {
        const operation = yield select((state) =>
          selectOperationsById(state, id)
        );
        if (operation.isMaterialized) {
          columnLocations.push(
            ...Array.from({ length: operation.columnCount }).map(
              (_, index) => ({
                parentId: id,
                parentDatabaseName: operation.databaseName,
                index,
              })
            )
          );
        }
      }
    }

    if (columnLocations.length > 0) {
      yield put(
        createColumnsRequest({
          mode: CREATION_MODE_INITIALIZATION,
          columnLocations,
        })
      );
    }
  });
}
