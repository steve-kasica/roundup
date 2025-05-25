import { put, takeLatest, call, all, take } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import {
  addOpenRefineProjects,
  // fetchTablesFailure,
  // fetchTablesRequest,
  // fetchTablesSuccess,
} from "../slices/sourceTablesSlice";
import { createAction } from "@reduxjs/toolkit";
import { fetchColumnMetadataRequest } from "./fetchColumnMetadataSaga";
import { fetchColumnMetadataSuccess } from "./fetchColumnMetadataSaga";
// import { fetchColumnMetadata } from "./fetchColumnMetadata";

export const fetchTablesRequest = createAction("saga/fetchTablesRequest");
export const fetchTablesSuccess = createAction("saga/fetchTablesSuccess");
export const fetchTablesFailure = createAction("saga/fetchTablesSuccess");

export default function* fetchTablesSagaWatcher() {
  // Watch for the getTablesActions and trigger saga worker
  yield takeLatest(fetchTablesRequest.type, fetchTablesSagaWorker);
}

function* fetchTablesSagaWorker(action) {
  const { source } = action.payload;
  let response;

  try {
    if (source === "openrefine") {
      // Call the OpenRefine API
      response = yield call(OpenRefine.getAllProjectMetadata);
      yield put(
        fetchColumnMetadataRequest({
          source: "openrefine",
          remoteTableIds: Object.keys(response.projects),
        })
      );

      // Wait for the fetchColumnMetadata to finish
      // This is a blocking call, so the saga will wait here until
      // the action is dispatched
      yield take(fetchColumnMetadataSuccess.type);

      yield put(addOpenRefineProjects({ projects: response.projects }));
    }
    // if source contains openrefine, wait for fetchColumnMetadata to finish
    // TODO: SIGNAL FETCH TABLES SUCCESS
  } catch (error) {
    // Dispatch failure action
    yield put(
      fetchTablesFailure(
        error instanceof Error ? error.message : "An error occured"
      )
    );
  }
}
