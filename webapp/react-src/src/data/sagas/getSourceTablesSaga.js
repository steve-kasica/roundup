

import { put, takeLatest, call } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import { 
  fetchTablesFailure, 
  fetchTablesRequest, 
  fetchTablesSuccess 
} from "../slices/sourceTablesSlice";
import { fetchMultipleRequest } from "../slices/sourceColumnsSlice";

export default function* primarySagaWatcher() {
  // Watch for fetchTablesRequest and trigger saga worker
  yield takeLatest(fetchTablesRequest.type, primarySagaWorker);
};

/**
 * @description Fetch a list of all project metadata from OpenRefine API
 * @param {} action 
 */
function* primarySagaWorker(action) {
  try {
    // Call the OpenRefine API
    const {projects} = yield call(OpenRefine.getAllProjectMetadata, action.payload);

    // Dispatch success action
    yield put(fetchTablesSuccess(projects));
  } catch (error) {
    // Dispatch failure action
    yield put(fetchTablesFailure(
      error instanceof Error ? error.message : "An error occured"
    ));
  }
};

/**
 * @description An auxiliary saga watcher that fires when 
 * the fetchTablesSuccess action dispatches a success action
 */
export function* watchFetchTablesSuccess() {
    // Watch for fetchTablesSuccess and trigger the parent saga worker
    yield takeLatest(
      fetchTablesSuccess.type,
      fetchTableSuccessHandler
    );
}

/**
 * @description An Auxiliary saga worker
 * @param {*} action 
 */
function* fetchTableSuccessHandler(action) {
  const {payload} = action;
  yield put(fetchMultipleRequest(payload))
}