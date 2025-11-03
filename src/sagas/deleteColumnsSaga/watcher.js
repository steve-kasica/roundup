import { put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import deleteColumnsWorker from "./worker";
import { deleteTablesSuccess } from "../deleteTablesSaga/actions";
import {
  updateOperationsFailure,
  updateOperationsSuccess,
} from "../updateOperationsSaga";
import { selectColumnIdsByTableId } from "../../slices/columnsSlice";
import { createOperationsFailure } from "../createOperationsSaga/actions";

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

  // If an operation `children` property update has failed, just
  // delete any columns associated with that operation
  yield takeEvery(updateOperationsFailure.type, function* (action) {
    const { changedPropertiesByOperation } = action.payload;

    const operationIdsToUpdate = Object.entries(
      changedPropertiesByOperation
    ).reduce((acc, [id, changedProperties]) => {
      if (changedProperties.includes("children")) {
        acc.push(id);
      }
      return acc;
    }, []);

    if (operationIdsToUpdate.length > 0) {
      const columnsToDelete = yield select((state) =>
        operationIdsToUpdate.flatMap((id) =>
          selectColumnIdsByTableId(state, id)
        )
      );
      if (columnsToDelete.length > 0) {
        yield put(deleteColumnsRequest({ columnIds: columnsToDelete }));
      }
      // Note that if the operation was previously NO-OP, there won't be any columns to delete
    }
  });

  // If an operation creation has failed, delete any columns associated with that operation
  yield takeEvery(createOperationsFailure.type, function* (action) {
    const { failedCreations } = action.payload;
    if (failedCreations.length > 0) {
      const columnsToDelete = yield select((state) =>
        failedCreations.flatMap(({ id }) => selectColumnIdsByTableId(state, id))
      );
      if (columnsToDelete.length > 0) {
        yield put(deleteColumnsRequest({ columnIds: columnsToDelete }));
      }
    }
  });
}
