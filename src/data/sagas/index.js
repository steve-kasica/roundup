import getSourceTablesSaga from "./getSourceTablesSaga";
import {all, call} from "redux-saga/effects"

export function* rootSaga() {
    yield all([
        call(getSourceTablesSaga)
    ])
}

export default rootSaga;