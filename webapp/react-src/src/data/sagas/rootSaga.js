/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import fetchTablesSaga from "./fetchTablesSaga";
// import fetchColumnMetadataSaga from "./fetchColumnMetadataSaga";
import renameColumnSagaWatcher from "./renameColumnsSaga";
import removeColumnsSagaWatcher from "./removeColumnsSaga";
import swapColumnsSaga from "./swapColumnsSaga";
import addTableToSchemaWatcher from "./addTableToSchemaSaga";
import coordinateHoverSaga from "./coordinateHoverSaga";
// import getRowsSagaWatcher from "./getRowsSaga";
import peekTableSagaWatcher from "./peekTableSaga";
import getValuesSagaWatcher from "./getValuesSaga";
import uploadTablesSagaWatcher from "./uploadTablesSaga";
import dropTablesSagaWatcher from "./dropTablesSaga";
import createOperationViewSagaWatcher from "./createOperationViewSaga";
import removeTablesSagaWatcher from "./removeTablesSaga";

export default function* rootSaga() {
  yield all([
    call(fetchTablesSaga),
    call(addTableToSchemaWatcher),
    call(renameColumnSagaWatcher),
    call(removeColumnsSagaWatcher),
    call(swapColumnsSaga),
    call(coordinateHoverSaga),
    call(peekTableSagaWatcher),
    call(getValuesSagaWatcher),
    call(uploadTablesSagaWatcher),
    call(dropTablesSagaWatcher),
    call(createOperationViewSagaWatcher),
    call(removeTablesSagaWatcher),
  ]);
}
