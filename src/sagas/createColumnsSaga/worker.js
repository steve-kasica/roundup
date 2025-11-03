import { call, put } from "redux-saga/effects";
import {
  addColumns as addColumnsToSlice,
  Column,
} from "../../slices/columnsSlice";
import { createColumnsSuccess, createColumnsFailure } from "./actions";
import { insertColumn } from "../../lib/duckdb";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";
import { CREATION_MODE_INSERTION, CREATION_MODE_INITIALIZATION } from ".";

export default function* createColumnsWorker(action) {
  const { columnInfo, mode } = action.payload;
  const successfulCreations = [];
  const failedCreations = [];
  const tableIdToColumnNames = new Map();

  for (const { parentId, index } of columnInfo) {
    // Create new column object
    const newColumn = Column(parentId, index, {});

    if (mode === CREATION_MODE_INSERTION) {
      const randomColumnName = `col_${Math.random()
        .toString(36)
        .substring(2, 8)}_${Date.now().toString(36)}`;
      newColumn.columnName = randomColumnName;
      newColumn.name = "New Column";
      try {
        yield call(insertColumn, parentId, newColumn.columnName, index);
        successfulCreations.push(newColumn);
      } catch (error) {
        console.error("Error inserting column:", error);
        newColumn.error = JSON.stringify(error);
        failedCreations.push(newColumn);
      }
    } else if (mode === CREATION_MODE_INITIALIZATION) {
      // If mode is initialization, then database columns already exist
      // We just need to match the column names in the DB to the column objects
      if (!tableIdToColumnNames.has(parentId)) {
        // Fetch column names for this TABLE or VIEW from the DB only once
        const columnNames = yield call(getTableColumnNames, parentId);
        console.log(
          `Fetched column names for table/view ${parentId}:`,
          columnNames
        );
        tableIdToColumnNames.set(parentId, columnNames);
      }
      try {
        const columnName = tableIdToColumnNames.get(parentId)[index];
        newColumn.columnName = columnName;
        successfulCreations.push(newColumn);
      } catch (error) {
        console.error("Error fetching current column names:", error);
        newColumn.columnName = null;
        failedCreations.push({ parentId, error: error.message });
      }
    }
  }

  yield put(addColumnsToSlice([...successfulCreations, ...failedCreations]));

  if (successfulCreations.length > 0) {
    yield put(
      createColumnsSuccess({
        columnIds: successfulCreations.map((col) => col.id),
        mode,
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(
      createColumnsFailure({
        columnIds: failedCreations.map((c) => c.id),
        mode,
      })
    );
  }
}

// export function* insertColumnsWorker(action) {
//   const successfulCreations = [];
//   const failedCreations = [];
//   const { columnPositions } = action.payload;
//   // Non-initialization: create single columns at specified positions
//   // Shift existing columns to the right of insertion index
//   for (const { tableId, index } of columnPositions) {
//     const { columnCount } = yield call(getTableDimensions, tableId);

//     if (index < 0 || index > columnCount) {
//       throw new Error(
//         `Index ${index} is out of bounds for table with ${columnCount} columns.`
//       );
//     }

//     // Create new column object
//     const newColumn = Column(tableId, index, {});

//     try {
//       // Create a new column in the DB table at the specified index
//       yield call(insertColumn, tableId, newColumn.id);

//       successfulCreations.push(newColumn);
//     } catch (error) {
//       console.error("Error fetching current column names:", error);
//       failedCreations.push({ tableId, error: error.message });
//       continue; // Skip to the next iteration
//     }
//   }
//   yield put(addColumnsToSlice([...successfulCreations, ...failedCreations]));

//   if (successfulCreations.length > 0) {
//     // Add column to columns slice
//     yield put(
//       createColumnsSuccess({
//         successfulCreations: successfulCreations.map((col) => col.id),
//       })
//     );
//   }

//   if (failedCreations.length > 0) {
//     yield put(
//       createColumnsFailure({
//         failedCreations: failedCreations.map((col) => col.id),
//       })
//     );
//   }
// }
