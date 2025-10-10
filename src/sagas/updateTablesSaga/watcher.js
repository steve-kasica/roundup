import { put, select, takeEvery } from "redux-saga/effects";
import { updateTablesRequest } from "./actions";
import updateTablesWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga";
import { group } from "d3";
import { selectColumnById } from "../../slices/columnsSlice";

/**
 * Saga watcher that listens for the `updateTablesRequest` action and triggers the corresponding worker saga.
 *
 * @generator
 * @yields {ForkEffect} Triggers the `updateTablesSagaWorker` whenever the `updateTablesRequest` action is dispatched.
 */
export default function* updateTablesSagaWatcher() {
  yield takeEvery(updateTablesRequest.type, updateTablesWorker);

  // When columns are created, update the corresponding tables to include the new column IDs
  yield takeEvery(createColumnsSuccess.type, function* (action) {
    const { columnIds } = action.payload;

    const columns = yield select((state) => {
      return columnIds.map((id) => selectColumnById(state, id));
    });

    const columnGroups = group(columns, (col) => col.tableId);

    for (const [tableId, cols] of columnGroups) {
      yield put(
        updateTablesRequest({
          tableUpdates: [{ id: tableId, columnIds: cols.map((c) => c.id) }],
        })
      );
    }
  });
}
