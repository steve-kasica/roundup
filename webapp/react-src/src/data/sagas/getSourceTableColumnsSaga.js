/**
 * getSourceColumnsSaga.js
 * 
 * Fetch column info from a single source table
 * 
 * 
 */
import { put, takeEvery } from 'redux-saga/effects';
import { 
    fetchSourceTableColumnsRequest,
    fetchSourceTableColumnsSuccess,
    fetchSourceTablesColumnsFailure
} from '../slices/sourceColumnsSlice';
import OpenRefineAPI from "../../services/open-refine";
import { createOperation } from '../slices/compositeSchemaSlice';
import { addNewChildren } from '../slices/operationsSlice';

/**
 * @description Saga watcher for individual requests
 */
export default function* singleSourceColumnSagaWatcher() {
  yield takeEvery(fetchSourceTableColumnsRequest.type, sourceTableColumnsSagaWorker);
}

/**
 * 
 * @param {*} projectId 
 */
function* sourceTableColumnsSagaWorker(action) {
    const {tableId:projectId, columnCount} = action.payload;
    try {
        // Call the OpenRefine API
        const response = yield OpenRefineAPI.getColumnsInfo(projectId);

        // Dispatch success action
        yield put(fetchSourceTableColumnsSuccess({
            tableId: projectId,            
            response, 
        }));
    } catch (error) {
        // Dispatch failure action
        yield put(fetchSourceTablesColumnsFailure({
            tableId: projectId,
            error, 
        }));
    }
}

/**
 * When a table is selected, trigger this saga
 * TODO: when a table is hovered for more than some amount of secords,
 * initialize this saga to provide opportuninistic data fetching
 */
export function* watchTableAdded() {
    yield takeEvery(addNewChildren.type, handleWatchTableAdded);
}
// payload is identical to payload passed via addNewChildren
function* handleWatchTableAdded(action) {
    const {operationType, children} = action.payload;
    yield put({
        type: fetchSourceTableColumnsRequest.type, 
        payload: {
            tableId: children[0].id,  // TODO, address multiple tables?
            columnCount: children[0].columnCount
        }
    });
}