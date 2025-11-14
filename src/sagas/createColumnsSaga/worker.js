import { call, put, select } from "redux-saga/effects";
import {
  addColumns as addColumnsToSlice,
  Column,
} from "../../slices/columnsSlice";
import { createColumnsSuccess } from "./actions";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";
import { selectTablesById, updateTables } from "../../slices/tablesSlice";
import { CREATION_MODE_INSERTION } from ".";
import generateUUID from "../../lib/utilities/generateUUID";
import { insertColumn } from "../../lib/duckdb";

/**
 * The create columns saga assumes that an underlying database table exists
 * and that at a given index in that table, a column exists.
 * The saga creates column objects in the Redux state that map to those
 * underlying database columns.
 * @param {*} action
 */

export default function* createColumnsWorker(action) {
  const { columnLocations, mode } = action.payload;
  const successfulCreations = [];
  const tableIdToColumnNames = new Map();
  const tableUpdates = {};

  if (mode === CREATION_MODE_INSERTION) {
    for (const { parentId, index } of columnLocations) {
      const parentTable = yield select((state) =>
        selectTablesById(state, parentId)
      );
      const column = Column({
        parentId,
        name: "New column",
        databaseName: generateUUID("col_"),
      });
      // For insertion mode, we need to handle things slightly differenly
      yield call(
        insertColumn,
        parentTable.databaseName,
        column.databaseName,
        index
      );
      successfulCreations.push(column);

      if (Object.hasOwnProperty.call(tableUpdates, parentId) === false) {
        tableUpdates[parentId] = [...parentTable.columnIds];
      }
      tableUpdates[parentId].splice(index, 0, column.id);
    }
  } else {
    // For initialization mode, we assume the database column already exists
    for (const { parentId, parentDatabaseName, index } of columnLocations) {
      if (!tableIdToColumnNames.has(parentId)) {
        // Fetch column names for this TABLE or VIEW from the DB only once
        const columnDBNames = yield call(
          getTableColumnNames,
          parentDatabaseName
        );
        tableIdToColumnNames.set(parentId, columnDBNames);
      }
      const column = Column({
        parentId,
        databaseName: tableIdToColumnNames.get(parentId)[index],
      });
      tableUpdates[parentId] = tableUpdates[parentId] || [];
      tableUpdates[parentId].push(column.id);
      successfulCreations.push(column);
    }
  }

  // Add new columns to the database slice
  yield put(addColumnsToSlice(successfulCreations));

  // Update tables with new column IDs
  yield put(
    updateTables(
      Object.entries(tableUpdates).map(([tableId, columnIds]) => ({
        id: tableId,
        columnIds,
      }))
    )
  );

  if (successfulCreations.length > 0) {
    yield put(
      createColumnsSuccess({
        columnIds: successfulCreations.map((col) => col.id),
      })
    );
  }
}
