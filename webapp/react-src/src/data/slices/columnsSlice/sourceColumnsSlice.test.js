import { describe, it, expect } from "vitest";
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
          status: COLUMN_STATUS_LOADING,
        })
      );
      expect(state.data["c-1"]).toEqual(
        expect.objectContaining({
          tableId: "table1",
          index: 1,
          status: COLUMN_STATUS_LOADING,
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
          status: COLUMN_STATUS_VISABLE,
          isLoading: false,
        })
      );
      expect(state.data["c-1"]).toEqual(
        expect.objectContaining({
          name: "Column B",
          columnType: "categorical",
          status: COLUMN_STATUS_VISABLE,
          isLoading: false,
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

      process.env.NODE_ENV = "development";
      reducer(initialState, action);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching columns",
        action
      );

      consoleErrorSpy.mockRestore();
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

      expect(state.data["c-0"].loading).toBe(true);
      expect(state.data["c-0"].error).toBe(null);
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
      expect(state.data["c-0"].loading).toBe(false);
      expect(state.data["c-0"].error).toBe(null);
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

      expect(state.data["c-0"].loading).toBe(false);
      expect(state.data["c-0"].error).toBe("Rename failed");
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

      expect(state.data["c-0"].loading).toBe(true);
      expect(state.data["c-0"].error).toBe(null);
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

      expect(state.data["c-0"].loading).toBe(false);
      expect(state.data["c-0"].error).toBe("Remove failed");
    });
  });
});
