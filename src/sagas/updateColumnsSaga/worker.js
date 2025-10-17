import { call, put, select } from "redux-saga/effects";
import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  selectColumnById,
  updateColumns as updateColumnsSlice,
} from "../../slices/columnsSlice";
import { getColumnStats } from "../../lib/duckdb";
import { updateColumnsFailure, updateColumnsSuccess } from "./actions";
import { DATABASE_ATTRIBUTES } from ".";

// Worker saga
export default function* updateColumnsWorker(action) {
  const successfulUpdates = [];
  const failedUpdates = [];
  const { columnUpdates } = action.payload;

  yield put(addColumnsToLoading(columnUpdates.map(({ id }) => id)));

  for (let columnUpdate of columnUpdates) {
    const column = yield select((state) =>
      selectColumnById(state, columnUpdate.id)
    );
    try {
      let databaseAttributeValues = {};
      if (
        Object.keys(columnUpdate).some((key) =>
          DATABASE_ATTRIBUTES.includes(key)
        )
      ) {
        databaseAttributeValues = yield call(
          getColumnStats,
          columnUpdate.tableId,
          [column.columnName]
        );
      }
      // TODO: compute columnKeyness? Isn't this something we can do in the HOC?
      // function* computeColumnKeynessWorker(action) {
      //   const { columnIds, tableIds } = action.payload;
      //   for (let i = 0; i < tableIds.length; i++) {
      //     const tableId = tableIds[i];
      //     const columnUpdates = yield rankColumnsKeyness(columnIds[i], tableId);
      //     yield put(updateColumns(columnUpdates)); // {id, totalRows, uniqueValues, nonNullValues}
      //   }
      // }

      successfulUpdates.push({
        ...columnUpdate,
        ...databaseAttributeValues[0],
        error: null,
      });
    } catch (error) {
      console.error("Error fetching column stats from DB:", error);
      failedUpdates.push({
        ...columnUpdate,
        error: error.message || "Unknown error",
      });
    }
  }

  // Update the column objects in the store (both successful and failed)
  yield put(updateColumnsSlice([...successfulUpdates, ...failedUpdates]));
  yield put(removeColumnsFromLoading(columnUpdates.map(({ id }) => id)));

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
