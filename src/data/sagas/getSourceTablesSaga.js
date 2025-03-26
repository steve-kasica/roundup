

import { put, takeLatest, call } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import { fetchTablesFailure, fetchTablesRequest, fetchTablesSuccess } from "../slices/sourceTablesSlice";

// Saga worker
function* fetchTablesSaga(action) {
  try {
    // Call the API
    const tables = yield call(OpenRefine.getAllProjectMetadata, action.payload);

    // Dispatch success action
    yield put(fetchTablesSuccess(tables));
  } catch (error) {
    // Dispatch failure action
    yield put(fetchTablesFailure(
      error instanceof Error ? error.message : "An error occured"
    ));
  }
};

// Saga watcher
export default function*() {
  // Watch for fetchTablesRequest and trigger fetchStablesSaga
  yield takeLatest(fetchTablesRequest.type, fetchTablesSaga);
};