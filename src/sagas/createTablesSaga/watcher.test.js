/**
 * @fileoverview Tests for the create tables saga watcher.
 * @module sagas/createTablesSaga/watcher.test
 *
 *
 */
import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import createTablesWatcher from "./watcher";
import { createTablesRequest } from "./actions";
import createTablesWorker from "./worker";
import { call } from "redux-saga/effects";

describe("createTablesWatcher", () => {
  let action;
  describe("handling createTablesRequest action", () => {
    it("should call createTablesWorker with action payload", async () => {
      action = createTablesRequest([
        {
          source: "local",
          name: "table1",
          fileName: "data1.csv",
          extension: ".csv",
          size: 2048,
          mimeType: "text/csv",
          dateLastModified: 1625155200000,
        },
        {
          source: "local",
          name: "table2",
          fileName: "data2.csv",
          extension: ".csv",
          size: 4096,
          mimeType: "text/csv",
          dateLastModified: 1625241600000,
        },
      ]);
      await expectSaga(createTablesWatcher)
        .provide([[call(createTablesWorker, action.payload), null]])
        .call(createTablesWorker, action.payload)
        .dispatch(action)
        .run();
    });
  });
});
