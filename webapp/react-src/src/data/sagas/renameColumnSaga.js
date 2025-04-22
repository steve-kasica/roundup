import { takeLatest, put, call } from "redux-saga/effects";
import {
  renameColumnRequest,
  renameColumnSuccess,
  renameColumnFailure,
} from "../slices/sourceColumnsSlice";
import OpenRefine from "../../services/open-refine";

export default function* renameColumnSaga() {
  yield takeLatest(renameColumnRequest.type, renameColumnSagaWorker);
}

function* renameColumnSagaWorker(action) {
  const { projectId, id, newColumnName, oldColumnName } = action.payload;
  try {
    // Call the OpenRefine API
    yield call(
      OpenRefine.renameColumn,
      projectId,
      oldColumnName,
      newColumnName
    );
    yield put(renameColumnSuccess({ id, newColumnName }));
  } catch (error) {
    yield put(renameColumnFailure({ id, error }));
  }
}
