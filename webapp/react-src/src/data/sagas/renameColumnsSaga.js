import { takeLatest, put, call, all, fork, select } from "redux-saga/effects";
import {
  renameColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  selectColumnById,
} from "../slices/columnsSlice";
import OpenRefine from "../../services/open-refine";
import { createAction } from "@reduxjs/toolkit";

export const renameColumnsAction = createAction("columns/renameColumn");

export default function* renameColumnSaga() {
  yield takeLatest(renameColumnsAction.type, function* (action) {
    const newColumnName = action.payload.newColumnName;
    // Accepts either a single id or an array of ids
    let ids = action.payload.id;
    if (!Array.isArray(ids)) ids = [ids];
    // Run a child saga for each id in parallel
    yield all(
      ids.map((id) =>
        fork(renameColumnsSagaWorker, { payload: id, newColumnName })
      )
    );
  });
}

function* renameColumnsSagaWorker(action) {
  const { id, newColumnName } = action.payload;

  const { tableId: projectId, name: oldColumnName } = yield select((state) =>
    selectColumnById(state, id)
  );
  yield put(addColumnsToLoading(id));
  // TODO: add csrf_token handling if needed
  // TODO: what is oldColumnName in OpenRefine if you rename
  // Twice? is it the original name or the last renamed name?
  try {
    // Call the OpenRefine API
    yield call(
      OpenRefine.renameColumn,
      projectId,
      oldColumnName,
      newColumnName
    );
  } catch (error) {
    yield put(setErrorForColumn({ id, error }));
  }
  yield put(renameColumns({ id, newColumnName }));
  yield put(removeColumnsFromLoading(id));
}
