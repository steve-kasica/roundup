
import { put, all, takeLatest } from 'redux-saga/effects';
import { 
    fetchMultipleRequest,
    fetchMultipleFailure,
    fetchSingleRequest
} from '../slices/sourceColumnsSlice';

/**
 * @description Saga watcher for fetchMultipleRequest action and trigger saga worker
 */
export default function* multipleColumnsRequestWatcher() {
    yield takeLatest(fetchMultipleRequest.type, fetchColumnsForMultipleTables);
}
  
  /**
   * @description Saga worker to handle fetchMultipleRequest actions
   */
function* fetchColumnsForMultipleTables(action) {
    try {
      // Response via get-all-project-metadata
      const projectIds = Object.keys(action.payload);

      // Spawn a new saga for fetch column metadata for each each 
      // OpenRefine project (table). This is non-blocking.
      yield all(projectIds.map(projectId => put(fetchSingleRequest(projectId))));
  
    } catch (error) {
      yield put(fetchMultipleFailure(error))
    }
}