/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import getSourceTablesSaga from "./getSourceTablesSaga";
import getMultipleSourceColumnsSaga from "./getMultipleSourceColumnsSaga";
import getSourceTableColumnsSaga from "./getSourceTableColumnsSaga";
import renameColumnSaga from "./renameColumnSaga";
import removeColumnSaga from "./removeColumnSaga";
import removeColumnsMultipleSaga from "./removeColumnsMultipleSaga";

export default function* rootSaga() {
  yield all([
    call(getSourceTablesSaga),
    // call(getMultipleSourceColumnsSaga),
    call(getSourceTableColumnsSaga),
    call(renameColumnSaga),
    call(removeColumnSaga),
    call(removeColumnsMultipleSaga),
  ]);
}
