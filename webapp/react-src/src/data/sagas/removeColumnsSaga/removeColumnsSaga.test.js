import { describe, it, expect, beforeEach } from "vitest";
import { runSaga } from "redux-saga";
import { removeColumnsSagaWorker } from "./removeColumnsSaga";
import {
  addColumnsToLoading,
  updateAttribute,
  removeColumnsFromLoading,
} from "../../slices/columnsSlice";

describe("removeColumnsSagaWorker", () => {
  let dispatched;

  beforeEach(() => {
    dispatched = [];
  });

  it("dispatches correct actions for a single column id", async () => {
    const columnId = "col1";
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      removeColumnsSagaWorker,
      { payload: columnId }
    ).toPromise();

    expect(dispatched).toEqual([
      addColumnsToLoading([columnId]),
      updateAttribute({ ids: [columnId], attribute: "isRemoved", value: true }),
      removeColumnsFromLoading([columnId]),
    ]);
  });

  it("dispatches correct actions for multiple column ids", async () => {
    const columnIds = ["col1", "col2"];
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      removeColumnsSagaWorker,
      { payload: columnIds }
    ).toPromise();

    expect(dispatched).toEqual([
      addColumnsToLoading(columnIds),
      updateAttribute({ ids: columnIds, attribute: "isRemoved", value: true }),
      removeColumnsFromLoading(columnIds),
    ]);
  });
});
