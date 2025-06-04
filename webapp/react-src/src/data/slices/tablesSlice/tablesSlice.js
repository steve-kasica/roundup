/**
 * @name tablesSlice
 */
import { createSlice } from "@reduxjs/toolkit";
import { Table } from "./Table";

const initialState = {
  ids: [],
  data: {},
  loading: false,
  error: null,
};

const slice = createSlice({
  name: "tables",
  initialState,
  reducers: {
    // Action to trigger the saga,
    // initialize a request of source tables
    fetchTablesRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    addOpenRefineProjects: (state, action) => {
      const { projects } = action.payload;

      // TODO: use our internal IDs instead of OpenRefine IDs
      // TODO: what if project already exists?
      state.ids = state.ids.concat(Object.keys(projects));

      state.ids.forEach((id) => {
        state.data[id] = new Table(
          id, // id
          projects[id].name, // name
          Number(projects[id].rowCount), // row count
          projects[id].created, // dateCreated
          projects[id].modified, // dateLastModified
          projects[id].tags // tags
        );
      });
      state.loading = false;
      state.error = null;
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
