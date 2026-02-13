import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import createColumnsWatcher from "./watcher";
import createColumnsWorker from "./worker";
import { createColumnsRequest, insertColumnsRequest } from "./actions";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
} from "../../slices/operationsSlice";
import { createTablesSuccess } from "../createTablesSaga";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { getTableColumnNames } from "../../lib/duckdb/getTableColumnNames";

// vi.mock("./worker", () => ({
//   default: vi.fn(),
// }));

// vi.mock("../../lib/duckdb/getTableColumnNames", () => ({
//   getTableColumnNames: vi.fn(["id", "name", "email"]),
// }));

describe("createColumnsWatcher", () => {
  describe("handling insertColumnsRequest actions", () => {
    describe("parent object is a table", () => {
      const state = {
        tables: {
          byId: {
            t1: {
              id: "t1",
              name: "Table 1",
              databaseName: "db_table_1",
              columnIds: ["c1", "c2"],
            },
          },
          allIds: ["t1"],
        },
        columns: {
          byId: {
            c1: { id: "c1" },
            c2: { id: "c2" },
          },
          allIds: ["c1", "c2"],
        },
        operations: { byId: {}, allIds: [] },
      };
      it("calls createColumnsWorker with correct arguments", async () => {
        const action = insertColumnsRequest([
          {
            parentId: "t1",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
        ]);
        const expectedArguments = action.payload;
        await expectSaga(createColumnsWatcher)
          .withState(state)
          .provide([[matchers.call.fn(createColumnsWorker), undefined]])
          .call(createColumnsWorker, expectedArguments, true)
          .dispatch(action)
          .run();
      });
    });

    describe("parent object is a STACK operation", () => {
      it("calls createColumnsWorker with correct arguments", async () => {
        const state = {
          operations: {
            byId: {
              o1: {
                id: "o1",
                operationType: OPERATION_TYPE_STACK,
                columnIds: ["c5", "c6"],
                childIds: ["t1", "t2"],
              },
            },
            allIds: ["o1"],
          },
          tables: {
            byId: {
              t1: { id: "t1", columnIds: ["c1", "c2"] },
              t2: { id: "t2", columnIds: ["c3", "c4"] },
            },
            allIds: ["t1", "t2"],
          },
          columns: {
            byId: {
              c1: { id: "c1" },
              c2: { id: "c2" },
              c3: { id: "c3" },
              c4: { id: "c4" },
              c5: { id: "c5" },
              c6: { id: "c6" },
            },
            allIds: ["c1", "c2", "c3", "c4", "c5", "c6"],
          },
        };
        const action = insertColumnsRequest([
          {
            parentId: "o1",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
        ]);
        const expectedArguments = [
          {
            parentId: "o1",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
          {
            parentId: "t1",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
          {
            parentId: "t2",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
        ];

        await expectSaga(createColumnsWatcher)
          .withState(state)
          .provide([[matchers.call.fn(createColumnsWorker), undefined]])
          .call(createColumnsWorker, expectedArguments, true)
          .dispatch(action)
          .run();
      });
    });

    describe("parent object is a PACK operation", () => {
      const state = {
        operations: {
          byId: {
            o1: {
              id: "o1",
              operationType: OPERATION_TYPE_PACK,
              columnIds: ["c5", "c6", "c7", "c8"],
              childIds: ["t1", "t2"],
            },
          },
          allIds: ["o1"],
        },
        tables: {
          byId: {
            t1: { id: "t1", columnIds: ["c1", "c2"] },
            t2: { id: "t2", columnIds: ["c3", "c4"] },
          },
          allIds: ["t1", "t2"],
        },
        columns: {
          byId: {
            c1: { id: "c1" },
            c2: { id: "c2" },
            c3: { id: "c3" },
            c4: { id: "c4" },
            c5: { id: "c5" },
            c6: { id: "c6" },
            c7: { id: "c7" },
            c8: { id: "c8" },
          },
          allIds: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
        },
      };
      it("calls createColumnsWorker with correct arguments in left table", async () => {
        const action = insertColumnsRequest([
          {
            parentId: "o1",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
        ]);
        const expectedArguments = [
          action.payload[0],
          {
            parentId: "t1",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
        ];
        await expectSaga(createColumnsWatcher)
          .withState(state)
          .provide([[matchers.call.fn(createColumnsWorker), undefined]])
          .call(createColumnsWorker, expectedArguments, true)
          .dispatch(action)
          .run();
      });

      it("calls createColumnsWorker with correct arguments in right table", async () => {
        const action = insertColumnsRequest([
          {
            parentId: "o1",
            index: 3,
            name: "foo",
            fillValue: "bar",
          },
        ]);
        const expectedArguments = [
          action.payload[0],
          {
            parentId: "t2",
            index: 1,
            name: "foo",
            fillValue: "bar",
          },
        ];

        await expectSaga(createColumnsWatcher)
          .withState(state)
          .provide([[matchers.call.fn(createColumnsWorker), undefined]])
          .call(createColumnsWorker, expectedArguments, true)
          .dispatch(action)
          .run();
      });
    });
  });

  describe("handling createColumnsRequest actions", () => {
    it("calls createColumnsWorker with correct arguments", async () => {
      const state = {};
      const action = createColumnsRequest([
        {
          parentId: "t1",
          index: 0,
        },
        {
          parentId: "t1",
          index: 1,
        },
      ]);
      const expectedArguments = action.payload;
      await expectSaga(createColumnsWatcher)
        .withState(state)
        .provide([[matchers.call.fn(createColumnsWorker), undefined]])
        .call(createColumnsWorker, expectedArguments, false)
        .dispatch(action)
        .run();
    });
  });

  describe("handling createTablesSuccess actions", () => {
    it("calls createColumnsWorker with correct arguments", async () => {
      const state = {
        tables: {
          byId: {
            t1: {
              id: "t1",
              name: "Table 1",
              databaseName: "db_table_1",
              columnCount: 2,
              columnIds: new Array(2),
            },
          },
          allIds: ["t1"],
        },
        columns: {
          byId: {},
          allIds: [],
        },
        operations: { byId: {}, allIds: [] },
      };
      const action = createTablesSuccess([state.tables.byId["t1"]]);
      const expectedArguments = [
        { parentId: "t1", index: 0, name: "bar", databaseName: "bar" },
        { parentId: "t1", index: 1, name: "foo", databaseName: "foo" },
      ];
      await expectSaga(createColumnsWatcher)
        .withState(state)
        .provide([
          [matchers.call.fn(createColumnsWorker), undefined],
          [matchers.call.fn(getTableColumnNames), ["bar", "foo"]],
        ])
        .call(getTableColumnNames, "db_table_1")
        .call(createColumnsWorker, expectedArguments, false)
        .dispatch(action)
        .run();
    });
  });

  describe("handling updateOperationsSuccess actions", () => {
    const state = {
      operations: {
        byId: {
          o1: {
            id: "o1",
            operationType: OPERATION_TYPE_STACK,
            columnCount: 2,
            isMaterialized: true,
            columnIds: [],
            childIds: ["t1", "t2"],
          },
        },
        allIds: ["o1"],
      },
      tables: {
        byId: {
          t1: { id: "t1", columnIds: ["c1", "c2"] },
          t2: { id: "t2", columnIds: ["c3", "c4"] },
        },
        allIds: ["t1", "t2"],
      },
      columns: {
        byId: {
          c1: { id: "c1" },
          c2: { id: "c2" },
          c3: { id: "c3" },
          c4: { id: "c4" },
        },
        allIds: ["c1", "c2", "c3", "c4"],
      },
    };
    it("calls createColumnsWorker with correct arguments if `isMaterialized` is true", async () => {
      const action = updateOperationsSuccess([
        { id: "o1", isMaterialized: true },
      ]);
      const expectedArguments = [
        { parentId: "o1", index: 0, name: "foo", databaseName: "foo" },
        { parentId: "o1", index: 1, name: "bar", databaseName: "bar" },
      ];
      await expectSaga(createColumnsWatcher)
        .withState({ ...state })
        .provide([
          [matchers.call.fn(createColumnsWorker), undefined],
          [matchers.call.fn(getTableColumnNames), ["foo", "bar"]],
        ])
        .call(createColumnsWorker, expectedArguments, false)
        .dispatch(action)
        .run();
    });
    it("does not call createColumnsWorker if `isMaterialized` is false", async () => {
      const action = updateOperationsSuccess([
        { id: "o1", isMaterialized: false },
      ]);
      await expectSaga(createColumnsWatcher)
        .withState({
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: {
                ...state.operations.byId.o1,
                isMaterialized: false,
              },
            },
          },
        })
        .provide([[matchers.call.fn(createColumnsWorker), undefined]])
        .not.call.fn(createColumnsWorker)
        .dispatch(action)
        .run();
    });
    it("does not call createColumnsWorker if a different property has changed", async () => {
      const action = updateOperationsSuccess([
        { id: "o1", name: "New Operation Name" },
      ]);
      await expectSaga(createColumnsWatcher)
        .withState({
          ...state,
        })
        .provide([[matchers.call.fn(createColumnsWorker), undefined]])
        .not.call.fn(createColumnsWorker)
        .dispatch(action)
        .run();
    });
  });
});
