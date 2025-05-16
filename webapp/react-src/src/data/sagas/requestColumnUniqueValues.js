import { createAction } from "@reduxjs/toolkit";
import OpenRoundup from "../../services/open-roundup";
import { all, takeLatest, put, call, select } from "redux-saga/effects";
import {
  fetchUniqueValuesRequest,
  fetchUniqueValuesSuccess,
  fetchUniqueValuesFailure,
  selectColumnById,
} from "../slices/columnsSlice";

export const requestColumnUniqueValues = createAction(
  "requestColumnUniqueValues"
);

export default function* requestColumnUniqueValuesSaga() {
  yield takeLatest(requestColumnUniqueValues.type, sagaWorker);
}

function* sagaWorker(action) {
  const { columnIds } = action.payload;

  yield all(columnIds.map((columnId) => call(requestUniqueValues, columnId)));
}

function* requestUniqueValues(columnId) {
  const column = yield select((state) => selectColumnById(state, columnId));

  // TODO: don't dispatch request if the column already has values

  const dummy_csrf_token = "htZhMqPUcrGCqLbc0bkDEbkCsECXJK4u";

  const { tableId: projectId, name: columnName } = column;

  yield put(fetchUniqueValuesRequest({ id: columnId }));

  try {
    // Call the OpenRefine API
    const responseBody = yield call(
      OpenRoundup.getUniqueColumnValues,
      projectId,
      columnName,
      dummy_csrf_token
    );

    if (responseBody.status !== "ok") {
      throw new Error(
        `Failed to fetch unique values for project ${projectId} and column ${columnName}`
      );
    }

    yield put(
      fetchUniqueValuesSuccess({
        id: columnId,
        values: responseBody.uniqueValues,
      })
    );
  } catch (error) {
    yield put(fetchUniqueValuesFailure({ id: columnId, error }));
  }
}
