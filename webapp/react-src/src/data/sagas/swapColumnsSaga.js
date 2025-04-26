import {
  swapColumnsRequest,
  swapColumnsSuccess,
  swapColumnsFailure,
} from "../slices/columnsSlice";
import { select } from "redux-saga/effects";
import { takeEvery, put } from "redux-saga/effects";
import OpenRefine from "../../services/open-refine";

export default function* swapColumnsSaga() {
  yield takeEvery(swapColumnsRequest.type, swapColumnsSagaWorker);
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

  const sourceIndex = sourceColumn.index;
  const targetIndex = targetColumn.index;

  try {
    // Swap the items in columnNames
    [columnNames[sourceIndex], columnNames[targetIndex]] = [
      columnNames[targetIndex],
      columnNames[sourceIndex],
    ];
    const csrf_token = "foo";
    yield OpenRefine.reorderColumns(
      sourceColumn.tableId,
      columnNames,
      csrf_token
    );

    yield put(swapColumnsSuccess({ sourceId, targetId }));
  } catch (error) {
    yield put(swapColumnsFailure({ sourceId, targetId, error }));
  }
}
