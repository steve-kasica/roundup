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
import countColumnValuesSagaWatcher from "./countColumnValuesSaga";
import uploadTablesSagaWatcher from "./uploadTablesSaga";
import dropTablesSagaWatcher from "./dropTablesSaga";
import createOperationViewSagaWatcher from "./createOperationViewSaga";
import removeTablesSagaWatcher from "./removeTablesSaga";
import watchComputeColumnKeynessWatcher from "./computeColumnsKeyness/computeColumnsKeyness";
import updateOperationViewSagaWatcher from "./updateOperationViewSaga/updateOperationViewSaga";
import summarizeColumnsSaga from "./summarizeColumnsSaga";
import insertNewColumnSaga from "./insertNewColumnSaga";

export default function* rootSaga() {
  yield all([
    call(fetchTablesSaga),
    call(addTablesToSchemaWatcher),
    call(renameColumnSagaWatcher),
    call(removeColumnsSagaWatcher),
    call(swapColumnsSaga),
    call(coordinateHoverSaga),
    call(countColumnValuesSagaWatcher),
    call(uploadTablesSagaWatcher),
    call(dropTablesSagaWatcher),
    call(createOperationViewSagaWatcher),
    call(updateOperationViewSagaWatcher),
    call(removeTablesSagaWatcher),
    call(watchComputeColumnKeynessWatcher),
    call(summarizeColumnsSaga),
    call(insertNewColumnSaga),
  ]);
}
