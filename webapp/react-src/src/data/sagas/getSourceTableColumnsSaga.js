/**
 * getSourceColumnsSaga.js
 *
 * Fetch column info from a single source table
 *
 *
 */
import { put, takeEvery } from "redux-saga/effects";
import {
  fetchSourceTableColumnsRequest,
  fetchSourceTableColumnsSuccess,
  fetchSourceTableColumnsFailure,
} from "../slices/sourceColumnsSlice";
import OpenRefineAPI from "../../services/open-refine";
import {
  addNewChildren,
  createOperation,
  OPERATION_TYPE_NO_OP,
} from "../slices/operationsSlice";
import { sourceTableSelected } from "../actions";

/**
 * @description Saga watcher for individual requests
 */
export default function* singleSourceColumnSagaWatcher() {
  yield takeEvery(sourceTableSelected.type, sourceTableColumnsSagaWorker);
}

/**
 *
 * @param {*} projectId
 */
function* sourceTableColumnsSagaWorker(action) {
  const { operationType, table } = action.payload;
  const tableId = table.id;

  try {
    // Initiate request for project's column info
    yield put(
      fetchSourceTableColumnsRequest({
        tableId,
        columnCount: table.columnCount,
      })
    );

    // Add source table to operations to select table
    if (operationType === OPERATION_TYPE_NO_OP) {
      yield put(
        createOperation({
          operationType,
          children: [table],
        })
      );
    } else {
      yield put(
        addNewChildren({
          operationType,
          children: [table],
        })
      );
    }

    // Call the OpenRefine API
    const response = yield OpenRefineAPI.getColumnsInfo(tableId);

    // Dispatch success action for column info request
    yield put(
      fetchSourceTableColumnsSuccess({
        tableId,
        response,
      })
    );
  } catch (error) {
    // Dispatch failure action
    yield put(
      fetchSourceTableColumnsFailure({
        tableId,
        error,
      })
    );
  }
}
