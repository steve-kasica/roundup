import { select, takeEvery, takeLatest } from "redux-saga/effects";
import { updateColumnsRequest } from "./actions";
import updateColumnsWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { selectColumnById } from "../../slices/columnsSlice";
import { DATABASE_ATTRIBUTES } from ".";

// Watcher saga
// payload is expected to be an array called `columnUpdates`
export default function* updateColumnsSaga() {
  yield takeLatest(updateColumnsRequest.type, updateColumnsWorker);

  // When columns are created, we may need to fetch additional attributes
  // for those columns (e.g., stats from the DB)
  yield takeEvery(createColumnsSuccess, function* (action) {
    const { columnIds } = action.payload;

    // Normalize to array
    let columnUpdates = Array.isArray(columnIds) ? columnIds : [columnIds];

    // Fetch tableIds for the columns
    const parentIds = yield select((state) =>
      columnUpdates
        .map((id) => selectColumnById(state, id))
        .map((col) => col.tableId)
    );
    columnUpdates = columnUpdates.map((id, index) => ({
      id, // columnId
      tableId: parentIds[index],
      ...Object.fromEntries(DATABASE_ATTRIBUTES.map((attr) => [attr, null])), // fetch all database-dependent attributes
    }));

    console.log("Updating newly created columns:", columnUpdates);

    // Call the worker to update columns with fetched attributes
    yield updateColumnsWorker({ payload: { columnUpdates } });
  });
}
