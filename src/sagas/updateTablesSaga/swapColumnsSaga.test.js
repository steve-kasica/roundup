import { describe, it, expect } from "vitest";
import { runSaga } from "redux-saga";
import {
  swapColumnsRequest,
  swapColumnsSagaWorker,
} from "../swapColumnsSaga/swapColumnsSaga";
import swapColumnsSaga from "../swapColumnsSaga/swapColumnsSaga";
import {
  addColumnsToLoading,
  removeColumnsFromLoading,
  clearSelectedColumns,
  swapColumns,
} from "../../slices/columnsSlice";
import { takeEvery, put } from "redux-saga/effects";

function recordSaga(saga, initialAction) {
  const dispatched = [];
  return runSaga(
    {
      dispatch: (action) => dispatched.push(action),
      getState: () => ({}),
    },
    saga,
    initialAction
  )
    .toPromise()
    .then(() => dispatched);
}

describe("swapColumnsSaga", () => {
  it("should listen for swapColumnsRequest and call swapColumnsSagaWorker", () => {
    const gen = swapColumnsSaga();
    const next = gen.next();
    expect(next.value).toEqual(
      takeEvery(swapColumnsRequest.type, expect.any(Function))
    );
  });

  it("should dispatch correct actions in swapColumnsSagaWorker", () => {
    const sourceIds = ["col1"];
    const targetIds = ["col2"];
    const allIds = [...sourceIds, ...targetIds];
    const action = swapColumnsRequest({ sourceIds, targetIds });
    const gen = swapColumnsSagaWorker(action);
    expect(gen.next().value).toEqual(put(addColumnsToLoading(allIds)));
    expect(gen.next().value).toEqual(
      put(swapColumns({ sourceIds, targetIds }))
    );
    expect(gen.next().value).toEqual(put(removeColumnsFromLoading(allIds)));
    expect(gen.next().value).toEqual(put(clearSelectedColumns()));
    expect(gen.next().done).toBe(true);
  });
});
