/**
 * rootSaga.js
 */
import {all, call} from "redux-saga/effects"
import getSourceTablesSaga, {watchFetchTablesSuccess} from "./getSourceTablesSaga";
import getMultipleSourceColumnsSaga from "./getMultipleSourceColumnsSaga";
import getSingleSourceColumnsSaga from "./getSingleSourceColumnsSaga";

export default function* rootSaga() {
    yield all([
        call(getSourceTablesSaga),
        call(watchFetchTablesSuccess),
        call(getMultipleSourceColumnsSaga),
        call(getSingleSourceColumnsSaga)
    ])
}