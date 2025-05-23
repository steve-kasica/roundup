/**
 * @name sourceTablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";
import { SourceTable } from ".";

const initialState = {
  ids: [],
  data: {},
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "sourceTables",
  initialState,
  reducers: {
    // Action to trigger the saga,
    // initialize a request of source tables
    fetchTablesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    // Action to fire when saga has completed successfully
    // Updates slice with data fetched from Saga
    fetchTablesSuccess: (state, action) => {
      const projects = action.payload;

      state.ids = Object.keys(projects);

      state.ids.forEach((id) => {
        state.data[id] = new SourceTable(
          id, // id
          projects[id].name, // name
          Number(projects[id].rowCount), // row count
          Number(projects[id].columnCount), // column count
          projects[id].created, // date created
          projects[id].modified, // last modified
          projects[id].tags // tags
        );
      });
      state.loading = false;
    },
    // Action to handle when a saga has not completed successfully
    //
    fetchTablesFailure: (state, action) => {
      const error = action.payload;
      // Print error to console only if React is in dev mode
      if (process.env.NODE_ENV === "development") {
        console.error("Error: fetch tables failure", action);
      }
      state.loading = false;
      state.error = error;
    },
    decrementColumnCount: (state, action) => {
      const { projectId: tableId } = action.payload;
      state.data[tableId].columnCount--;
      // TODO: if columnCount === 0;
    },
    setTableSelectedStatus: (state, action) => {
      const { tableId, isSelected } = action.payload;
      state.data[tableId].status.isSelected = isSelected;
    },
    setTableHoveredStatus: (state, action) => {
      const { tableId, isHovered } = action.payload;

      // Normalize input to an array
      const tableIds = Array.isArray(tableId) ? tableId : [tableId];

      tableIds.forEach((id) => {
        const table = state.data[id];
        if (table) {
          table.status.isHovered = isHovered;
        }
      });
    },
    incrementRowsExplored: (state, action) => {
      const { tableId, rowsExplored } = action.payload;
      const table = state.data[tableId];
      if (table) {
        table.rowsExplored += rowsExplored;
      } else {
        throw new Error(`Table with ID ${tableId} not found`);
      }
    },
  },
});

export default slice;
