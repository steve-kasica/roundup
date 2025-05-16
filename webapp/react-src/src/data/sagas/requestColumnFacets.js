import { createAction } from "@reduxjs/toolkit";
import OpenRefine from "../../services/open-refine";
import { all, takeLatest, put, call, select } from "redux-saga/effects";
import {
  fetchValueFacetsRequest,
  fetchValueFacetsSuccess,
  fetchValueFacetsFailure,
  selectColumnById,
  ColumnValue,
} from "../slices/columnsSlice";

export const requestColumnFacets = createAction("requestColumnFacets");

export default function* requestMultipleColumnFacetsSaga() {
  yield takeLatest(requestColumnFacets.type, requestColumnFacetsSagaWorker);
}

function* requestColumnFacetsSagaWorker(action) {
  const { columnIds } = action.payload;

  yield all(
    columnIds.map((columnId) => call(requestSingleColumnFacetsSaga, columnId))
  );
}

function* requestSingleColumnFacetsSaga(columnId) {
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

    // TODO: handle the case where facet limit count is exceeded

    // Transform the response to match the expected format
    const values = responseBody.facets[0].choices.map(({ v, c }) =>
      ColumnValue(v.v, null, c)
    );

    yield put(fetchValueFacetsSuccess({ id: columnId, values }));
  } catch (error) {
    yield put(fetchValueFacetsFailure({ id: columnId, error }));
  }
}
