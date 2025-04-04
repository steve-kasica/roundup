/**
 * getSourceColumnsSaga.js
 * 
 * 
 */
import { put, call, all, takeLatest } from 'redux-saga/effects';
import { fetchTablesSuccess } from '../slices/sourceTablesSlice';
import { 
    fetchFailure as fetchSourceColumnsFailure,
    fetchSuccess as fetchSourceColumnsSuccess
} from '../slices/sourceColumnsSlice';
import OpenRefineAPI from "../../services/open-refine";

// Saga worker
function* fetchAdditionalProjectMetadataSaga(action) {
  try {
    // Response via get-all-project-metadata
    const projects = action.payload;
    
    // Spawn a new saga for fetch column metadata for each each 
    // OpenRefine project (table). This is non-blocking.
    yield all(Object.keys(projects).map(projectId => call(fetchColumnInfoSaga, projectId)));
  } catch (error) {
    console.error("Error setting up project metadata fetches")
  }
}

// Saga worker for individual projects
function* fetchColumnInfoSaga(projectId) {
    try {
        const response = yield OpenRefineAPI.getColumnsInfo(projectId);
        yield put(fetchSourceColumnsSuccess({response, projectId}));
    } catch (error) {
        // TODO trigger fetchSourceColumnsFailure action
        console.error(`Error fetching columns for project ${projectId}:`, error);
    }
}

// Saga watcher
export default function*() {
    // Watch for fetchTablesSuccess and trigger the parent saga worker
    yield takeLatest(fetchTablesSuccess.type, fetchAdditionalProjectMetadataSaga);
}