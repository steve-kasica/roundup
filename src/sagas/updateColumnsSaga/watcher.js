import { put, select, takeEvery } from "redux-saga/effects";
import { updateColumnsRequest } from "./actions";
import updateColumnsWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import {
  selectColumnById,
  selectColumnIdsByTableId,
  selectedExcludedColumnsByTableId,
} from "../../slices/columnsSlice";
import { DATABASE_ATTRIBUTES } from ".";
import { createOperationsRequest } from "../createOperationsSaga/actions";

// Watcher saga
// payload is expected to be an array called `columnUpdates`
export default function* updateColumnsSaga() {
  yield takeEvery(updateColumnsRequest.type, updateColumnsWorker);

  // When columns are created, we may need to fetch additional attributes
  // for those columns (e.g., stats from the DB)
  yield takeEvery(createColumnsSuccess, function* (action) {
    const { columnIds } = action.payload;

    // Normalize to array
    let columnUpdates = Array.isArray(columnIds) ? columnIds : [columnIds];

    // Fetch parent IDs (either table or operation) for the columns
    const parentIds = yield select((state) =>
      columnUpdates
        .map((id) => selectColumnById(state, id))
        .map((col) => col.tableId)
    );

    // Prepare the columnUpdates with necessary info for the worker
    // We want to update a newly created column with
    // all database-dependent attributes
    columnUpdates = columnUpdates.map((id, index) => ({
      id, // columnId
      tableId: parentIds[index],
      ...Object.fromEntries(DATABASE_ATTRIBUTES.map((attr) => [attr, null])), // fetch all database-dependent attributes
    }));

    // Call the worker to update columns with fetched attributes
    yield put(updateColumnsRequest({ columnUpdates }));
  });

  // When an operation is created, we need to ensure that its columns
  // are not in the excluded state. This covers an edge case where
  // a user removes all the columns from the table (thus excluding the
  // table), but then re-adds the table to a new operation.
  yield takeEvery(createOperationsRequest.type, function* (action) {
    console.log("updateColumnsSaga: createOperationsRequest detected");
    const { operationData } = action.payload;
    const columnIdsToUpdate = [];
    for (const { childIds } of operationData) {
      // For each childId (which are table IDs), we need to
      // ensure that their columns are not excluded
      for (const tableId of childIds) {
        const excludedColumns = yield select((state) =>
          selectedExcludedColumnsByTableId(state, tableId)
        );
        if (excludedColumns.length > 0) {
          columnIdsToUpdate.push(...excludedColumns);
        }
      }
    }
    if (columnIdsToUpdate.length > 0) {
      // Dispatch an update to un-exclude these columns
      yield put(
        updateColumnsRequest({
          columnUpdates: columnIdsToUpdate.map((id) => ({
            id,
            isExcluded: false,
          })),
        })
      );
    }
  });
}
