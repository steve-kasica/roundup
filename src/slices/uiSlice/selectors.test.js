import { describe, it, expect, beforeEach } from "vitest";
import { initialState } from "../uiSlice";
import {
  selectSelectedColumnIds,
  selectDraggingColumnIds,
  selectDropTargetColumnIds,
  selectFocusedColumnIds,
  selectVisibleColumnIds,
  selectHoveredColumnIds,
} from "./selectors";

describe("uiSlice selectors", () => {
  describe("column-related selectors", () => {
    let state = { ui: null };
    beforeEach(() => {
      state.ui = {
        ...initialState,
        hoveredColumnIds: ["c3"],
        selectedColumnIds: ["c1", "c2"],
        focusedColumnIds: ["c5", "c6"],
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
  });
});
