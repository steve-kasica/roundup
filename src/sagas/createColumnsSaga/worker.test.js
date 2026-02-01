import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import createColumnsWorker from "./worker";
import { addColumns as addColumnsToSlice } from "../../slices/columnsSlice";
import { createColumnsSuccess } from "./actions";
import { insertColumn } from "../../lib/duckdb";

describe("CreateColumnsWorker ", () => {
  let state = {
    tables: {
      byId: {
        t1: {
          id: "t1",
          name: "Table 1",
          databaseName: "db_table_1",
        },
      },
    },
    operations: {
      byId: {
        o1: {
          id: "o1",
          name: "Operation 1",
          databaseName: "db_operation_1",
        },
      },
    },
  };
  describe("Creating columns in state only", () => {
    it("should create columns in state without adding to database", () => {
      const columnData = [
        { parentId: "t1", index: 0, name: "Column A" },
        { parentId: "t1", index: 1, name: "Column B" },
      ];

      return expectSaga(createColumnsWorker, columnData, false)
        .withState(state)
        .put.actionType(addColumnsToSlice.type)
        .put.actionType(createColumnsSuccess.type)
        .run();
    });
  });

  describe("Creating columns with database update", () => {
    it("should create columns in state and add to database", () => {
      const columnData = [
        { parentId: "t1", index: 0, name: "Column A" },
        { parentId: "t1", index: 1, name: "Column B" },
      ];

      return expectSaga(createColumnsWorker, columnData, true)
        .withState(state)
        .provide([
          [
            matchers.call.fn(insertColumn),
            ["ExistingColumn1", "ExistingColumn2"],
          ],
        ])
        .call.like({ fn: insertColumn })
        .put.actionType(addColumnsToSlice.type)
        .put.actionType(createColumnsSuccess.type)
        .run();
    });
  });
});
