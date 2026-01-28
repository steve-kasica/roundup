import { describe, it } from "vitest";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import { expectSaga } from "redux-saga-test-plan";
import uiSaga from "./watcher";
import {
  removeFromHiddenColumnIds,
  removeFromHoveredColumnIds,
  removeFromSelectedColumnIds,
  removeFromSelectedTableIds,
} from "../../slices/uiSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";

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
        .silentRun();
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
        .silentRun();
    });
  });
});
