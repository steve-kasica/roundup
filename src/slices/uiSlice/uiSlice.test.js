import { describe, test, expect } from "vitest";
import uiReducer, {
  setVisibleColumnIds,
  initialState,
  setSelectedColumnIds,
  setFocusedColumnIds,
  setHoveredColumnIds,
  setDraggingColumnIds,
  setDropTargetColumnIds,
  addToHoveredColumnIds,
  removeFromHoveredColumnIds,
} from "./uiSlice";

/**
 * Creates a test suite for reducers that normalize payloads to arrays
 * @param {string} reducerName - Name of the reducer being tested
 * @param {Function} action - Action creator function
 * @param {string} stateKey - Key in state that the reducer modifies
 */
function testArrayNormalizingReducer(reducerName, action, stateKey) {
  describe(reducerName, () => {
    test(`should set ${stateKey} with an array`, () => {
      const ids = ["id1", "id2", "id3"];
      const state = uiReducer(initialState, action(ids));

      expect(state[stateKey]).toEqual(ids);
    });

    test("should handle non-array payloads by wrapping in array", () => {
      const id = "id1";
      const state = uiReducer(initialState, action(id));

      expect(state[stateKey]).toEqual([id]);
    });

    test(`should set ${stateKey} to empty array when given empty array`, () => {
      const state = uiReducer(initialState, action([]));

      expect(state[stateKey]).toEqual([]);
    });

    test(`should overwrite existing ${stateKey}`, () => {
      const initialIds = ["id1", "id2"];
      const stateWithIds = {
        ...initialState,
        [stateKey]: initialIds,
      };

      const newIds = ["id3", "id4", "id5"];
      const state = uiReducer(stateWithIds, action(newIds));

      expect(state[stateKey]).toEqual(newIds);
      expect(state[stateKey]).not.toEqual(initialIds);
    });
  });
}

describe("uiSlice", () => {
  testArrayNormalizingReducer(
    "setVisibleColumnIds",
    setVisibleColumnIds,
    "visibleColumnIds"
  );
  testArrayNormalizingReducer(
    "setSelectedColumnIds",
    setSelectedColumnIds,
    "selectedColumnIds"
  );
  testArrayNormalizingReducer(
    "setFocusedColumnIds",
    setFocusedColumnIds,
    "focusedColumnIds"
  );
  testArrayNormalizingReducer(
    "setHoveredColumnIds",
    setHoveredColumnIds,
    "hoveredColumnIds"
  );
  testArrayNormalizingReducer(
    "setDraggingColumnIds",
    setDraggingColumnIds,
    "draggingColumnIds"
  );
  testArrayNormalizingReducer(
    "setDropTargetColumnIds",
    setDropTargetColumnIds,
    "dropTargetColumnIds"
  );

  describe("addToHoveredColumnIds", () => {
    test("should add new IDs to hoveredColumnIds", () => {
      const initialStateWithHovered = {
        ...initialState,
        hoveredColumnIds: ["id1", "id2"],
      };

      const idsToAdd = ["id3", "id4"];
      const state = uiReducer(
        initialStateWithHovered,
        addToHoveredColumnIds(idsToAdd)
      );

      expect(state.hoveredColumnIds).toEqual(["id1", "id2", "id3", "id4"]);
    });

    test("should not add duplicate IDs to hoveredColumnIds", () => {
      const initialStateWithHovered = {
        ...initialState,
        hoveredColumnIds: ["id1", "id2"],
      };

      const idsToAdd = ["id2", "id3"];
      const state = uiReducer(
        initialStateWithHovered,
        addToHoveredColumnIds(idsToAdd)
      );

      expect(state.hoveredColumnIds).toEqual(["id1", "id2", "id3"]);
    });
  });

  describe("removeFromHoveredColumnIds", () => {
    test("should remove specified IDs from hoveredColumnIds", () => {
      const initialStateWithHovered = {
        ...initialState,
        hoveredColumnIds: ["id1", "id2", "id3", "id4"],
      };

      const idsToRemove = ["id2", "id4"];
      const state = uiReducer(
        initialStateWithHovered,
        removeFromHoveredColumnIds(idsToRemove)
      );

      expect(state.hoveredColumnIds).toEqual(["id1", "id3"]);
    });
  });
});
