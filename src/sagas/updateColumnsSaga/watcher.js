import { put, select, takeEvery } from "redux-saga/effects";
import { updateColumnsRequest } from "./actions";
import updateColumnsWorker from "./worker";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { selectColumnsById } from "../../slices/columnsSlice";
import { DATABASE_ATTRIBUTES } from "../../slices/columnsSlice";
import { normalizeInputToArray } from "../../slices/utilities";

// Watcher saga
// payload is expected to be an array called `columnUpdates`
export default function* updateColumnsSaga() {
  yield takeEvery(updateColumnsRequest.type, updateColumnsWorker);

  // When columns are created, need to fetch additional attributes for those columns from the database
  yield takeEvery(createColumnsSuccess.type, function* (action) {
    const { columnIds } = action.payload;

    const columnUpdates = normalizeInputToArray(columnIds);

    // Fetch parent IDs (either table or operation) for the columns
    const parentIds = yield select((state) =>
      columnUpdates
        .map((id) => selectColumnsById(state, id))
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

  // When columns are excluded, we may need to also exclude operation
  // columns.
  // yield takeEvery(updateColumnsSuccess.type, function* (action) {
  //   const { updates } = action.payload;

  //   // Find all table IDs that have had columns excluded
  //   const excludedTableIds = new Set();
  //   for (const [id, updatedFields] of Object.entries(updates)) {
  //     const column = yield select((state) => selectColumnsById(state, id));
  //     const isExcluded = yield select((state) => {
  //       return selectColumnIdsByTableId(state, column.tableId).includes(id);
  //     });
  //     if (isExcluded) {
  //       excludedTableIds.add(column.tableId);
  //     }
  //   }
  // });

  // When an operation is created, we need to ensure that its columns
  // are not in the excluded state. This covers an edge case where
  // a user removes all the columns from the table (thus excluding the
  // table), but then re-adds the table to a new operation.
  // yield takeEvery(createOperationsRequest.type, function* (action) {
  //   const { operationData } = action.payload;
  //   const columnIdsToUpdate = [];
  //   for (const { childIds } of operationData) {
  //     // For each childId (which are table IDs), we need to
  //     // ensure that their columns are not excluded
  //     for (const tableId of childIds) {
  //       const excludedColumns = yield select((state) =>
  //         selectedExcludedColumnsByTableId(state, tableId)
  //       );
  //       if (excludedColumns.length > 0) {
  //         columnIdsToUpdate.push(...excludedColumns);
  //       }
  //     }
  //   }
  //   if (columnIdsToUpdate.length > 0) {
  //     // Dispatch an update to un-exclude these columns
  //     yield put(
  //       updateColumnsRequest({
  //         columnUpdates: columnIdsToUpdate.map((id) => ({
  //           id,
  //           isExcluded: false,
  //         })),
  //       })
  //     );
  //   }
  // });
}
