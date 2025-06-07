import { put, call, select, takeEvery, fork, all } from "redux-saga/effects";
import {
  removeColumns,
  addColumnsToLoading,
  removeColumnsFromLoading,
  setErrorForColumn,
  selectColumnById,
} from "../slices/columnsSlice";
import OpenRefine from "../../services/open-refine";
import { createAction } from "@reduxjs/toolkit";
import { selectTablesById } from "../slices/tablesSlice/tableSelectors";
import { removeTableColumnId } from "../slices/tablesSlice/tablesSlice";
import { group } from "d3";
import { TABLE_SOURCE_OPEN_REFINE } from "../slices/tablesSlice";

/**
 * Action creator for removing columns.
 *
 * This action is dispatched to trigger the removal of columns from the state.
 * The payload should contain information about which columns to remove.
 *
 * @function
 * @returns {Object} Redux action with type "sagas/removeColumn" and payload.
 */
export const removeColumnsAction = createAction("sagas/removeColumn");

export default function* removeColumnsSaga() {
  yield takeEvery(removeColumnsAction.type, removeColumnsSagaWorker);
}

export function* removeColumnsSagaWorker(action) {
  let allColumnIds = action.payload;
  if (!Array.isArray(allColumnIds)) allColumnIds = [allColumnIds];

  yield put(addColumnsToLoading(allColumnIds));

  const allColumns = yield select((state) =>
    allColumnIds.map((id) => selectColumnById(state, id))
  );

  const columnsByTable = group(allColumns, (column) => column.tableId);

  for (const [tableId, tableColumns] of columnsByTable) {
    const table = yield select((state) => selectTablesById(state, tableId));

    if (table.source === TABLE_SOURCE_OPEN_REFINE) {
      // If the table is from OpenRefine, we can remove columns in one request via the re-order columns endpoint
      const projectId = table.remoteId;
      const allTableColumns = yield select((state) =>
        table.columnIds.map((id) => selectColumnById(state, id))
      );
      const tableColumnsToKeep = allTableColumns.filter(
        (c) => !tableColumns.some((col) => col.id === c.id)
      );
      const csrf_token = "csrf_token"; // TODO: get this from the OpenRefine API
      try {
        yield call(
          OpenRefine.reorderColumns,
          projectId,
          tableColumnsToKeep.map((c) => c.name),
          csrf_token
        );
        // Remove column from source columns slice, also updates the loading state
        // by removing the columns
        yield put(removeColumns(tableColumns.map((col) => col.id)));

        // Remove column ids from the table's columnIds
        yield put(
          removeTableColumnId({
            tableId,
            columnId: tableColumns.map((col) => col.id),
          })
        );
      } catch (error) {
        // If the OpenRefine API call fails, we can still remove the columns from the Redux state
        yield put(setErrorForColumn({ id: tableId, error }));
      }
    }
  }
}
