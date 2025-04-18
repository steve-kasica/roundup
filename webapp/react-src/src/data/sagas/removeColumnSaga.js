import { takeLatest, put, call } from "redux-saga/effects";
import { 
    removeColumnRequest as request, 
    removeColumnSuccess as success, 
    removeColumnFailure as failure 
} from "../slices/sourceColumnsSlice";
import OpenRefine from "../../services/open-refine";

export default function* removeColumnSaga(action) { 
    yield takeLatest(request.type, removeColumnSagaWorker);
};

function* removeColumnSagaWorker(action) {
    const {projectId, columnIndex, columnName} = action.payload;
    const csrf_token = "csrf_token"; // TODO: get this from the OpenRefine API
    try {
        // Call the OpenRefine API
        yield call(OpenRefine.removeColumn, projectId, columnName, csrf_token);
        yield put(success({ projectId, columnIndex }));
    } catch (error) {
        yield put(failure({ projectId, columnIndex, error }));
    }
}