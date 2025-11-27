import { put, select, takeEvery } from "redux-saga/effects";
import { updateColumnsRequest } from "./actions";
import updateColumnsWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import {
  SUMMARY_ATTRIBUTES,
  TOP_VALUES_ATTR,
  selectColumnsById,
} from "../../slices/columnsSlice";
import { normalizeInputToArray } from "../../slices/utilities";

// Watcher saga
// payload is expected to be an array called `columnUpdates`
export default function* updateColumnsSaga() {
  yield takeEvery(updateColumnsRequest.type, updateColumnsWorker);

  // When columns are created, need to fetch additional attributes for those columns from the database
  yield takeEvery(createColumnsSuccess.type, function* (action) {
    const { columnIds } = action.payload;

    const columnUpdates = normalizeInputToArray(columnIds).map((id) => ({
      id,
      ...Object.fromEntries(
        SUMMARY_ATTRIBUTES.filter((attr) => attr !== "columnType").map(
          (attr) => [attr, null]
        )
      ),
      [TOP_VALUES_ATTR]: null,
    }));

    // Call the worker to update columns with fetched attributes
    yield put(updateColumnsRequest({ columnUpdates }));
  });
}
