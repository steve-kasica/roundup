import { takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import deleteColumnsWorker from "./worker";
import { deleteTablesSuccess } from "../deleteTablesSaga/actions";

export default function* deleteColumnsSaga() {
  yield takeEvery(deleteColumnsRequest.type, deleteColumnsWorker);

  yield takeLatest(deleteTablesSuccess, function* (action) {
    const { tableIds } = action.payload;
    // Extract all column IDs from the deleted tables
    const columnIdsToRemove = tableIds.flatMap((table) => table.columnIds);
    if (columnIdsToRemove.length > 0) {
      yield deleteColumnsWorker({ payload: { columnIds: columnIdsToRemove } });
    }
  });
}
