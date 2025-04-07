/**
 * getSourceColumnsSaga.js
 * 
 * 
 */
import { put, takeEvery } from 'redux-saga/effects';
import { 
    fetchSingleFailure,
    fetchSingleRequest,
    fetchSingleSuccess
} from '../slices/sourceColumnsSlice';
import OpenRefineAPI from "../../services/open-refine";

/**
 * @description Saga watcher for individual requests
 */
export default function* singleSourceColumnSagaWatcher() {
  yield takeEvery(fetchSingleRequest.type, singleSourceColumnsSagaWorker);
}

/**
 * 
 * @param {*} projectId 
 */
function* singleSourceColumnsSagaWorker(action) {
    const projectId = action.payload;
    try {
        // Call the OpenRefine API
        const response = yield OpenRefineAPI.getColumnsInfo(projectId);

        // Dispatch success action
        yield put(fetchSingleSuccess({response, projectId}));
    } catch (error) {
        // Dispatch failure action
        yield put(fetchSingleFailure({error, projectId}));
    }
}