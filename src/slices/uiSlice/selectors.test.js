import { describe, it, expect, beforeEach } from "vitest";
import { initialState } from "../uiSlice";
import {
  selectSelectedColumnIds,
  selectDraggingColumnIds,
  selectDropTargetColumnIds,
  selectFocusedColumnIds,
  selectVisibleColumnIds,
  selectHoveredColumnIds,
  selectHiddenColumnIdsByParentId,
  selectFocusedObject,
} from "./selectors";
import { OPERATION_TYPE_STACK } from "../operationsSlice";

describe("uiSlice selectors", () => {
  describe("column-related selectors", () => {
    let state = { ui: null };
    beforeEach(() => {
      state.tables = { byId: {} };
      state.operations = { byId: {} };
      state.columns = { byId: {} };
      state.tables.byId = {
        t1: { id: "t1", columnIds: ["c1", "c2"] },
        t2: { id: "t2", columnIds: ["c3", "c4"] },
        t3: { id: "t3", columnIds: ["c5", "c6"] },
        t4: { id: "t4", columnIds: ["c7", "c8"] },
        t5: { id: "t5", columnIds: ["c9"] },
      };
      state.columns.byId = {
        c1: { id: "c1", parentId: "t1" },
        c2: { id: "c2", parentId: "t1" },
        c3: { id: "c3", parentId: "t2" },
        c4: { id: "c4", parentId: "t2" },
        c5: { id: "c5", parentId: "t3" },
        c6: { id: "c6", parentId: "t3" },
        c7: { id: "c7", parentId: "t4" },
        c8: { id: "c8", parentId: "t4" },
        c9: { id: "c9", parentId: "t5" },
      };
      state.operations.byId = {
        o1: { id: "o1", operationType: OPERATION_TYPE_STACK },
      };
      state.ui = {
        ...initialState,
        hoveredColumnIds: ["c3"],
        selectedColumnIds: ["c1", "c2"],
        focusedColumnIds: ["c5", "c6"],
        hiddenColumnIds: ["c1", "c3"],
        visibleColumnIds: ["c1", "c2", "c3", "c4", "c5"],
        draggingColumnIds: ["c4"],
        dropTargetColumnIds: ["c7"],
      };
    });
    describe("selectSelectedColumnIds", () => {
      it("should return the selected column IDs from the ui slice", () => {
        const selectedIds = selectSelectedColumnIds(state);
        expect(selectedIds).toEqual(["c1", "c2"]);
      });
    });
    describe("selectHoveredColumnIds", () => {
      it("should return the hovered column IDs from the ui slice", () => {
        const hoveredIds = selectHoveredColumnIds(state);
        expect(hoveredIds).toEqual(["c3"]);
      });
    });
    describe("selectDraggingColumnIds", () => {
      it("should return the dragging column IDs from the ui slice", () => {
        const draggingIds = selectDraggingColumnIds(state);
        expect(draggingIds).toEqual(["c4"]);
      });
    });
    describe("selectFocusedColumnIds", () => {
      it("should return the focused column IDs from the ui slice", () => {
        const focusedIds = selectFocusedColumnIds(state);
        expect(focusedIds).toEqual(["c5", "c6"]);
      });
    });
    describe("selectDropTargetColumnIds", () => {
      it("should return the drop target column IDs from the ui slice", () => {
        const dropTargetIds = selectDropTargetColumnIds(state);
        expect(dropTargetIds).toEqual(["c7"]);
      });
    });
    describe("selectVisibleColumnIds", () => {
      it("should return the visible column IDs from the ui slice", () => {
        const visibleIds = selectVisibleColumnIds(state);
        expect(visibleIds).toEqual(["c1", "c2", "c3", "c4", "c5"]);
      });
    });
    describe("selectHiddenColumnIdsByParentId", () => {
      it("should return a matrix of hidden column IDs for given parent IDs", () => {
        const parentIds = ["t1", "t2"];
        const hiddenColumnIdsMatrix = selectHiddenColumnIdsByParentId(
          state,
          parentIds,
        );
        expect(hiddenColumnIdsMatrix).toEqual([["c1"], ["c3"]]);
      });
      it("should return empty matrix for parent IDs with no hidden columns", () => {
        const parentIds = ["t3", "t4"];
        const hiddenColumnIdsMatrix = selectHiddenColumnIdsByParentId(
          state,
          parentIds,
        );
        expect(hiddenColumnIdsMatrix).toEqual([[], []]);
      });
      it("should return an empty array for non-existent parent IDs", () => {
        const parentIds = ["t999"];
        const hiddenColumnIdsMatrix = selectHiddenColumnIdsByParentId(
          state,
          parentIds,
        );
        expect(hiddenColumnIdsMatrix).toEqual([[]]);
      });
      it("should return an array if only one parent ID is provided", () => {
        const parentId = "t1";
        const hiddenColumnIdsMatrix = selectHiddenColumnIdsByParentId(
          state,
          parentId,
        );
        expect(hiddenColumnIdsMatrix).toEqual(["c1"]);
      });
    });
    describe("selectFocusedObject", () => {
      it("should return null if no focusedObjectId", () => {
        state.ui.focusedObjectId = null;
        const focusedObject = selectFocusedObject(state);
        expect(focusedObject).toBeNull();
      });
      it("should return the focused table if focusedObjectId is a table ID", () => {
        state.ui.focusedObjectId = "t2";
        const focusedObject = selectFocusedObject(state);
        expect(focusedObject).toEqual(state.tables.byId["t2"]);
      });
      it("should return the focused operation if focusedObjectId is an operation ID", () => {
        state.ui.focusedObjectId = "o1";
        const focusedObject = selectFocusedObject(state);
        expect(focusedObject).toEqual(state.operations.byId["o1"]);
      });
      it("should return null if focusedObjectId is neither table nor operation ID", () => {
        state.ui.focusedObjectId = "x999";
        const focusedObject = selectFocusedObject(state);
        expect(focusedObject).toBeNull();
      });
    });
  });
});
