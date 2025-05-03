/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import getSourceTablesSaga from "./getSourceTablesSaga";
import getSourceTableColumnsSaga from "./getSourceTableColumnsSaga";
import renameColumnSaga from "./renameColumnSaga";
import removeColumnSaga from "./removeColumnSaga";
import removeColumnsSaga from "./removeColumnsSaga";
import swapColumnsSaga from "./swapColumnsSaga";
import swapColumnIndicesSaga from "./swapColumnIndicesSaga";
import addTableToSchemaSaga from "./addTableToSchemaSaga";
import coordinateHoverSaga from "./coordinateHoverSaga";

export default function* rootSaga() {
  yield all([
    call(getSourceTablesSaga),
    call(getSourceTableColumnsSaga),
    call(addTableToSchemaSaga),
    call(renameColumnSaga),
    call(removeColumnSaga),
    call(removeColumnsSaga),
    call(swapColumnsSaga),
    call(swapColumnIndicesSaga),
    call(coordinateHoverSaga),
  ]);
}
