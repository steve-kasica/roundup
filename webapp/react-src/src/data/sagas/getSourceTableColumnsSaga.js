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
} from "../slices/columnsSlice";
import OpenRefineAPI from "../../services/open-refine";

/**
 * @description Saga watcher for individual requests
 */
export default function* sourceTableColumnsSagaWatcher() {
  yield takeEvery(
    fetchSourceTableColumnsRequest.type,
    sourceTableColumnsSagaWorker
  );
}

/**
 *
 * @param {*} projectId
 */
function* sourceTableColumnsSagaWorker(action) {
  const { tableId } = action.payload;

  try {
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
