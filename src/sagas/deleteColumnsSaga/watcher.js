import { put, select, takeEvery, takeLatest } from "redux-saga/effects";
import { deleteColumnsRequest } from "./actions";
import deleteColumnsWorker from "./worker";
import { deleteTablesSuccess } from "../deleteTablesSaga/actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";

export default function* deleteColumnsSaga() {
  yield takeEvery(deleteColumnsRequest.type, deleteColumnsWorker);

  yield takeLatest(deleteTablesSuccess, function* (action) {
    const { tableIds } = action.payload;
    // Extract all column IDs from the deleted tables
    const columnIdsToRemove = tableIds.flatMap((table) => table.columnIds);
    if (columnIdsToRemove.length > 0) {
      yield deleteColumnsWorker({ payload: { columnIds: columnIdsToRemove } });
    }
  });

  // If an operation is updated, we may need to create columns for it
  // depending upon if the property that changes also triggered a
  // change in the underlying database view. Those kind of changes
  // depend upon certain properties changing, e.g. `operation.children`
  //
  // Note that createColumns also listens for updateOperationsSuccess
  // to create columns for new operations, so we don't need to do that here.
  yield takeEvery(updateOperationsSuccess.type, function* (action) {
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
        operationIdsToUpdate.flatMap((id) => {
          const columnIds = Object.entries(state.columns.data)
            .filter(({ tableId }) => tableId === id)
            .map(({ id }) => id);
          return columnIds;
        })
      );
      if (columnsToDelete.length > 0) {
        yield put(deleteColumnsRequest({ columnIds: columnsToDelete }));
      }
      // Note that if the operation was previously NO-OP, there won't be any columns to delete
    }
  });
}
