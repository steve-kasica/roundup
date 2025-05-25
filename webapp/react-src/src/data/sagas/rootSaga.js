/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import fetchTablesSaga from "./fetchTablesSaga";
import fetchColumnMetadataSaga from "./fetchColumnMetadataSaga";
import renameColumnSaga from "./renameColumnSaga";
import removeColumnSaga from "./removeColumnSaga";
import removeColumnsSaga from "./removeColumnsSaga";
import swapColumnsSaga from "./swapColumnsSaga";
import swapColumnIndicesSaga from "./swapColumnIndicesSaga";
import addTableToSchemaSaga from "./addTableToSchemaSaga";
import coordinateHoverSaga from "./coordinateHoverSaga";
import getRowsSagaWatcher from "./getRowsSaga";
import peekTableSagaWatcher from "./peekTableSaga";

export default function* rootSaga() {
  yield all([
    call(fetchTablesSaga),
    call(fetchColumnMetadataSaga),
    call(addTableToSchemaSaga),
    call(renameColumnSaga),
    call(removeColumnSaga),
    call(removeColumnsSaga),
    call(swapColumnsSaga),
    call(swapColumnIndicesSaga),
    call(coordinateHoverSaga),
    call(getRowsSagaWatcher),
    call(peekTableSagaWatcher),
  ]);
}
