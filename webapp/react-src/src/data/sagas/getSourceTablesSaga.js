

import { put, takeLatest, call } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import { fetchTablesFailure, fetchTablesRequest, fetchTablesSuccess } from "../slices/sourceTablesSlice";
import { Table } from "../../lib/types";

// Saga worker
function* fetchTablesSaga(action) {
  try {
    // Call the OpenRefine API
    const {projects} = yield call(OpenRefine.getAllProjectMetadata, action.payload);

    const ids = Object.keys(projects);
    const data = Array.from(
      Object.entries(projects), 
      ([id, project]) => Table(
        id,                           // id        
        project.name,                 // name
        Number(project.rowCount),     // row count
        Number(0),                    // column count
        project.created,              // date created
        project.modified,            // last modified
        project.tags,                 // tags
      ));

    // Dispatch success action
    yield put(fetchTablesSuccess(({data, ids})));
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