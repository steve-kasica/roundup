/**
 * index.js
 */
import {all, call} from "redux-saga/effects"
import getSourceTablesSaga from "./getSourceTablesSaga";
import getSourceColumnsSaga from "./getSourceColumnsSaga";

export function* rootSaga() {
    yield all([
        call(getSourceTablesSaga),
        call(getSourceColumnsSaga)
    ])
}

export default rootSaga;