import { put, call, select, takeEvery } from "redux-saga/effects";
import {
  removeColumnRequest,
  removeColumnSuccess,
  removeColumnFailure,
} from "../slices/columnsSlice";
import OpenRefine from "../../services/open-refine";
import { decrementColumnCount } from "../slices/sourceTablesSlice";
import { removeFromSelectedColumnIds } from "../slices/uiSlice";

export default function* removeColumnSaga() {
  yield takeEvery(removeColumnRequest.type, removeColumnSagaWorker);
}

function* removeColumnSagaWorker(action) {
  const id = action.payload;
  const { parentId: projectId, name } = yield select(
    (state) => state.columns.data[id]
  );

  try {
    // Call the OpenRefine API
    const csrf_token = "csrf_token"; // TODO: get this from the OpenRefine API
    yield call(OpenRefine.removeColumn, projectId, name, csrf_token);

    // Remove column from source columns slice
    yield put(removeColumnSuccess({ id }));

    // Remove column for set of selected columns, if present
    yield put(removeFromSelectedColumnIds(id));

    // Update column count of associated table
    yield put(decrementColumnCount({ projectId }));
  } catch (error) {
    yield put(removeColumnFailure({ id, error }));
  }
}
