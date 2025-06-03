import {
  swapColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
} from "../slices/columnsSlice";
import { select, fork, all } from "redux-saga/effects";
import { takeEvery, put } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";
import { createAction } from "@reduxjs/toolkit";

export const swapColumnsAction = createAction("columns/swapColumns");

export default function* swapColumnsSaga() {
  yield takeEvery(swapColumnsAction.type, function* (action) {
    // Accepts either a single target and source id
    // or parallel arrays of target and sources ids
    let targetIds = action.payload.targetIds;
    if (!Array.isArray(targetIds)) targetIds = [targetIds];

    let sourceIds = action.payload.sourceIds;
    if (!Array.isArray(sourceIds)) sourceIds = [sourceIds];

    if (targetIds.length !== sourceIds.length) {
      throw new Error(
        "swapColumnsSaga: targetIds and sourceIds must have the same length"
      );
    }

    // Run a child saga for each pair in parallel
    yield all(
      targetIds.map((targetId, i) =>
        fork(swapColumnsSagaWorker, {
          payload: { targetId, sourceId: sourceIds[i] },
        })
      )
    );
  });
}

function* swapColumnsSagaWorker(action) {
  const { sourceId, targetId } = action.payload;

  const { sourceColumn, targetColumn, columnNames } = yield select((state) => {
    const sourceColumn = state.columns.data[sourceId];
    const targetColumn = state.columns.data[targetId];

    let columnNames = state.columns.idsByTable[sourceColumn.tableId].map(
      (id) => state.columns.data[id].name
    );

    return { sourceColumn, targetColumn, columnNames };
  });

  // Swap the items in columnNames
  const sourceIndex = sourceColumn.index;
  const targetIndex = targetColumn.index;
  [columnNames[sourceIndex], columnNames[targetIndex]] = [
    columnNames[targetIndex],
    columnNames[sourceIndex],
  ];

  const csrf_token = "foo";
  yield put(addColumnsToLoading([sourceId, targetId]));

  try {
    yield OpenRefine.reorderColumns(
      sourceColumn.tableId,
      columnNames,
      csrf_token
    );
  } catch (error) {
    yield put(setErrorForColumn({ id: sourceId, error }));
    yield put(setErrorForColumn({ id: targetId, error }));
  }

  yield put(swapColumns({ sourceId, targetId }));

  yield put(removeColumnsFromLoading([sourceId, targetId]));
}
