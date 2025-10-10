import { call, put, select } from "redux-saga/effects";
import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  selectColumnById,
  updateColumns as updateColumnsSlice,
} from "../../slices/columnsSlice";
import { group } from "d3-array";
import { getColumnStats } from "../../lib/duckdb";
import { updateColumnsFailure } from "./actions";

const databaseAttributes = [
  "columnType",
  "approxUnique",
  "avg",
  "count",
  "max",
  "min",
  "nullPercentage",
  "q25",
  "q50",
  "q75",
  "std",
];

// Worker saga
export default function* updateColumnsWorker(action) {
  const columnUpdates = !Array.isArray(action.payload)
    ? [action.payload]
    : action.payload;

  const columnIds = columnUpdates.map(({ id }) => id);

  const columns = yield select((state) =>
    // TODO: make this selector name plural
    columnIds.map((id) => selectColumnById(state, id))
  );
  yield put(addColumnsToLoading(columnIds));

  for (let i = 0; i < columnUpdates.length; i++) {
    let columnToUpdate = columnUpdates[i];
    try {
      // If any of the requested attributes are database attributes, fetch from DB
      let stats = {};
      if (
        Object.keys(columnToUpdate.attributes).some((key) =>
          databaseAttributes.includes(key)
        )
      ) {
        stats = yield call(getColumnStats, columns[i].tableId, [columns[i].id]);
      }
      // TODO: compute columnKeyness?
      // function* computeColumnKeynessWorker(action) {
      //   const { columnIds, tableIds } = action.payload;
      //   for (let i = 0; i < tableIds.length; i++) {
      //     const tableId = tableIds[i];
      //     const columnUpdates = yield rankColumnsKeyness(columnIds[i], tableId);
      //     yield put(updateColumns(columnUpdates)); // {id, totalRows, uniqueValues, nonNullValues}
      //   }
      // }

      columnUpdates[i] = { ...columnToUpdate, ...stats[0] };
    } catch (error) {
      console.error("Error fetching column stats from DB:", error);
      yield put(updateColumnsFailure({ error, columnIds: [columns[i].id] }));
      continue; // Skip to next column
    }
  }

  yield put(updateColumnsSlice(columnUpdates));
  yield put(removeColumnsFromLoading(columnIds));
}
