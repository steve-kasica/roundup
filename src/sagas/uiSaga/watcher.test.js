import { describe, it } from "vitest";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import { expectSaga } from "redux-saga-test-plan";
import uiSaga from "./watcher";
import {
  clearSelectedTableIds,
  removeFromHiddenColumnIds,
  removeFromHoveredColumnIds,
  removeFromSelectedColumnIds,
  removeFromSelectedTableIds,
  setFocusedObjectId,
} from "../../slices/uiSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";
import { createTablesSuccess } from "../createTablesSaga/actions";

describe("UiSaga watcher", () => {
  describe("Handling deleteColumnsSuccess actions", () => {
    const action = deleteColumnsSuccess([
      {
        id: "c1",
        parentId: "t1",
      },
      { id: "c2", parentId: "t1" },
    ]);

    it("should dispatch actions to remove deleted columns from hidden and selected lists", () => {
      return expectSaga(uiSaga)
        .put(removeFromHiddenColumnIds(["c1", "c2"]))
        .put(removeFromHoveredColumnIds(["c1", "c2"]))
        .put(removeFromSelectedColumnIds(["c1", "c2"]))
        .dispatch(action)
        .run();
    });
  });

  describe("Handling deleteTablesRequest actions", () => {
    const action = deleteTablesSuccess([
      {
        id: "t1",
      },
      { id: "t2" },
    ]);

    it("should dispatch action to remove deleted tables from selectedTableIds", () => {
      return expectSaga(uiSaga)
        .put(removeFromSelectedTableIds(["t1", "t2"]))
        .dispatch(action)
        .run();
    });
  });

  describe("Handling deleteOperationsSuccess actions", () => {
    const action = deleteOperationsSuccess([{ id: "o1" }]);
    it("should clear focused object ID if it was a deleted operation", () => {
      return expectSaga(uiSaga)
        .withState({
          ui: {
            focusedObjectId: "o1",
          },
        })
        .put(setFocusedObjectId(null))
        .dispatch(action)
        .run();
    });

    it("should not change focused object ID if it was not a deleted operation", () => {
      return expectSaga(uiSaga)
        .withState({
          ui: {
            focusedObjectId: "o2",
          },
        })
        .dispatch(action)
        .run();
    });
  });

  describe("Handling createOperationsSuccess actions", () => {
    const action = createOperationsSuccess([
      {
        id: "o1",
      },
      { id: "o2" },
    ]);
    it("should clear selected table IDs and set focused object ID", () => {
      return expectSaga(uiSaga)
        .put(clearSelectedTableIds())
        .put(setFocusedObjectId("o2"))
        .dispatch(action)
        .run();
    });
  });

  describe("Handling createTablesSuccess actions", () => {
    const action = createTablesSuccess([
      {
        id: "t1",
      },
      { id: "t2" },
    ]);
    it("should clear selected table IDs and set focused object ID", () => {
      return expectSaga(uiSaga)
        .put(clearSelectedTableIds())
        .put(setFocusedObjectId("t2"))
        .dispatch(action)
        .run();
    });
  });
});
