import { put, select, takeEvery } from "redux-saga/effects";
import { deleteTablesRequest } from "./actions";
import { updateTablesSuccess } from "../updateTablesSaga";
import deleteTablesWorker from "./worker";

export default function* deleteTablesSagaWatcher() {
  yield takeEvery(deleteTablesRequest.type, deleteTablesWorker);

  // If a table has had all its columns deleted, then delete the table
  // itself from the database and state.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const { changedPropertiesById } = action.payload;
    const tableIdsToDelete = Object.entries(changedPropertiesById)
      .filter(
        ([, changedProperties]) =>
          changedProperties.columnIds &&
          changedProperties.columnIds.length === 0
      )
      .map(([tableId]) => tableId);
    if (tableIdsToDelete.length > 0) {
      yield put(deleteTablesRequest({ tableIds: tableIdsToDelete }));
    }
  });
}
