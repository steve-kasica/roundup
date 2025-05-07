import { createAction } from "@reduxjs/toolkit";
import OpenRefine from "../../services/open-refine";
import { all, takeLatest, put, call, select } from "redux-saga/effects";
import {
  fetchValueFacetsRequest,
  fetchValueFacetsSuccess,
  fetchValueFacetsFailure,
  selectColumnById,
} from "../slices/columnsSlice";

export const requestColumnValues = createAction("requestColumnValues");

export default function* requestColumnValuesSaga() {
  yield takeLatest(requestColumnValues.type, requestColumnValuesSagaWorker);
}

function* requestColumnValuesSagaWorker(action) {
  const { columnIds } = action.payload;

  yield all(columnIds.map((columnId) => call(requestColumnFacets, columnId)));
}

function* requestColumnFacets(columnId) {
  const column = yield select((state) => selectColumnById(state, columnId));

  const dummy_csrf_token = "htZhMqPUcrGCqLbc0bkDEbkCsECXJK4u";

  const { tableId: projectId, name: columnName } = column;

  yield put(fetchValueFacetsRequest({ id: columnId }));

  try {
    // Call the OpenRefine API
    const responseBody = yield call(
      OpenRefine.computeFacets,
      projectId,
      columnName,
      dummy_csrf_token
    );

    // Transform the response to match the expected format
    const values = responseBody.facets[0].choices.map((choice) => ({
      value: choice.v.v,
      count: choice.c,
    }));

    yield put(fetchValueFacetsSuccess({ id: columnId, values }));
  } catch (error) {
    yield put(fetchValueFacetsFailure({ id: columnId, error }));
  }
}
