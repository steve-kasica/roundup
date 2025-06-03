import { call, put, select, takeLatest } from "redux-saga/effects";
import { createAction } from "@reduxjs/toolkit";
import OpenRefineAPI from "../../services/open-refine";
import { selectColumnById, setValueCounts } from "../slices/columnsSlice";
import { Value, addValues } from "../slices/valuesSlices";

const fetchValuesAction = createAction("values/fetchValues");

// Worker saga: will be fired on GET_VALUES_REQUEST actions
function* getValuesSaga(action) {
  // Assume the source is OpenRefine
  const columnId = action.payload;
  const { tableId: projectId, name: columnName } = select((state) =>
    selectColumnById(state, columnId)
  );
  const csrf_token = "TODO";
  try {
    const response = yield call(
      OpenRefineAPI.computeFacets,
      projectId,
      columnName,
      csrf_token
    );
    const values = response.facets.map((facet) => {
      return {
        value: Value(facet.v.v),
        count: facet.v.c,
      };
    });
    yield put(addValues(values.map((v) => v.value)));
    yield put(
      setValueCounts({
        values: values.map((v) => v.id),
        counts: values.map((v) => v.count),
        columnId,
      })
    );
  } catch (error) {
    console.error("Error fetching values:", error);
    // Handle error appropriately, e.g., dispatch an error action
  }
}

// Watcher saga
export default function* watchGetValuesSaga() {
  yield takeLatest(fetchValuesAction.type, getValuesSaga);
}
