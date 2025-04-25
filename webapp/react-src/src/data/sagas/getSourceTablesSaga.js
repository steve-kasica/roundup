import { put, takeLatest, call, all } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import {
  fetchTablesFailure,
  fetchTablesRequest,
  fetchTablesSuccess,
} from "../slices/sourceTablesSlice";

export default function* primarySagaWatcher() {
  // Watch for fetchTablesRequest and trigger saga worker
  yield takeLatest(fetchTablesRequest.type, primarySagaWorker);
}

/**
 * @description Fetch a list of all project metadata from OpenRefine API
 * @param {} action
 */
function* primarySagaWorker(action) {
  try {
    // Call the OpenRefine API
    const { projects } = yield call(
      OpenRefine.getAllProjectMetadata,
      action.payload
    );

    const projectIds = Object.keys(projects);
    // Make request for column counts of each project
    // TODO: if the all-project-metadata actually included the number of columns, I wouldn't need to do this
    const columnsInfo = yield all(
      projectIds.map((projectId) => call(OpenRefine.getColumnsInfo, projectId))
    );

    projectIds.forEach(
      (projectId, i) =>
        (projects[projectId].columnCount = columnsInfo[i].length)
    );

    // Dispatch success action
    yield put(fetchTablesSuccess(projects));
  } catch (error) {
    // Dispatch failure action
    yield put(
      fetchTablesFailure(
        error instanceof Error ? error.message : "An error occured"
      )
    );
  }
}
