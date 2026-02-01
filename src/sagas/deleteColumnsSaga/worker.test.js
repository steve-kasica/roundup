import { describe, it, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import deleteColumnsWorker from "./worker";
import { deleteColumns as deleteColumnsFromSlice } from "../../slices/columnsSlice";
import { deleteColumnsSuccess } from "./actions";
import { dropColumns } from "../../lib/duckdb";
// Mock dropColumns at module level since worker uses `yield dropColumns()` instead of `yield call(dropColumns)`
vi.mock("../../lib/duckdb", () => ({
  dropColumns: vi.fn(() => Promise.resolve()),
}));

describe("deleteColumnsWorker saga", () => {
  const state = {
    operations: {
      byId: {},
      allIds: [],
    },
    tables: {
      byId: {
        t1: {
          id: "t1",
          databaseName: "table_1",
          columnIds: ["c1", "c2", "c3"],
        },
      },
      allIds: ["t1"],
    },
    columns: {
      byId: {
        c1: { id: "c1", parentId: "t1", databaseName: "col_a" },
        c2: { id: "c2", parentId: "t1", databaseName: "col_b" },
        c3: { id: "c3", parentId: "t1", databaseName: "col_c" },
      },
      allIds: ["c1", "c2", "c3"],
    },
  };
  describe("Delete columns from database and state", () => {
    const columnsToDelete = [state.columns.byId.c1, state.columns.byId.c2];
    it("should delete columns from database and dispatch success actions", () => {
      return expectSaga(deleteColumnsWorker, columnsToDelete, true)
        .withState({ ...state })
        .call(dropColumns, "table_1", ["col_a", "col_b"])
        .put(deleteColumnsFromSlice(columnsToDelete.map((col) => col.id)))
        .put(deleteColumnsSuccess(columnsToDelete))
        .run();
    });
  });
  describe("Delete columns from state only", () => {
    const columnsToDelete = [
      { id: "c1", parentId: "t1" },
      { id: "c2", parentId: "t1" },
    ];
    it("should delete columns from database and dispatch success actions", async () => {
      await expectSaga(deleteColumnsWorker, columnsToDelete, true)
        .withState({ ...state })
        .not.call(dropColumns, undefined)
        .put(deleteColumnsFromSlice(columnsToDelete.map((col) => col.id)))
        .put(deleteColumnsSuccess(columnsToDelete))
        .run();
    });
  });
});
