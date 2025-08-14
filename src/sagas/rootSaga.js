/**
 * rootSaga.js
 */
import { all, call } from "redux-saga/effects";
import fetchTablesSaga from "./fetchTablesSaga";
// import fetchColumnMetadataSaga from "./fetchColumnMetadataSaga";
import renameColumnSagaWatcher from "./renameColumnsSaga";
import removeColumnsSagaWatcher from "./removeColumnsSaga";
import swapColumnsSaga from "./swapColumnsSaga";
import addTablesToSchemaWatcher from "./addTablesToSchemaSaga";
import coordinateHoverSaga from "./coordinateHoverSaga";
// import getRowsSagaWatcher from "./getRowsSaga";
import peekTableSagaWatcher from "./peekTableSaga";
import countColumnValuesSagaWatcher from "./countColumnValuesSaga";
import uploadTablesSagaWatcher from "./uploadTablesSaga";
import dropTablesSagaWatcher from "./dropTablesSaga";
import createOperationViewSagaWatcher from "./createOperationViewSaga";
import removeTablesSagaWatcher from "./removeTablesSaga";
import watchComputeColumnKeynessWatcher from "./computeColumnsKeyness/computeColumnsKeyness";
import updateOperationViewSagaWatcher from "./updateOperationViewSaga/updateOperationViewSaga";

export default function* rootSaga() {
  yield all([
    call(fetchTablesSaga),
    call(addTablesToSchemaWatcher),
    call(renameColumnSagaWatcher),
    call(removeColumnsSagaWatcher),
    call(swapColumnsSaga),
    call(coordinateHoverSaga),
    call(peekTableSagaWatcher),
    call(countColumnValuesSagaWatcher),
    call(uploadTablesSagaWatcher),
    call(dropTablesSagaWatcher),
    call(createOperationViewSagaWatcher),
    call(updateOperationViewSagaWatcher),
    call(removeTablesSagaWatcher),
    call(watchComputeColumnKeynessWatcher),
  ]);
}
