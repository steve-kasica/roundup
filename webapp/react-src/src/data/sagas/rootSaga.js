/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import fetchTablesSaga from "./fetchTablesSaga";
// import fetchColumnMetadataSaga from "./fetchColumnMetadataSaga";
import renameColumnSaga from "./renameColumnsSaga";
import removeColumnsSaga from "./removeColumnsSaga";
import swapColumnsSaga from "./swapColumnsSaga";
import addTableToSchemaWatcher from "./addTableToSchemaSaga";
import coordinateHoverSaga from "./coordinateHoverSaga";
// import getRowsSagaWatcher from "./getRowsSaga";
import peekTableSagaWatcher from "./peekTableSaga";
import getValuesSagaWatcher from "./getValuesSaga";
import tableUploadWatcher from "./tableUploadSaga";

export default function* rootSaga() {
  yield all([
    call(fetchTablesSaga),
    // call(fetchColumnMetadataSaga),
    call(addTableToSchemaWatcher),
    call(renameColumnSaga),
    call(removeColumnsSaga),
    call(swapColumnsSaga),
    call(coordinateHoverSaga),
    // call(getRowsSagaWatcher),
    call(peekTableSagaWatcher),
    call(getValuesSagaWatcher),
    call(tableUploadWatcher),
  ]);
}
