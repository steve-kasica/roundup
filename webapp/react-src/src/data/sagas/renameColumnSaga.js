import { takeLatest, put, call } from "redux-saga/effects";
import { renameColumnRequest, renameColumnSuccess, renameColumnFailure } from "../slices/sourceColumnsSlice";
import OpenRefine from "../../services/open-refine";

export default function* renameColumnSaga(action) { 
    yield takeLatest(renameColumnRequest.type, renameColumnSagaWorker);
};

function* renameColumnSagaWorker(action) {
    const {projectId, columnIndex, newColumnName, oldColumnName} = action.payload;
    try {
        // Call the OpenRefine API
        yield call(OpenRefine.renameColumn, projectId, oldColumnName, newColumnName);
        yield put(renameColumnSuccess(projectId, columnIndex, newColumnName));
    } catch (error) {
        yield put(renameColumnFailure(projectId, columnIndex, error));
    }
}