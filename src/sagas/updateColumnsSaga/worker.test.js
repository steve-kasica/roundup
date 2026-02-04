import { describe, it, vi, beforeEach } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import updateColumnsWorker from "./worker";
import { updateColumns } from "../../slices/columnsSlice";
import {
  getColumnStats,
  getValueCounts,
  setColumnType,
} from "../../lib/duckdb";
import { updateColumnsSuccess } from "./actions";
import { COLUMN_UNIQUE_VALUE_LIMIT } from "../../config";

vi.mock("../../lib/duckdb", () => ({
  setColumnType: vi.fn(() => Promise.resolve()),
  getColumnStats: vi.fn(() =>
    Promise.resolve([
      {
        count: 100,
      },
    ]),
  ),
  getValueCounts: vi.fn(() =>
    Promise.resolve([
      { value: "1", count: 5 },
      { value: "2", count: 3 },
      { value: "3", count: 2 },
    ]),
  ),
}));

describe("updateColumnsWorker saga", () => {
  let state;
  beforeEach(() => {
    state = {
      columns: {
        byId: {
          c1: {
            id: "c1",
            name: "Age",
            databaseName: "age",
            parentId: "t1",
            columnType: "STRING",
          },
        },
        allIds: ["c1"],
      },
      tables: {
        byId: {
          t1: {
            id: "t1",
            name: "Users",
            columnIds: ["c1"],
            databaseName: "users",
          },
        },
      },
    };
  });

  describe("update column name", () => {
    it("puts actions without issuing database calls", () => {
      const columnUpdates = [{ id: "c1", name: "User Age" }];
      const expectedPayload = columnUpdates;
      return expectSaga(updateColumnsWorker, columnUpdates)
        .withState(state)
        .not.call.fn(setColumnType)
        .not.call.fn(getColumnStats)
        .not.call.fn(getValueCounts)
        .put(updateColumns(expectedPayload))
        .put(updateColumnsSuccess(expectedPayload))
        .run();
    });
  });

  describe("update column type", () => {
    // TODO: re-enable once column type updates are supported
    it.skip("issues database call and puts actions on success", () => {
      const columnUpdates = [{ id: "c1", columnType: "INTEGER" }];
      const expectedPayload = columnUpdates;
      return expectSaga(updateColumnsWorker, columnUpdates)
        .withState(state)
        .call(setColumnType, "users", "age", "INTEGER")
        .put(updateColumns(expectedPayload))
        .put(updateColumnsSuccess(expectedPayload))
        .run();
    });
  });

  describe("update summary statistics", () => {
    it("issues database call and puts actions on success", () => {
      const columnUpdates = [{ id: "c1", count: null }];
      const expectedPayload = [
        {
          id: "c1",
          count: 100,
        },
      ];
      return expectSaga(updateColumnsWorker, columnUpdates)
        .withState(state)
        .call(getColumnStats, "users", ["age"])
        .put(updateColumns(expectedPayload))
        .put(updateColumnsSuccess(expectedPayload))
        .run();
    });
  });

  describe("update top values", () => {
    it("issues database call and puts actions on success", async () => {
      const columnUpdates = [{ id: "c1", topValues: {} }];
      const expectedPayload = [
        {
          id: "c1",
          topValues: [
            { value: "1", count: 5 },
            { value: "2", count: 3 },
            { value: "3", count: 2 },
          ],
        },
      ];
      return expectSaga(updateColumnsWorker, columnUpdates)
        .withState(state)
        .call(getValueCounts, "users", "age", COLUMN_UNIQUE_VALUE_LIMIT)
        .put(updateColumns(expectedPayload))
        .put(updateColumnsSuccess(expectedPayload))
        .run();
    });
  });
});
