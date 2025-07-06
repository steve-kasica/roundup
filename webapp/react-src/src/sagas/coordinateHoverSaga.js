import { takeEvery, put, all, call, select } from "redux-saga/effects";
import { setHoveredTable } from "../data/slices/uiSlice";
import { selectOperationByTableId } from "../data/slices/operationsSlice/operationsSelectors";
import { setHoveredOperation } from "../data/slices/operationsSlice/operationsSlice";

export default function* coordinateHoverSagaWatcher() {
  yield all([call(watchTableHover)]);
}

function* watchTableHover() {
  yield takeEvery(setHoveredTable.type, triggerHoverTableOperation);
}
function* triggerHoverTableOperation(action) {
  const tableId = action.payload;
  const isHovered = true;

  try {
    const { id: operationId } = yield select((state) =>
      selectOperationByTableId(state, tableId)
    );

    yield put(setHoveredOperation(operationId));
  } catch {
    // If the operationId is not found, we can ignore the error
    // since it means that the table is not part of any operation
  }
}
