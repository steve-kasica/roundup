import { call, put, select } from "redux-saga/effects";
import {
  selectColumnsById,
  updateColumns as updateColumnsSlice,
} from "../../slices/columnsSlice";
import { getColumnStats } from "../../lib/duckdb";
import { updateColumnsFailure, updateColumnsSuccess } from "./actions";
import { DATABASE_ATTRIBUTES } from "../../slices/columnsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";

// Worker saga
export default function* updateColumnsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const { columnUpdates } = action.payload;

  for (let columnUpdate of columnUpdates) {
    const column = yield select((state) =>
      selectColumnsById(state, columnUpdate.id)
    );
    // TODO: honestly, this should be streamlined into a selector that handles both tables and operations
    const parent = yield select((state) =>
      isTableId(column.parentId)
        ? selectTablesById(state, column.parentId)
        : selectOperationsById(state, column.parentId)
    );
    try {
      let databaseUpdates = {};
      if (
        Object.keys(columnUpdate).some((key) =>
          DATABASE_ATTRIBUTES.includes(key)
        )
      ) {
        databaseUpdates = yield call(getColumnStats, parent.databaseName, [
          column.databaseName,
        ]);
      }

      successfulUpdates.push({
        ...columnUpdate,
        ...databaseUpdates[0],
      });
    } catch (error) {
      console.error("Failed to update column:", column.id, error);
      failedUpdates.push({
        ...columnUpdate,
      });
    }
  }

  // Update the column objects in the store (both successful and failed)
  yield put(updateColumnsSlice(successfulUpdates));

  const formatUpdates = (updates) =>
    Object.fromEntries(
      updates.map((c) => [c.id, Object.keys(c).filter((key) => key !== "id")])
    );

  if (successfulUpdates.length > 0) {
    yield put(
      updateColumnsSuccess({
        updates: formatUpdates(successfulUpdates),
      })
    );
  }

  if (failedUpdates.length > 0) {
    yield put(
      updateColumnsFailure({
        updates: formatUpdates(failedUpdates),
      })
    );
  }
}
