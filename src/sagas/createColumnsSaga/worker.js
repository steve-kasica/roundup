import { call, put } from "redux-saga/effects";
import {
  addColumns as addColumnsToSlice,
  Column,
} from "../../slices/columnsSlice";
import { createColumnsSuccess, createColumnsFailure } from "./actions";
import { insertColumn } from "../../lib/duckdb";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";
import { CREATION_MODE_INSERTION, CREATION_MODE_INITIALIZATION } from ".";
import { updateTables } from "../../slices/tablesSlice";

/**
 * The create columns saga assumes that an underlying database table exists
 * and that at a given index in that table, a column exists.
 * The saga creates column objects in the Redux state that map to those
 * underlying database columns.
 * @param {*} action
 */

export default function* createColumnsWorker(action) {
  const { columnLocations } = action.payload;
  const successfulCreations = [];
  const tableIdToColumnNames = new Map();
  const tableUpdates = {};

  for (const { parentId, parentDatabaseName, index } of columnLocations) {
    // Create new column object
    if (!tableIdToColumnNames.has(parentId)) {
      // Fetch column names for this TABLE or VIEW from the DB only once
      const columnDBNames = yield call(getTableColumnNames, parentDatabaseName);
      tableIdToColumnNames.set(parentId, columnDBNames);
    }
    const newColumn = Column({
      parentId,
      databaseName: tableIdToColumnNames.get(parentId)[index],
    });
    tableUpdates[parentId] = tableUpdates[parentId] || [];
    tableUpdates[parentId].push(newColumn.id);

    // if (mode === CREATION_MODE_INSERTION) {
    // try {
    //   yield call(insertColumn, parentId, newColumn.databaseName, index);
    //   successfulCreations.push(newColumn);
    // } catch (error) {
    //   console.error("Error inserting column:", error);
    //   newColumn.error = JSON.stringify(error);
    //   failedCreations.push(newColumn);
    // }
    // } else if (mode === CREATION_MODE_INITIALIZATION) {
    // If mode is initialization, then database columns already exist
    // We just need to match the column names in the DB to the column objects

    successfulCreations.push(newColumn);
    // }
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
