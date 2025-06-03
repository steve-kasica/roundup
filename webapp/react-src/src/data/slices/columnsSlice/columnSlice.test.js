import { describe, it, expect, vi } from "vitest";
import reducer, {
  fetchSourceTableColumnsRequest,
  fetchSourceTableColumnsSuccess,
  fetchSourceTableColumnsFailure,
  renameColumnRequest,
  renameColumnSuccess,
  renameColumnFailure,
  removeColumnRequest,
  removeColumnSuccess,
  removeColumnFailure,
} from "./columnsSlice";
import Column, { COLUMN_STATUS_LOADING, COLUMN_STATUS_VISABLE } from "./Column";

describe("columnsSlice", () => {
  const initialState = {
    idsByTable: {},
    data: {},
  };

  describe("fetchSourceTableColumnsRequest", () => {
    it("should initialize placeholder columns with loading status", () => {
      const action = fetchSourceTableColumnsRequest({
        tableId: "table1",
        columnCount: 2,
      });
      const state = reducer(initialState, action);

      expect(state.idsByTable.table1).toHaveLength(2);
      expect(state.idsByTable.table1).toEqual(["c-0", "c-1"]);
      expect(state.data["c-0"]).toEqual(
        expect.objectContaining({
          tableId: "table1",
          index: 0,
          status: expect.objectContaining({ isLoading: true }),
        })
      );
      expect(state.data["c-1"]).toEqual(
        expect.objectContaining({
          tableId: "table1",
          index: 1,
          status: expect.objectContaining({ isLoading: true }),
        })
      );
    });
  });

  describe("fetchSourceTableColumnsSuccess", () => {
    it("should update columns with fetched data", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0", "c-1"] },
        data: {
          "c-0": Column(
            "table1",
            0,
            undefined,
            undefined,
            COLUMN_STATUS_LOADING
          ),
          "c-1": Column(
            "table1",
            1,
            undefined,
            undefined,
            COLUMN_STATUS_LOADING
          ),
        },
      };

      const action = fetchSourceTableColumnsSuccess({
        tableId: "table1",
        response: [
          { name: "Column A", is_numeric: false },
          { name: "Column B", is_numeric: true },
        ],
      });

      const state = reducer(preloadedState, action);

      expect(state.data["c-0"]).toEqual(
        expect.objectContaining({
          name: "Column A",
          columnType: "numeric",
          status: expect.objectContaining({ isLoading: false }),
        })
      );
      expect(state.data["c-1"]).toEqual(
        expect.objectContaining({
          name: "Column B",
          columnType: "categorical",
          status: expect.objectContaining({ isLoading: false }),
        })
      );
    });
  });

  describe("fetchSourceTableColumnsFailure", () => {
    it("should log an error in development mode", () => {
      const action = fetchSourceTableColumnsFailure({ error: "Error message" });
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Patch process.env for test
      const oldProcess = globalThis.process;
      globalThis.process = { env: { NODE_ENV: "development" } };
      reducer(initialState, action);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching columns",
        action
      );
      consoleErrorSpy.mockRestore();
      globalThis.process = oldProcess;
    });
  });

  describe("renameColumnRequest", () => {
    it("should mark a column as loading", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0"] },
        data: {
          "c-0": Column("table1", 0, "Old Name", "text", COLUMN_STATUS_VISABLE),
        },
      };

      const action = renameColumnRequest({ id: "c-0" });
      const state = reducer(preloadedState, action);

      expect(state.data["c-0"].status.isLoading).toBe(true);
      expect(state.data["c-0"].status.error).toBe(null);
    });
  });

  describe("renameColumnSuccess", () => {
    it("should update the column name and clear loading state", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0"] },
        data: {
          "c-0": Column("table1", 0, "Old Name", "text", COLUMN_STATUS_VISABLE),
        },
      };

      const action = renameColumnSuccess({
        id: "c-0",
        newColumnName: "New Name",
      });
      const state = reducer(preloadedState, action);

      expect(state.data["c-0"].name).toBe("New Name");
      expect(state.data["c-0"].status.isLoading).toBe(false);
      expect(state.data["c-0"].status.error).toBe(null);
    });
  });

  describe("renameColumnFailure", () => {
    it("should update the column error state", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0"] },
        data: {
          "c-0": Column("table1", 0, "Old Name", "text", COLUMN_STATUS_VISABLE),
        },
      };

      const action = renameColumnFailure({ id: "c-0", error: "Rename failed" });
      const state = reducer(preloadedState, action);

      expect(state.data["c-0"].status.isLoading).toBe(false);
      expect(state.data["c-0"].status.error).toBe("Rename failed");
    });
  });

  describe("removeColumnRequest", () => {
    it("should mark a column as loading", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0"] },
        data: {
          "c-0": Column(
            "table1",
            0,
            "Column Name",
            "text",
            COLUMN_STATUS_VISABLE
          ),
        },
      };

      const action = removeColumnRequest("c-0");
      const state = reducer(preloadedState, action);

      expect(state.data["c-0"].status.isLoading).toBe(true);
      expect(state.data["c-0"].status.error).toBe(null);
    });
  });

  describe("removeColumnSuccess", () => {
    it("should remove the column from the state", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0"] },
        data: {
          "c-0": Column(
            "table1",
            0,
            "Column Name",
            "text",
            COLUMN_STATUS_VISABLE
          ),
        },
      };

      const action = removeColumnSuccess({ id: "c-0" });
      const state = reducer(preloadedState, action);

      expect(state.data["c-0"]).toBeUndefined();
      expect(state.idsByTable.table1).toEqual([]);
    });
  });

  describe("removeColumnFailure", () => {
    it("should update the column error state", () => {
      const preloadedState = {
        idsByTable: { table1: ["c-0"] },
        data: {
          "c-0": Column(
            "table1",
            0,
            "Column Name",
            "text",
            COLUMN_STATUS_VISABLE
          ),
        },
      };

      const action = removeColumnFailure({ id: "c-0", error: "Remove failed" });
      const state = reducer(preloadedState, action);

      expect(state.data["c-0"].status.isLoading).toBe(false);
      expect(state.data["c-0"].status.error).toBe("Remove failed");
    });
  });

  describe("addColumnsFromOpenRefine", () => {
    it("should add columns with correct names and types from OpenRefine metadata", () => {
      const action = {
        type: "columns/addColumnsFromOpenRefine",
        payload: {
          projectId: "table2",
          columnsInfo: [
            { name: "OpenRefine Col 1", is_numeric: true },
            { name: "OpenRefine Col 2", is_numeric: false },
          ],
        },
      };
      const state = reducer(initialState, action);
      expect(state.idsByTable.table2).toHaveLength(2);
      const [id0, id1] = state.idsByTable.table2;
      expect(state.data[id0]).toEqual(
        expect.objectContaining({
          tableId: "table2",
          index: 0,
          name: "OpenRefine Col 1",
          columnType: "categorical",
        })
      );
      expect(state.data[id1]).toEqual(
        expect.objectContaining({
          tableId: "table2",
          index: 1,
          name: "OpenRefine Col 2",
          columnType: "numeric",
        })
      );
    });

    it("should append columns to an existing table's idsByTable", () => {
      const preloadedState = {
        idsByTable: { table3: ["c-0"] },
        data: {
          "c-0": Column("table3", 0, "Existing Col", "text"),
        },
      };
      const action = {
        type: "columns/addColumnsFromOpenRefine",
        payload: {
          projectId: "table3",
          columnsInfo: [
            { name: "New Col 1", is_numeric: false },
            { name: "New Col 2", is_numeric: true },
          ],
        },
      };
      const state = reducer(preloadedState, action);
      expect(state.idsByTable.table3).toHaveLength(3);
      expect(state.data[state.idsByTable.table3[1]]).toEqual(
        expect.objectContaining({
          name: "New Col 1",
          columnType: "numeric",
        })
      );
      expect(state.data[state.idsByTable.table3[2]]).toEqual(
        expect.objectContaining({
          name: "New Col 2",
          columnType: "categorical",
        })
      );
    });
  });
});
