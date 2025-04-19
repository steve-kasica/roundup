/**
 * rootSaga.js
 */
import {all, call} from "redux-saga/effects"
import getSourceTablesSaga from "./getSourceTablesSaga";
import getMultipleSourceColumnsSaga from "./getMultipleSourceColumnsSaga";
import getSourceTableColumnsSaga, { watchTableAdded } from "./getSourceTableColumnsSaga";
import renameColumnSaga from "./renameColumnSaga";
import removeColumnSaga from "./removeColumnSaga";

export default function* rootSaga() {
    yield all([
        call(getSourceTablesSaga),
        // call(getMultipleSourceColumnsSaga),
        call(getSourceTableColumnsSaga),
        call(watchTableAdded),
        // call(renameColumnSaga),
        call(removeColumnSaga)
    ]);
}