// Watcher Saga
// Unlike other sagas, this saga is only in charge of
// syncing database views with operations in the redux store.

import { put, select, takeEvery, takeLatest, delay } from "redux-saga/effects";
import { updateOperationsRequest } from "./actions";
import updateOperationsWorker from "./worker";
import { selectColumnsById } from "../../slices/columnsSlice";
import { group } from "d3";
import { selectOperationIdByChildId } from "../../slices/operationsSlice";
import {
  createColumnsSuccess,
  CREATION_MODE_INSERTION,
} from "../createColumnsSaga";
import {
  materializeOperationSuccess,
  materializeOperationFailure,
} from "../materializeOperationSaga/actions";
import { selectTableColumnIds } from "../../slices/tablesSlice";

const handleChildTableColumnExclusion = function* (columnIds) {
  const tableIds = yield select((state) => {
    const ids = new Set();
    columnIds.forEach((id) => {
      const column = selectColumnsById(state, id);
      if (column) {
        ids.add(column.tableId);
      }
    });
    return Array.from(ids);
  });

  const operationUpdates = yield select((state) => {
    return tableIds
      .map((tableId) => selectOperationIdByChildId(state, tableId))
      .filter(Boolean);
  });

  if (operationUpdates.length > 0) {
    yield put(
      updateOperationsRequest({
        operationUpdates: operationUpdates.map(({ id, children }) => ({
          id,
          children, // essentially a no-op, but it will trigger the view re-creation in the database
        })),
      })
    );
  } else {
    yield null;
  }
};

const handleEmptyTable = function* (columnIds) {
  // Wait one tick to ensure all synchronous updates are done
  yield delay(0);

  // Use yield select() to get state AFTER the reducer has run
  const emptyTables = yield select((state) => {
    const emptyTables = [];

    // Calculate which tables will be empty after exclusion
    const recentlyExcludedTableIds = new Set(
      columnIds.map((id) => selectColumnsById(state, id).tableId)
    );
    for (const tableId of recentlyExcludedTableIds) {
      const activeColumnIds = selectTableColumnIds(state, tableId); // `columnIds` should be excluded already

      if (activeColumnIds.length === 0) {
        emptyTables.push(tableId);
      }
    }

    return emptyTables; // Return the result
  });

  if (emptyTables.length > 0) {
    const operationUpdates = yield select((state) => {
      const updates = new Map();

      emptyTables.forEach((tableId) => {
        const operation = selectOperationIdByChildId(state, tableId);
        if (updates.has(operation.id)) {
          updates.set(
            operation.id,
            updates.get(operation.id).filter((tid) => tid !== tableId)
          );
        } else {
          updates.set(
            operation.id,
            operation.children.filter((tid) => tid !== tableId)
          );
        }
      });

      return Array.from(updates.entries()).map(([operationId, tableIds]) => ({
        id: operationId,
        children: tableIds,
      }));
    });

    if (operationUpdates.length > 0) {
      yield put(updateOperationsRequest({ operationUpdates }));
    }
  }
};

// This it listen for actions by the operations and columns slice
export default function* updateOperationsWatcher() {
  yield takeEvery(updateOperationsRequest.type, updateOperationsWorker);

  // If inserting a column into a table that is a child of an operation,
  // then re-create the DB view associated with that operation.
  // We don't need to actually modify the operation in Redux, just re-run the view creation,
  // which will update the related operation columns.
  yield takeLatest(createColumnsSuccess.type, function* (action) {
    const { mode, columnIds } = action.payload;
    if (mode === CREATION_MODE_INSERTION) {
      // Group inserted columns by their parent table ID
      const columnsByTableId = group(
        yield select((state) =>
          columnIds.map((id) => selectColumnsById(state, id))
        ),
        (col) => col.tableId
      );

      // For each table, check if it's a child of an operation
      for (const [tableId, columns] of columnsByTableId) {
        const operation = yield select((state) =>
          selectOperationIdByChildId(state, tableId)
        );
        if (operation) {
          // Re-create the operation's view
          yield put(
            updateOperationsRequest({
              operationUpdates: [
                { children: operation.children, id: operation.id },
              ], // No actual change, just trigger the worker, kind of a hack but works
            })
          );
        }
      }
    }
  });

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

  yield takeLatest(materializeOperationSuccess.type, function* (action) {
    const { operationId, dimensions } = action.payload;
    yield put(
      updateOperationsRequest({
        operationUpdates: [
          {
            id: operationId,
            rowCount: dimensions.rowCount,
            columnCount: dimensions.columnCount,
            doesViewExist: true,
          },
        ],
      })
    );
  });
  yield takeLatest(materializeOperationFailure.type, function* (action) {
    const { operationId } = action.payload;
    yield put(
      updateOperationsRequest({
        operationUpdates: [
          {
            id: operationId,
            doesViewExist: true,
          },
        ],
      })
    );
  });
}
