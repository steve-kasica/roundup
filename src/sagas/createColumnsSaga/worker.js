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

export function* initializeTableColumnsWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  const { tableId } = action.payload;
  // Get all columns from the table in the database
  const columnNames = yield call(getTableColumnNames, tableId);
  const columnStats = yield call(getColumnStats, tableId, columnNames);

  // Create new column objects
  const columns = columnNames.map((name, index) =>
    Column(tableId, index, columnStats[index])
  );
  try {
    // Rename DB table columns to match the column IDs
    yield call(
      renameColumns,
      tableId,
      columns.map((column) => column.name), // old names
      columns.map((column) => column.id) // new names
    );

    successfulCreations.push(...columns);
  } catch (error) {
    console.error("Error creating columns:", error);
    failedCreations.push(...columns);
  }

  yield put(addColumnsToSlice([...successfulCreations, ...failedCreations]));

  if (successfulCreations.length > 0) {
    yield put(
      createColumnsSuccess({
        columnIds: successfulCreations.map((col) => col.id),
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(
      createColumnsFailure({ columnIds: failedCreations.map((c) => c.id) })
    );
  }
}

export function* insertColumnsWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  const { columnPositions } = action.payload;
  // Non-initialization: create single columns at specified positions
  // Shift existing columns to the right of insertion index
  for (const { tableId, index } of columnPositions) {
    const { columnCount } = yield call(getTableDimensions, tableId);

    if (index < 0 || index > columnCount) {
      throw new Error(
        `Index ${index} is out of bounds for table with ${columnCount} columns.`
      );
    }

    // Create new column object
    const newColumn = Column(tableId, index, {});

    try {
      // Create a new column in the DB table at the specified index
      yield call(insertColumn, tableId, newColumn.id);

      successfulCreations.push(newColumn);
    } catch (error) {
      console.error("Error fetching current column names:", error);
      failedCreations.push({ tableId, error: error.message });
      continue; // Skip to the next iteration
    }
  }
  yield put(addColumnsToSlice([...successfulCreations, ...failedCreations]));

  if (successfulCreations.length > 0) {
    // Add column to columns slice
    yield put(
      createColumnsSuccess({
        successfulCreations: successfulCreations.map((col) => col.id),
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(
      createColumnsFailure({
        failedCreations: failedCreations.map((col) => col.id),
      })
    );
  }
}

export function* createPackColumnsWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  const { operationId } = action.payload;

  const operation = yield select((state) =>
    selectOperation(state, operationId)
  );
  const columnIds = select((state) =>
    operation.children.flatMap((childId) => {
      if (isTableId(childId)) {
        return selectTablesById(state, childId).columnIds;
      } else {
        return selectOperation(state, childId).columnIds;
      }
    })
  );
  for (let i = 0; i < columnIds.length; i++) {
    const newColumn = Column(operation.id, i, {});
    // try {
    successfulCreations.push(newColumn);
    // } catch (error) {
    //   console.error("Error creating columns for pack operation:", error);
    //   failedCreations.push(newColumn);
    //   continue; // Skip to the next iteration
    // }
  }

  yield put(addColumnsToSlice([...successfulCreations, ...failedCreations]));
  if (successfulCreations.length > 0) {
    yield put(
      createColumnsSuccess({
        columnIds: successfulCreations.map((col) => col.id),
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(
      createColumnsFailure({ columnIds: failedCreations.map((c) => c.id) })
    );
  }
}

export function* createStackColumnsWorker(action) {
  const successfulCreations = [];
  const failedCreations = [];
  const { operationId } = action.payload;

  const operation = yield select((state) =>
    selectOperation(state, operationId)
  );

  const columnIdMatrix = select((state) =>
    operation.children.map((childId) => {
      if (isTableId(childId)) {
        return selectTablesById(state, childId).columnIds;
      } else {
        return selectOperation(state, childId).columnIds;
      }
    })
  );
  const columnCount = Math.max(0, ...columnIdMatrix.map((ids) => ids.length));
  for (let i = 0; i < columnCount; i++) {
    const newColumn = Column(operation.id, i, {});
    // try {
    successfulCreations.push(newColumn);
    // } catch (error) {
    //   console.error("Error creating columns for stack operation:", error);
    //   failedCreations.push(newColumn);
    //   continue; // Skip to the next iteration
    // }
  }

  yield put(addColumnsToSlice([...successfulCreations, ...failedCreations]));
  if (successfulCreations.length > 0) {
    yield put(
      createColumnsSuccess({
        columnIds: successfulCreations.map((col) => col.id),
      })
    );
  }

  if (failedCreations.length > 0) {
    yield put(
      createColumnsFailure({ columnIds: failedCreations.map((c) => c.id) })
    );
  }
}
