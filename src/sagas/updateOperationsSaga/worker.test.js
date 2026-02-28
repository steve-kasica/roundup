import { describe, it, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import updateOperationsWorker from "./worker";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  updateOperations,
} from "../../slices/operationsSlice";
import {
  createPackView,
  createStackView,
  getTableDimensions,
  calcMatchStats,
} from "../../lib/duckdb";
import { updateOperationsSuccess } from "./actions";

vi.mock("../../lib/duckdb", () => ({
  createStackView: vi.fn(() => Promise.resolve()),
  createPackView: vi.fn(() => Promise.resolve()),
  getTableDimensions: vi.fn(() =>
    Promise.resolve({ rowCount: 100, columnCount: 5 }),
  ),
  calcMatchStats: vi.fn(() => Promise.resolve({})),
}));

describe("updateOperationsWorker saga", () => {
  describe("Updating any operations", () => {
    let state = {
      operations: {
        byId: {
          o1: {
            id: "o1",
            operationType: OPERATION_TYPE_PACK,
            databaseName: "pack_view",
            childIds: ["t1", "t2"],
            columnIds: [],
            joinKey1: "c1",
            joinKey2: "c3",
            joinPredicate: "EQUALS",
            isMaterialized: false,
          },
        },
        allIds: ["o1"],
      },
      tables: {
        byId: {
          t1: { id: "t1", databaseName: "table1", columnIds: ["c1", "c2"] },
          t2: { id: "t2", databaseName: "table2", columnIds: ["c3", "c4"] },
        },
        allIds: ["t1", "t2"],
      },
      columns: {
        byId: {
          c1: { id: "c1", databaseName: "col1" },
          c2: { id: "c2", databaseName: "col2" },
          c3: { id: "c3", databaseName: "col3" },
          c4: { id: "c4", databaseName: "col4" },
        },
        allIds: ["c1", "c2", "c3", "c4"],
      },
    };
    describe("Updating name", () => {
      const operationUpdates = [{ id: "o1", name: "Updated Operation" }];
      it("dispatches updateOperations and updateOperationsSuccess actions", async () => {
        await expectSaga(updateOperationsWorker, operationUpdates)
          .withState(state)
          .not.call(createPackView)
          .not.call(createStackView)
          .not.call(getTableDimensions)
          .put(updateOperations(operationUpdates))
          .put(updateOperationsSuccess(operationUpdates))
          .run();
      });
    });
  });

  describe("Updating pack operations", () => {
    let state = {
      operations: {
        byId: {
          o1: {
            id: "o1",
            operationType: OPERATION_TYPE_PACK,
            databaseName: "pack_view",
            childIds: ["t1", "t2"],
            columnIds: [],
            joinKey1: "c1",
            joinKey2: "c3",
            joinPredicate: "EQUALS",
            isMaterialized: false,
          },
        },
        allIds: ["o1"],
      },
      tables: {
        byId: {
          t1: { id: "t1", databaseName: "table1", columnIds: ["c1", "c2"] },
          t2: { id: "t2", databaseName: "table2", columnIds: ["c3", "c4"] },
        },
        allIds: ["t1", "t2"],
      },
      columns: {
        byId: {
          c1: { id: "c1", databaseName: "col1" },
          c2: { id: "c2", databaseName: "col2" },
          c3: { id: "c3", databaseName: "col3" },
          c4: { id: "c4", databaseName: "col4" },
        },
        allIds: ["c1", "c2", "c3", "c4"],
      },
    };

    it("correctly handles materialization", async () => {
      const operationUpdates = [{ id: "o1", isMaterialized: null }];
      const queryData = {
        viewName: "pack_view",
        columnNames: [],
        leftKey: "col1",
        rightKey: "col3",
        joinType: undefined,
        joinPredicate: "EQUALS",
        children: [
          { tableName: "table1", columnNames: ["col1", "col2"] },
          { tableName: "table2", columnNames: ["col3", "col4"] },
        ],
      };
      await expectSaga(updateOperationsWorker, operationUpdates)
        .withState(state)
        .call(createPackView, queryData)
        .call(getTableDimensions, "pack_view")
        .put(updateOperations(operationUpdates))
        .put(updateOperationsSuccess(operationUpdates))
        .run();
    });

    describe("Match stats update", () => {
      it("handles matchStats calculation", async () => {
        const operationUpdates = [{ id: "o1", matchStats: {} }];
        await expectSaga(updateOperationsWorker, operationUpdates)
          .withState(state)
          .call(calcMatchStats, "table1", "table2", "col1", "col3", "EQUALS")
          .put(updateOperations(operationUpdates))
          .put(updateOperationsSuccess(operationUpdates))
          .run();
      });
      it("handles with joinPredicate update", async () => {
        const operationUpdates = [
          { id: "o1", joinPredicate: "INNER", matchStats: {} },
        ];
        await expectSaga(updateOperationsWorker, operationUpdates)
          .withState(state)
          .call(calcMatchStats, "table1", "table2", "col1", "col3", "INNER")
          .put(updateOperations(operationUpdates))
          .put(updateOperationsSuccess(operationUpdates))
          .run();
      });
      it("handles with left joinKey update", async () => {
        const operationUpdates = [{ id: "o1", joinKey1: "c2", matchStats: {} }];
        await expectSaga(updateOperationsWorker, operationUpdates)
          .withState(state)
          .call(calcMatchStats, "table1", "table2", "col2", "col3", "EQUALS")
          .put(updateOperations(operationUpdates))
          .put(updateOperationsSuccess(operationUpdates))
          .run();
      });
      it("handles with right joinKey update", async () => {
        const operationUpdates = [{ id: "o1", joinKey2: "c4", matchStats: {} }];
        await expectSaga(updateOperationsWorker, operationUpdates)
          .withState(state)
          .call(calcMatchStats, "table1", "table2", "col1", "col4", "EQUALS")
          .put(updateOperations(operationUpdates))
          .put(updateOperationsSuccess(operationUpdates))
          .run();
      });
      it("handles with childIds update", async () => {
        const operationUpdates = [
          {
            id: "o1",
            childIds: ["t2", "t1"],
            joinKey1: "c3",
            joinKey2: "c1",
            matchStats: {},
          },
        ];
        await expectSaga(updateOperationsWorker, operationUpdates)
          .withState(state)
          .call(calcMatchStats, "table2", "table1", "col3", "col1", "EQUALS")
          .put(updateOperations(operationUpdates))
          .put(updateOperationsSuccess(operationUpdates))
          .run();
      });
    });
  });

  describe("Updating stack operations", () => {
    let state = {
      operations: {
        byId: {
          o1: {
            id: "o1",
            operationType: OPERATION_TYPE_STACK,
            databaseName: "stack_view",
            childIds: ["t1", "t2"],
            columnIds: [],
            isMaterialized: false,
          },
        },
        allIds: ["o1"],
      },
      tables: {
        byId: {
          t1: { id: "t1", databaseName: "table1", columnIds: ["c1", "c2"] },
          t2: { id: "t2", databaseName: "table2", columnIds: ["c3", "c4"] },
        },
        allIds: ["t1", "t2"],
      },
      columns: {
        byId: {
          c1: { id: "c1", databaseName: "col1" },
          c2: { id: "c2", databaseName: "col2" },
          c3: { id: "c3", databaseName: "col3" },
          c4: { id: "c4", databaseName: "col4" },
        },
        allIds: ["c1", "c2", "c3", "c4"],
      },
    };

    it("correctly handles materialization", async () => {
      const operationUpdates = [{ id: "o1", isMaterialized: null }];
      const queryData = {
        viewName: "stack_view",
        columnNames: [],
        children: [
          { tableName: "table1", columnNames: ["col1", "col2"] },
          { tableName: "table2", columnNames: ["col3", "col4"] },
        ],
      };
      await expectSaga(updateOperationsWorker, operationUpdates)
        .withState(state)
        .call(createStackView, queryData)
        .call(getTableDimensions, "stack_view")
        .put(updateOperations(operationUpdates))
        .put(updateOperationsSuccess(operationUpdates))
        .run();
    });
  });

  // describe("updating operation type or join settings", () => {
  //   it("marks operation out-of-sync when operationType changes", async () => {
  //     const action = {
  //       payload: {
  //         operationUpdates: [
  //           { id: "o_1", operationType: OPERATION_TYPE_STACK },
  //         ],
  //       },
  //     };

  //     const mockState = createMockState({
  //       o_1: {
  //         id: "o_1",
  //         operationType: OPERATION_TYPE_PACK,
  //         isInSync: true,
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWorker, action)
  //       .withState(mockState)
  //       .run();

  //     const updateOperationsAction = effects.put.find(
  //       (effect) => effect.payload.action.type === updateOperationsSlice.type,
  //     );
  //     expect(updateOperationsAction).toBeDefined();
  //   });

  //   it("marks operation out-of-sync when joinType changes", async () => {
  //     const action = {
  //       payload: {
  //         operationUpdates: [{ id: "o_1", joinType: "INNER" }],
  //       },
  //     };

  //     const mockState = createMockState({
  //       o_1: {
  //         id: "o_1",
  //         operationType: OPERATION_TYPE_PACK,
  //         joinType: "FULL OUTER",
  //         isInSync: true,
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWorker, action)
  //       .withState(mockState)
  //       .run();

  //     const successAction = effects.put.find(
  //       (effect) => effect.payload.action.type === updateOperationsSuccess.type,
  //     );
  //     expect(successAction).toBeDefined();
  //   });
  // });

  // describe("calculating match stats", () => {
  //   it("adds and removes loading state while calculating matchStats", async () => {
  //     const action = {
  //       payload: {
  //         operationUpdates: [{ id: "o_1", matchStats: {} }],
  //       },
  //     };

  //     const mockState = createMockState(
  //       {
  //         o_1: {
  //           id: "o_1",
  //           operationType: OPERATION_TYPE_PACK,
  //           childIds: ["t_1", "t_2"],
  //           joinKey1: "c_1",
  //           joinKey2: "c_2",
  //           joinPredicate: "EQUALS",
  //         },
  //       },
  //       {
  //         t_1: { id: "t_1", databaseName: "left_table" },
  //         t_2: { id: "t_2", databaseName: "right_table" },
  //       },
  //       {
  //         c_1: { id: "c_1", databaseName: "left_col" },
  //         c_2: { id: "c_2", databaseName: "right_col" },
  //       },
  //     );

  //     const mockMatchStats = {
  //       matches: 50,
  //       left_unmatched: 10,
  //       right_unmatched: 5,
  //     };

  //     const { effects } = await expectSaga(updateOperationsWorker, action)
  //       .withState(mockState)
  //       .provide([[matchers.call.fn(calcMatchStats), mockMatchStats]])
  //       .run();

  //     // Should add to loading operations
  //     const addLoadingAction = effects.put.find(
  //       (effect) => effect.payload.action.type === addToLoadingOperations.type,
  //     );
  //     expect(addLoadingAction).toBeDefined();

  //     // Should remove from loading operations
  //     const removeLoadingAction = effects.put.find(
  //       (effect) =>
  //         effect.payload.action.type === removeFromLoadingOperations.type,
  //     );
  //     expect(removeLoadingAction).toBeDefined();
  //   });
  // });

  // describe("updating multiple operations", () => {
  //   it("handles multiple operation updates in single call", async () => {
  //     const action = {
  //       payload: {
  //         operationUpdates: [
  //           { id: "o_1", name: "New Name 1" },
  //           { id: "o_2", name: "New Name 2" },
  //         ],
  //       },
  //     };

  //     const mockState = createMockState({
  //       o_1: { id: "o_1", name: "Old Name 1" },
  //       o_2: { id: "o_2", name: "Old Name 2" },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWorker, action)
  //       .withState(mockState)
  //       .run();

  //     const successAction = effects.put.find(
  //       (effect) => effect.payload.action.type === updateOperationsSuccess.type,
  //     );
  //     expect(successAction).toBeDefined();
  //     expect(
  //       Object.keys(successAction.payload.action.payload.changedPropertiesById),
  //     ).toHaveLength(2);
  //   });
  // });

  // describe("success action payload", () => {
  //   it("includes changedPropertiesById in success payload", async () => {
  //     const action = {
  //       payload: {
  //         operationUpdates: [
  //           { id: "o_1", name: "New Name", joinType: "INNER" },
  //         ],
  //       },
  //     };

  //     const mockState = createMockState({
  //       o_1: {
  //         id: "o_1",
  //         name: "Old Name",
  //         joinType: "FULL OUTER",
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWorker, action)
  //       .withState(mockState)
  //       .run();

  //     const successAction = effects.put.find(
  //       (effect) => effect.payload.action.type === updateOperationsSuccess.type,
  //     );
  //     expect(successAction).toBeDefined();
  //     expect(
  //       successAction.payload.action.payload.changedPropertiesById["o_1"],
  //     ).toContain("name");
  //     expect(
  //       successAction.payload.action.payload.changedPropertiesById["o_1"],
  //     ).toContain("joinType");
  //   });
  // });
});
