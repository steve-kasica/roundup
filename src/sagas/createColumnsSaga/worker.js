import { call, put, select } from "redux-saga/effects";
import {
  addColumns as addColumnsToSlice,
  Column,
} from "../../slices/columnsSlice";
import { createColumnsSuccess, createColumnsFailure } from "./actions";
import {
  getColumnStats,
  getTableDimensions,
  insertColumn,
  renameColumns,
} from "../../lib/duckdb";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";
import { selectOperation } from "../../slices/operationsSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
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
      try {
        yield call(insertColumn, parentId, newColumn.id);
      } catch (error) {
        console.error("Error inserting column:", error);
        newColumn.error = JSON.stringify(error);
        failedCreations.push(newColumn);
      }
      successfulCreations.push(newColumn);
    } else if (mode === CREATION_MODE_INITIALIZATION) {
      if (isTableId(parentId)) {
        if (!tableIdToColumnNames.has(parentId)) {
          const columnNames = yield call(getTableColumnNames, parentId);
          tableIdToColumnNames.set(parentId, columnNames);
        }
        const columnNames = tableIdToColumnNames.get(parentId);
        if (index < 0 || index >= columnNames.length) {
          const errorMsg = `Index ${index} is out of bounds for table with ${columnNames.length} columns.`;
          console.error(errorMsg);
          failedCreations.push({ parentId, error: errorMsg });
          continue; // Skip to the next iteration
        }
        newColumn.name = columnNames[index];

        try {
          // Rename DB table columns to match the column IDs
          yield call(
            renameColumns,
            parentId,
            [newColumn.name], // old name
            [newColumn.id] // new name
          );

          successfulCreations.push(newColumn);
        } catch (error) {
          console.error("Error renaming column:", error);
          newColumn.error = JSON.stringify(error);
          failedCreations.push(newColumn);
        }
      } else {
        // TODO
        // Parent is an operation; get operation details
        // const operation = yield select((state) =>
        //   selectOperation(state, parentId)
        // );
        // if (!operation) {
        //   const errorMsg = `Operation with ID ${parentId} not found.`;
        //   console.error(errorMsg);
        //   failedCreations.push({ parentId, error: errorMsg });
        //   continue; // Skip to the next iteration
        // }
        // if (operation.operationType === "NO_OP") {
        //   const errorMsg = `Operation with ID ${parentId} is a NO_OP and cannot have columns.`;
        //   console.error(errorMsg);
        //   failedCreations.push({ parentId, error: errorMsg });
        //   continue; // Skip to the next iteration
        // }
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
