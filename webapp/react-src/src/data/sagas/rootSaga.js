/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import getSourceTablesSaga from "./getSourceTablesSaga";
import getSourceTableColumnsSaga from "./getSourceTableColumnsSaga";
import renameColumnSaga from "./renameColumnSaga";
import removeColumnSaga from "./removeColumnSaga";
import removeColumnsSaga from "./removeColumnsSaga";

export default function* rootSaga() {
  yield all([
    call(getSourceTablesSaga),
    call(getSourceTableColumnsSaga),
    call(renameColumnSaga),
    call(removeColumnSaga),
    call(removeColumnsSaga),
  ]);
}
