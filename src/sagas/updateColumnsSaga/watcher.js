import { takeEvery, takeLatest } from "redux-saga/effects";
import { updateColumnsRequest } from "./actions";
import updateColumnsWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga/actions";

// Watcher saga
// payload is expected to be an array called `columnUpdates`
export default function* updateColumnsSaga() {
  yield takeLatest(updateColumnsRequest.type, updateColumnsWorker);
  // yield takeEvery(createColumnsSuccess, function* (action) {
  //   const { columnIds } = action.payload;
  //   yield updateColumnsWorker({ payload: { columnIds } });
  // });
}
