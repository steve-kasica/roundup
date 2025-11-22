import { put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import deleteColumnsWorker from "./worker";
import { deleteTablesSuccess } from "../deleteTablesSaga/actions";
import {
  updateOperationsFailure,
  updateOperationsSuccess,
} from "../updateOperationsSaga";
import { selectColumnIdsByParentId } from "../../slices/columnsSlice";
import { materializeOperationFailure } from "../materializeOperationSaga/actions";
import { selectOperationsById } from "../../slices/operationsSlice";

export default function* deleteColumnsSaga() {
  yield takeEvery(deleteColumnsRequest.type, deleteColumnsWorker);

  // If tables are deleted, we need to delete their columns as well
  yield takeLatest(deleteTablesSuccess, function* (action) {
    const { tableIds } = action.payload;
    // Extract all column IDs from the deleted tables
    const columnIdsToRemove = tableIds.flatMap((table) => table.columnIds);
    if (columnIdsToRemove.length > 0) {
      yield put(deleteColumnsRequest({ columnIds: columnIdsToRemove }));
    }
  });

  // If an operation `columnIds` property update has succeeded, we need
  // to check if there are any columns that have been orphaned due to
  // being removed from that operation, and delete those columns.
  //
  // TODO: how does this not also remove columns that were intentionally
  // excluded/hidden from the operation?
  yield takeLatest(updateOperationsSuccess.type, function* (action) {
    const { changedPropertiesById } = action.payload;

    for (let [operationId, changedProperties] of Object.entries(
      changedPropertiesById
    )) {
      if (changedProperties.includes("columnIds")) {
        const currentColumnIds = yield select(
          (state) => selectOperationsById(state, operationId).columnIds
        );
        const allColumnIds = yield select((state) =>
          selectColumnIdsByParentId(state, operationId)
        );
        const orphanedColumnIds = allColumnIds.filter(
          (id) => !currentColumnIds.includes(id)
        );
        if (orphanedColumnIds.length > 0) {
          yield put(deleteColumnsRequest({ columnIds: orphanedColumnIds }));
        }
      }
    }
    yield null;
  });

  // If an operation `children` property update has failed, just
  // delete any columns associated with that operation
  yield takeEvery(updateOperationsFailure.type, function* (action) {
    const { changedPropertiesById } = action.payload;

    const operationIdsToUpdate = Object.entries(changedPropertiesById).reduce(
      (acc, [id, changedProperties]) => {
        if (changedProperties.includes("children")) {
          acc.push(id);
        }
        return acc;
      },
      []
    );

    if (operationIdsToUpdate.length > 0) {
      const columnsToDelete = yield select((state) =>
        operationIdsToUpdate.flatMap((id) =>
          selectColumnIdsByParentId(state, id)
        )
      );
      if (columnsToDelete.length > 0) {
        yield put(deleteColumnsRequest({ columnIds: columnsToDelete }));
      }
      // Note that if the operation was previously NO-OP, there won't be any columns to delete
    }
  });

  // If an operation has failed to materialize, delete any columns associated with that operation
  yield takeEvery(materializeOperationFailure.type, function* (action) {
    const { operationId } = action.payload;
    const columnsToDelete = yield select((state) =>
      selectColumnIdsByParentId(state, operationId)
    );
    if (columnsToDelete.length > 0) {
      yield put(deleteColumnsRequest({ columnIds: columnsToDelete }));
    }
  });
}
