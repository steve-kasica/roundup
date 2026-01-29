import { describe, it, expect, beforeEach } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateOperationsWatcher from "./watcher";
import updateOperationsWorker from "./worker";
import { updateOperationsRequest, updateOperationsSuccess } from "./actions";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { updateTablesSuccess } from "../updateTablesSaga";
import {
  Operation,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
  DEFAULT_JOIN_TYPE,
  DEFAULT_JOIN_PREDICATE,
} from "../../slices/operationsSlice";
import { Table, selectTablesById } from "../../slices/tablesSlice";
import { Column } from "../../slices/columnsSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";

describe("updateOperationsSaga watcher", () => {
  let state, action;
  // beforeEach(() => {
  //   state = {
  //     operations: {
  //       byId: {
  //         [stackOp.id]: stackOp,
  //         [packOp.id]: packOp,
  //       },
  //       allIds: [stackOp.id, packOp.id],
  //     },
  //     ui: { focusedOperationId: null },
  //   };
  // });
  state = {
    operations: {
      byId: {
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t1", "t2"],
        },
      },
      allIds: ["o1"],
    },
    tables: {
      byId: {
        t1: {
          id: "t1",
          parentId: "o1",
          name: "Table 1",
        },
        t2: {
          id: "t2",
          parentId: "o1",
          name: "Table 2",
        },
        t3: {
          id: "t3",
          parentId: null,
          name: "Table 3",
        },
      },
      allIds: ["t1", "t2", "t3"],
    },
  };
  describe("handling updateOperationsRequest actions", () => {
    it("should call worker saga with correct payload", async () => {
      action = updateOperationsRequest([{ id: "o1", name: "stack" }]);

      await expectSaga(updateOperationsWatcher)
        .withState(state)
        .dispatch(action)
        .call(updateOperationsWorker, action.payload)
        .run();
    });
  });

  describe("handling deleteTablesSuccess actions", async () => {
    action = deleteTablesSuccess([
      { id: "t1", name: "Table 1", parentId: "o1" },
    ]);
    it.skip("should call worker saga with correct payload", async () => {
      await expectSaga(updateOperationsWatcher)
        .withState(state)
        .dispatch(action)
        .call(updateOperationsWorker, [
          {
            id: "o1",
            childIds: ["t2"],
          },
        ])
        .run();
    });
  });

  describe("handling createOperationsSuccess actions", () => {
    const localState = {
      ...state,
      operations: {
        byId: {
          ...state.operations.byId,
          o2: {
            id: "o2",
            operationType: OPERATION_TYPE_PACK,
            childIds: ["o1", "t3"],
          },
        },
        allIds: [...state.operations.allIds, "o2"],
      },
    };
    action = createOperationsSuccess([localState.operations.byId.o2]);
    it.skip("should call worker saga with correct payload", async () => {
      await expectSaga(updateOperationsWatcher)
        .withState(localState)
        .dispatch(action)
        // .call(selectOperationsById, "o1")
        .call(updateOperationsWorker, [
          {
            id: "o1",
            parentId: "o2",
          },
        ])
        .run();
    });
  });

  // describe("handling updateTablesSuccess actions", () => {
  //   let state, columns, parentOp, table;
  //   beforeEach(() => {
  //     columns = Array.from({ length: 4 }, () => Column({ parentId: null }));
  //     parentOp = Operation({
  //       columnIds: [columns[0].id, columns[1].id],
  //     });

  //     table = Table({
  //       parentId: parentOp.id,
  //       columnIds: [columns[2].id, columns[3].id],
  //     });
  //     parentOp.childIds = [table.id];
  //     columns[0].parentId = parentOp.id;
  //     columns[1].parentId = parentOp.id;
  //     columns[2].parentId = table.id;
  //     columns[3].parentId = table.id;
  //     state = {
  //       ui: { focusedOperationId: null },
  //       columns: {
  //         byId: columns.reduce((acc, col) => ({ ...acc, [col.id]: col }), {}),
  //       },
  //       operations: { byId: { [parentOp.id]: parentOp } },
  //       tables: { byId: { [table.id]: table } },
  //     };
  //   });

  //   it("should dispatch parent rematerialization request on columnIds updated", async () => {
  //     const action = updateTablesSuccess({
  //       changedPropertiesById: {
  //         [table.id]: ["columnIds"],
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWatcher)
  //       .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
  //       .withState(state)
  //       .dispatch(action)
  //       .silentRun(100);

  //     // Find the updateOperationsRequest dispatched by the watcher's handleRematerializations
  //     const rematerializationRequests = effects.put.filter(
  //       (effect) =>
  //         effect.payload?.action?.type === updateOperationsRequest.type,
  //     );

  //     // Should have dispatched updateOperationsRequest for the parent
  //     expect(rematerializationRequests.length).toBeGreaterThanOrEqual(1);
  //     const firstRequest = rematerializationRequests[0].payload.action.payload;
  //     expect(firstRequest.operationUpdates).toHaveLength(1);
  //     expect(firstRequest.operationUpdates[0].id).toBe(parentOp.id);
  //     expect(
  //       Object.prototype.hasOwnProperty.call(
  //         firstRequest.operationUpdates[0],
  //         "isMaterialized",
  //       ),
  //     ).toBe(true);
  //   });

  //   it("should not dispatch rematerialization when table properties other than columnIds change", async () => {
  //     const action = updateTablesSuccess({
  //       changedPropertiesById: {
  //         [table.id]: ["name"],
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWatcher)
  //       .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
  //       .withState(state)
  //       .dispatch(action)
  //       .silentRun(100);

  //     const updateRequests =
  //       effects.put?.filter(
  //         (effect) =>
  //           effect.payload?.action?.type === updateOperationsRequest.type,
  //       ) || [];

  //     // Should not trigger rematerialization
  //     expect(updateRequests).toHaveLength(0);
  //   });

  //   it("should not dispatch rematerialization when table has no parent", async () => {
  //     const table = Table();

  //     const action = updateTablesSuccess({
  //       changedPropertiesById: {
  //         [table.id]: ["columnIds"],
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWatcher)
  //       .provide([
  //         [matchers.select.selector(selectTablesById), table],
  //         [matchers.call.fn(updateOperationsWorker), undefined],
  //       ])
  //       .withState({
  //         ui: { focusedOperationId: null },
  //         operations: state.operations,
  //         columns: state.columns,
  //         tables: { byId: { ...state.tables.byId, [table.id]: table } },
  //       })
  //       .dispatch(action)
  //       .silentRun(100);

  //     const updateRequests =
  //       effects.put?.filter(
  //         (effect) =>
  //           effect.payload?.action?.type === updateOperationsRequest.type,
  //       ) || [];

  //     // Should not trigger rematerialization for orphan tables
  //     expect(updateRequests).toHaveLength(0);
  //   });
  // });

  // describe("handling updateOperationsSuccess actions", () => {
  //   let state, columns, operations, tables;
  //   beforeEach(() => {
  //     operations = Array.from({ length: 2 }, () => Operation());
  //     tables = Array.from({ length: 3 }, () => Table());
  //     columns = Array.from({ length: 10 }, () => Column({ parentId: null }));

  //     // Define parent --> column relationships
  //     operations[0].columnIds = [columns[0].id, columns[1].id];
  //     operations[1].columnIds = [columns[2].id, columns[3].id];
  //     tables[0].columnIds = [columns[4].id, columns[5].id];
  //     tables[1].columnIds = [columns[6].id, columns[7].id];
  //     tables[2].columnIds = [columns[8].id, columns[9].id];

  //     // Define column --> parent relationships
  //     columns[0].parentId = operations[0].id;
  //     columns[1].parentId = operations[0].id;
  //     columns[2].parentId = operations[1].id;
  //     columns[3].parentId = operations[1].id;
  //     columns[4].parentId = tables[0].id;
  //     columns[5].parentId = tables[0].id;
  //     columns[6].parentId = tables[1].id;
  //     columns[7].parentId = tables[1].id;
  //     columns[8].parentId = tables[2].id;
  //     columns[9].parentId = tables[2].id;

  //     // Define parent operation --> child table/operation relationships
  //     operations[0].childIds = [tables[0].id, tables[1].id];
  //     operations[1].childIds = [operations[0].id, tables[2].id];

  //     // Define table/operation --> operation relationships
  //     operations[0].parentId = operations[1].id;
  //     tables[0].parentId = operations[0].id;
  //     tables[1].parentId = operations[0].id;
  //     tables[2].parentId = operations[1].id;

  //     state = {
  //       ui: { focusedOperationId: null },
  //       columns: {
  //         byId: columns.reduce((acc, col) => ({ ...acc, [col.id]: col }), {}),
  //       },
  //       operations: {
  //         byId: operations.reduce((acc, op) => ({ ...acc, [op.id]: op }), {}),
  //       },
  //       tables: {
  //         byId: tables.reduce(
  //           (acc, table) => ({ ...acc, [table.id]: table }),
  //           {},
  //         ),
  //       },
  //     };
  //   });

  //   it("should dispatch parent rematerialization request on columnIds update", async () => {
  //     const action = updateOperationsSuccess({
  //       changedPropertiesById: {
  //         [operations[0].id]: ["columnIds"],
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWatcher)
  //       .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
  //       .withState(state)
  //       .dispatch(action)
  //       .silentRun(100);

  //     const rematerializationRequests =
  //       effects.put?.filter(
  //         (effect) =>
  //           effect.payload?.action?.type === updateOperationsRequest.type,
  //       ) || [];

  //     expect(rematerializationRequests.length).toBeGreaterThanOrEqual(1);
  //     const firstRequest = rematerializationRequests[0].payload.action.payload;
  //     expect(firstRequest.operationUpdates[0].id).toBe(operations[1].id);
  //     expect(
  //       Object.prototype.hasOwnProperty.call(
  //         firstRequest.operationUpdates[0],
  //         "isMaterialized",
  //       ),
  //     ).toBe(true);
  //   });

  //   it("should dispatch rematerialization request on parent when child operation's childIds is updated", async () => {
  //     const action = updateOperationsSuccess({
  //       changedPropertiesById: {
  //         [operations[0].id]: ["childIds"],
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWatcher)
  //       .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
  //       .withState(state)
  //       .dispatch(action)
  //       .silentRun(100);

  //     const rematerializationRequests =
  //       effects.put?.filter(
  //         (effect) =>
  //           effect.payload?.action?.type === updateOperationsRequest.type,
  //       ) || [];

  //     expect(rematerializationRequests.length).toBeGreaterThanOrEqual(1);
  //     const firstRequest = rematerializationRequests[0].payload.action.payload;
  //     expect(firstRequest.operationUpdates[0].id).toBe(operations[1].id);
  //     expect(
  //       Object.prototype.hasOwnProperty.call(
  //         firstRequest.operationUpdates[0],
  //         "isMaterialized",
  //       ),
  //     ).toBe(true);
  //   });

  //   it("should not dispatch rematerialization when operation properties other than columnIds/childIds change", async () => {
  //     const action = updateOperationsSuccess({
  //       changedPropertiesById: {
  //         [operations[0].id]: ["name"],
  //       },
  //     });

  //     const { effects } = await expectSaga(updateOperationsWatcher)
  //       .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
  //       .withState(state)
  //       .dispatch(action)
  //       .silentRun(100);

  //     const rematerializationRequests =
  //       effects.put?.filter(
  //         (effect) =>
  //           effect.payload?.action?.type === updateOperationsRequest.type,
  //       ) || [];

  //     // Should not trigger rematerialization for orphan tables
  //     expect(rematerializationRequests).toHaveLength(0);
  //   });
  // });

  // describe("handling deleteTablesSuccess actions", () => {
  //   let state, table1, table2, table3, parentOp, result;
  //   beforeEach(async () => {
  //     table1 = Table();
  //     table2 = Table();
  //     table3 = Table();
  //     parentOp = Operation({
  //       childIds: [table1.id, table2.id, table3.id],
  //     });
  //     table1.parentId = parentOp.id;
  //     table2.parentId = parentOp.id;
  //     table3.parentId = parentOp.id;

  //     state = {
  //       ui: { focusedOperationId: null },
  //       operations: {
  //         byId: { [parentOp.id]: parentOp },
  //       },
  //       tables: {
  //         byId: {
  //           [table1.id]: table1,
  //           [table2.id]: table2,
  //           [table3.id]: table3,
  //         },
  //       },
  //     };
  //     const action = deleteTablesSuccess({
  //       tableIds: [table1.id, table2.id],
  //     });

  //     result = await expectSaga(updateOperationsWatcher)
  //       .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
  //       .withState(state)
  //       .dispatch(action)
  //       .silentRun(100);
  //   });

  //   it("should dispatch a updateOperationsRequest", async () => {
  //     const { effects } = result;
  //     const updateOperationsRequests =
  //       effects.put?.filter(
  //         (effect) =>
  //           effect.payload?.action?.type === updateOperationsRequest.type,
  //       ) || [];
  //     expect(updateOperationsRequests).toHaveLength(1);
  //     const firstRequest = updateOperationsRequests[0].payload.action.payload;
  //     expect(firstRequest.operationUpdates).toHaveLength(1);
  //     expect(firstRequest.operationUpdates[0].id).toBe(parentOp.id);
  //     expect(firstRequest.operationUpdates[0].childIds).toEqual([table3.id]);
  //   });
  // });
});
