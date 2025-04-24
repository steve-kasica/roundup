import { describe, it, expect } from "vitest";
import reducer, {
  initialState,
  setHoverTableId,
  setHoverOperationId,
  setHoverColumnIndex,
  setHoverColumnId,
  unsetHoverTableId,
  unsetHoverOperationId,
  unsetHoverColumnIndex,
  unsetHoverColumnId,
  setSelectedOperationId,
  addToSelectedColumnIds,
  addToSelectedTableIds,
  unsetSelectedOperationId,
  removeFromSelectedColumnIds,
  removeFromSelectedTableIds,
  clearSelectedColumnIds,
  clearSelectedTableIds,
  toggleSelectedColumnIds,
} from "./uiSlice";

describe("uiSlice reducer", () => {
  it("should return the initial state", () => {
    expect(reducer(undefined, {})).toEqual(initialState);
  });

  describe("hovered actions", () => {
    it("should handle setHoverTableId", () => {
      const action = setHoverTableId("table-1");
      const state = reducer(initialState, action);
      expect(state.hovered.tableId).toBe("table-1");
    });

    it("should handle setHoverOperationId", () => {
      const action = setHoverOperationId("operation-1");
      const state = reducer(initialState, action);
      expect(state.hovered.operationId).toBe("operation-1");
    });

    it("should handle setHoverColumnIndex", () => {
      const action = setHoverColumnIndex(2);
      const state = reducer(initialState, action);
      expect(state.hovered.columnIndex).toBe(2);
    });

    it("should handle setHoverColumnId", () => {
      const action = setHoverColumnId("column-1");
      const state = reducer(initialState, action);
      expect(state.hovered.columnId).toBe("column-1");
    });

    it("should handle unsetHoverTableId", () => {
      const stateWithHover = {
        ...initialState,
        hovered: { ...initialState.hovered, tableId: "table-1" },
      };
      const state = reducer(stateWithHover, unsetHoverTableId());
      expect(state.hovered.tableId).toBeNull();
    });

    it("should handle unsetHoverOperationId", () => {
      const stateWithHover = {
        ...initialState,
        hovered: { ...initialState.hovered, operationId: "operation-1" },
      };
      const state = reducer(stateWithHover, unsetHoverOperationId());
      expect(state.hovered.operationId).toBeNull();
    });

    it("should handle unsetHoverColumnIndex", () => {
      const stateWithHover = {
        ...initialState,
        hovered: { ...initialState.hovered, columnIndex: 2 },
      };
      const state = reducer(stateWithHover, unsetHoverColumnIndex());
      expect(state.hovered.columnIndex).toBeNull();
    });

    it("should handle unsetHoverColumnId", () => {
      const stateWithHover = {
        ...initialState,
        hovered: { ...initialState.hovered, columnId: "column-1" },
      };
      const state = reducer(stateWithHover, unsetHoverColumnId());
      expect(state.hovered.columnId).toBeNull();
    });
  });

  describe("selected actions", () => {
    it("should handle setSelectedOperationId", () => {
      const action = setSelectedOperationId("operation-1");
      const state = reducer(initialState, action);
      expect(state.selected.operationId).toBe("operation-1");
    });

    it("should handle addToSelectedColumnIds with an array payload", () => {
      const action = addToSelectedColumnIds(["column-1", "column-2"]);
      const state = reducer(initialState, action);
      expect(state.selected.columnIds).toEqual(["column-1", "column-2"]);
    });

    it("should handle addToSelectedColumnIds with a single object payload", () => {
      const action = addToSelectedColumnIds("column-1");
      const state = reducer(initialState, action);
      expect(state.selected.columnIds).toEqual(["column-1"]);
    });

    it("should handle addToSelectedTableIds", () => {
      const action = addToSelectedTableIds(["table-1", "table-2"]);
      const state = reducer(initialState, action);
      expect(state.selected.tableIds).toEqual(["table-1", "table-2"]);
    });

    it("should handle unsetSelectedOperationId", () => {
      const stateWithSelection = {
        ...initialState,
        selected: { ...initialState.selected, operationId: "operation-1" },
      };
      const state = reducer(stateWithSelection, unsetSelectedOperationId());
      expect(state.selected.operationId).toBeNull();
    });

    it("should handle removeFromSelectedColumnIds with an array payload", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1", "column-2"],
        },
      };
      const action = removeFromSelectedColumnIds(["column-1"]);
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual(["column-2"]);
    });

    it("should handle removeFromSelectedColumnIds with a single object payload", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1", "column-2"],
        },
      };
      const action = removeFromSelectedColumnIds("column-1");
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual(["column-2"]);
    });

    it("should handle removeFromSelectedTableIds", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          tableIds: ["table-1", "table-2"],
        },
      };
      const action = removeFromSelectedTableIds("table-1");
      const state = reducer(stateWithSelection, action);
      expect(state.selected.tableIds).toEqual(["table-2"]);
    });

    it("should handle clearSelectedColumnIds", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1", "column-2"],
        },
      };
      const state = reducer(stateWithSelection, clearSelectedColumnIds());
      expect(state.selected.columnIds).toEqual([]);
    });

    it("should handle clearSelectedTableIds", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          tableIds: ["table-1", "table-2"],
        },
      };
      const state = reducer(stateWithSelection, clearSelectedTableIds());
      expect(state.selected.tableIds).toEqual([]);
    });
  });

  describe("toggleSelectedColumnIds", () => {
    it("should add a column ID to selected.columnIds if it is not already selected", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1"],
        },
      };

      const action = toggleSelectedColumnIds("column-2");
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual(["column-1", "column-2"]);
    });

    it("should remove a column ID from selected.columnIds if it is already selected", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1", "column-2"],
        },
      };
      const action = toggleSelectedColumnIds("column-1");
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual(["column-2"]);
    });

    it("should add multiple column IDs to selected.columnIds if none are already selected", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1"],
        },
      };
      const action = toggleSelectedColumnIds(["column-2", "column-3"]);
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual([
        "column-1",
        "column-2",
        "column-3",
      ]);
    });

    it("should remove multiple column IDs from selected.columnIds if all are already selected", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1", "column-2", "column-3"],
        },
      };
      const action = toggleSelectedColumnIds(["column-2", "column-3"]);
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual(["column-1"]);
    });

    it("should toggle a mix of adding and removing column IDs", () => {
      const stateWithSelection = {
        ...initialState,
        selected: {
          ...initialState.selected,
          columnIds: ["column-1", "column-2"],
        },
      };
      const action = toggleSelectedColumnIds(["column-2", "column-3"]);
      const state = reducer(stateWithSelection, action);
      expect(state.selected.columnIds).toEqual(["column-1", "column-3"]);
    });
  });
});
