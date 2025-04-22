import { takeLatest, put, call } from "redux-saga/effects";
import {
  removeColumnRequest,
  removeColumnSuccess,
  removeColumnFailure,
} from "../slices/sourceColumnsSlice";
import OpenRefine from "../../services/open-refine";
import { decrementColumnCount } from "../slices/sourceTablesSlice";
import { useSelector } from "react-redux";
import { getTableById } from "../selectors";

export default function* removeColumnSaga() {
  yield takeLatest(removeColumnRequest.type, removeColumnSagaWorker);
}

function* removeColumnSagaWorker(action) {
  const { tableId: projectId, id, name } = action.payload;

  try {
    // Call the OpenRefine API
    const csrf_token = "csrf_token"; // TODO: get this from the OpenRefine API
    yield call(OpenRefine.removeColumn, projectId, name, csrf_token);

    // Remove column from source columns slice
    yield put(removeColumnSuccess({ id }));

    // Update column count of associated table
    yield put(decrementColumnCount({ projectId }));
  } catch (error) {
    yield put(removeColumnFailure({ id, error }));
  }
}
