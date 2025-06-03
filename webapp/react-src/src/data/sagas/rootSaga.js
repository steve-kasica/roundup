/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import fetchTablesSaga from "./fetchTablesSaga";
import fetchColumnMetadataSaga from "./fetchColumnMetadataSaga";
import renameColumnSaga from "./renameColumnsSaga";
import removeColumnsSaga from "./removeColumnsSaga";
import swapColumnsSaga from "./swapColumnsSaga";
import addTableToSchemaSaga from "./addTableToSchemaSaga";
import coordinateHoverSaga from "./coordinateHoverSaga";
import getRowsSagaWatcher from "./getRowsSaga";
import peekTableSagaWatcher from "./peekTableSaga";
import getValuesSaga from "./getValuesSaga";

export default function* rootSaga() {
  yield all([
    call(fetchTablesSaga),
    call(fetchColumnMetadataSaga),
    call(addTableToSchemaSaga),
    call(renameColumnSaga),
    call(removeColumnsSaga),
    call(swapColumnsSaga),
    call(coordinateHoverSaga),
    call(getRowsSagaWatcher),
    call(peekTableSagaWatcher),
    call(getValuesSaga),
  ]);
}
