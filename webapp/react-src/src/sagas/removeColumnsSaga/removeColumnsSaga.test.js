import { describe, it, expect, beforeEach } from "vitest";
import { runSaga } from "redux-saga";
import {
  removeColumnsSagaWorker,
  removeColumnsSuccessAction,
} from "./removeColumnsSaga";
import {
  addColumnsToLoading,
  updateAttribute,
  removeColumnsFromLoading,
  removeColumns,
} from "../../data/slices/columnsSlice";

describe("removeColumnsSagaWorker", () => {
  let dispatched;

  beforeEach(() => {
    dispatched = [];
  });

  it("dispatches correct actions for a single column id", async () => {
    const columnId = "c1";
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      removeColumnsSagaWorker,
      { payload: columnId }
    ).toPromise();

    expect(dispatched).toEqual([
      addColumnsToLoading(columnId),
      removeColumns(columnId),
      removeColumnsSuccessAction(columnId),
    ]);
  });

  it("dispatches correct actions for multiple column ids", async () => {
    const columnIds = ["c1", "c2"];
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      removeColumnsSagaWorker,
      { payload: columnIds }
    ).toPromise();

    expect(dispatched).toEqual([
      addColumnsToLoading(columnIds),
      removeColumns(columnIds),
      removeColumnsSuccessAction(columnIds),
    ]);
  });
});
