import { takeEvery, put, all, call, select } from "redux-saga/effects";
import { setTableHoveredStatus } from "../slices/sourceTablesSlice";
import {
  selectColumnById,
  selectColumnIdsByTableId,
  setColumnHoveredStatus,
} from "../slices/columnsSlice";
import { selectOperationByTableId } from "../slices/operationsSlice/operationsSelectors";
import { setOperationHoverStatus } from "../slices/operationsSlice/operationsSlice";

export default function* coordinateHoverSagaWatcher() {
  yield all([call(watchTableHover), call(watchColumnHover)]);
}

function* watchTableHover() {
  yield takeEvery(setTableHoveredStatus.type, triggerHoverTableOperation);
}
function* triggerHoverTableOperation(action) {
  const { tableId, isHovered } = action.payload;

  try {
    const { id: operationId } = yield select((state) =>
      selectOperationByTableId(state, tableId)
    );

    yield put(setOperationHoverStatus({ operationId, isHovered }));
  } catch {
    // If the operationId is not found, we can ignore the error
    // since it means that the table is not part of any operation
  }
}

function* watchColumnHover() {
  yield takeEvery(setColumnHoveredStatus.type, triggerHoverColumnTable);
}

/**
 * Triggers a set hover action for the table, upon which a
 * set column hover action was dispatched.
 * @param {} action
 */
function* triggerHoverColumnTable(action) {
  const { ids, id, isHovered } = action.payload;

  const columnIds = (ids || [id]).filter((id) => id !== null); // ignore null columns

  const tableIds = yield select((state) =>
    Array.from(
      new Set(
        columnIds.map((columnId) => {
          const column = selectColumnById(state, columnId);
          return column.tableId;
        })
      )
    )
  );

  yield put(setTableHoveredStatus({ tableId: tableIds, isHovered }));
}
