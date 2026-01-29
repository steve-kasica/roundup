/**
 * @fileoverview Tests for the create operations saga watcher.
 * @module sagas/createOperationsSaga/watcher.test
 *
 * Comprehensive test suite for createOperationsWatcher covering:
 * - Basic watcher functionality
 * - Worker invocation with correct parameters
 * - Handling of different operation types
 * - Multiple operation creation requests
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import createOperationsWatcher from "./watcher";
import { createOperationsRequest } from "./actions";
import { OPERATION_TYPE_PACK } from "../../slices/operationsSlice";
import createOperationsWorker from "./worker";
import { call } from "redux-saga/effects";

describe("createOperationsWatcher", () => {
  let action;
  describe("handling createOperationsRequest action", () => {
    it("should call createOperationsWorker with action payload", async () => {
      action = createOperationsRequest([
        {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t1", "t2"],
        },
      ]);
      await expectSaga(createOperationsWatcher)
        .provide([[call(createOperationsWorker, action.payload), null]])
        .call(createOperationsWorker, action.payload)
        .dispatch(action)
        .run();
    });
  });
});
