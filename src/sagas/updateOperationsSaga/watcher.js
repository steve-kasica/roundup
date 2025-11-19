// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.

import { put, select, takeEvery } from "redux-saga/effects";
import { updateOperationsRequest } from "./actions";
import updateOperationsWorker from "./worker";
import { selectTablesById } from "../../slices/tablesSlice";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { updateTablesSuccess } from "../updateTablesSaga";

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, updateOperationsWorker);

  // When an operation is newly created, we need to set its columnCount
  yield takeEvery(createOperationsSuccess.type, function* (action) {
    const { operationIds } = action.payload;
    const operationUpdates = operationIds.map((id) => ({
      id,
      columnCount: null, // will be set
    }));
    yield put(
      updateOperationsRequest({
        operationUpdates,
      })
    );
  });

  // When a table is updated, if it's columnIds property has changed
  // and the table is the child of a operation, we need to flag that
  // the operation is out-of-sync.
  yield takeEvery(updateTablesSuccess.type, function* (action) {
    const { changedPropertiesByTableId } = action.payload;
    const operationUpdates = [];

    for (const [tableId, changedProperties] of Object.entries(
      changedPropertiesByTableId
    )) {
      if (changedProperties.includes("columnIds")) {
        const { parentId } = yield select((state) =>
          selectTablesById(state, tableId)
        );
        if (parentId) {
          operationUpdates.push({
            id: parentId,
            isInSync: false,
          });
        }
      }
    }

    if (operationUpdates.length > 0) {
      yield put(
        updateOperationsRequest({
          operationUpdates,
        })
      );
    }
  });

  // If inserting a column into a table that is a child of an operation,
  // then re-create the DB view associated with that operation.
  // We don't need to actually modify the operation in Redux, just re-run the view creation,
  // which will update the related operation columns.
  // yield takeLatest(createColumnsSuccess.type, function* (action) {
  //   const { mode, columnIds } = action.payload;
  //   if (mode === CREATION_MODE_INSERTION) {
  //     // Group inserted columns by their parent table ID
  //     const columnsByTableId = group(
  //       yield select((state) =>
  //         columnIds.map((id) => selectColumnsById(state, id))
  //       ),
  //       (col) => col.tableId
  //     );

  //     // For each table, check if it's a child of an operation
  //     for (const [tableId, columns] of columnsByTableId) {
  //       const operation = yield select((state) =>
  //         selectOperationIdByChildId(state, tableId)
  //       );
  //       if (operation) {
  //         // Re-create the operation's view
  //         yield put(
  //           updateOperationsRequest({
  //             operationUpdates: [
  //               { childIds: operation.childIds, id: operation.id },
  //             ], // No actual change, just trigger the worker, kind of a hack but works
  //           })
  //         );
  //       }
  //     }
  //   }
  // });

  // yield takeLatest(setTablesColumnIds.type, function* (action) {
  //   // Extract column IDs from the action payload
  //   const columnIds = Array.isArray(action.payload)
  //     ? action.payload
  //     : [action.payload];

  //   // If excluding the last columns from a table, we need to remove that table
  //   // from its parent operation, if a table is in the composite schema.
  //   // The timing between Redux reducers and Sagas is important here.
  //   // Action flows through middleware in order so sagas see actions
  //   // after the reducers have updated state. So by the time this saga
  //   // see the action, the state is already updated.
  //   yield handleEmptyTable(columnIds);

  //   // If excluding columns from tables that are children of operations,
  //   // we may need to re-calculate
  //   yield handleChildTableColumnExclusion(columnIds);
  // });

  // yield takeLatest(materializeOperationSuccess.type, function* (action) {
  //   const { operationId, dimensions } = action.payload;
  //   yield put(
  //     updateOperationsRequest({
  //       operationUpdates: [
  //         {
  //           id: operationId,
  //           rowCount: dimensions.rowCount,
  //           columnCount: dimensions.columnCount,
  //           doesViewExist: true,
  //         },
  //       ],
  //     })
  //   );
  // });
  // yield takeLatest(materializeOperationFailure.type, function* (action) {
  //   const { operationId } = action.payload;
  //   yield put(
  //     updateOperationsRequest({
  //       operationUpdates: [
  //         {
  //           id: operationId,
  //           doesViewExist: true,
  //         },
  //       ],
  //     })
  //   );
  // });
}
