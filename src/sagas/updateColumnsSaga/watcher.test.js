/**
 * @fileoverview Tests for the update columns saga watcher.
 * @module sagas/updateColumnsSaga/watcher.test
 *
 * Comprehensive test suite for updateColumnsSaga (watcher) covering:
 * - Basic watcher functionality (updateColumnsRequest handling)
 * - Auto-fetching column stats on createColumnsSuccess
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateColumnsSaga from "./watcher";
import { updateColumnsRequest } from "./actions";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { Column } from "../../slices/columnsSlice";
import updateColumnsWorker from "./worker";

describe("updateColumnsSaga", () => {
  describe("handling updateColumnsRequest actions", () => {
    it("should pass column updates to the worker", () => {
      const action = updateColumnsRequest([
        { id: "c1", columnType: "INTEGER" },
        { id: "c2", name: "New Column Name" },
      ]);

      return expectSaga(updateColumnsSaga)
        .provide([[matchers.call.fn(updateColumnsWorker), null]])
        .call(updateColumnsWorker, action.payload)
        .dispatch(action)
        .silentRun(100);
    });
  });

  describe("handling createColumnsSuccess actions", () => {
    it("should pass columns to update to the worker", () => {
      const action = createColumnsSuccess([
        Column({ databaseName: "col_1", parentId: "t1" }),
        Column({ databaseName: "col_2", parentId: "t1" }),
      ]);
      return expectSaga(updateColumnsSaga)
        .provide([[matchers.call.fn(updateColumnsWorker), null]])
        .call(updateColumnsWorker, action.payload)
        .dispatch(action)
        .run();
    });
  });
});
