/**
 * rootSaga.js
 */
import {all, call} from "redux-saga/effects"
import getSourceTablesSaga from "./getSourceTablesSaga";
import getMultipleSourceColumnsSaga from "./getMultipleSourceColumnsSaga";
import getSingleSourceColumnsSaga, { watchTableAdded } from "./getSingleSourceColumnsSaga";
import renameColumnSaga from "./renameColumnSaga";
import removeColumnSaga from "./removeColumnSaga";

export default function* rootSaga() {
    yield all([
        call(getSourceTablesSaga),
        // call(getMultipleSourceColumnsSaga),
        call(getSingleSourceColumnsSaga),
        call(watchTableAdded),
        // call(renameColumnSaga),
        call(removeColumnSaga)
    ]);
}