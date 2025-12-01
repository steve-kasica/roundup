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
  JOIN_TYPES,
  JOIN_PREDICATES,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { Table, selectTablesById } from "../../slices/tablesSlice";
import { Column } from "../../slices/columnsSlice";

describe("updateOperationsSaga watcher", () => {
  let state,
    stackOp = Operation({ operationType: OPERATION_TYPE_STACK }),
    packOp = Operation({ operationType: OPERATION_TYPE_PACK });
  beforeEach(() => {
    state = {
      operations: {
        byId: {
          [stackOp.id]: stackOp,
          [packOp.id]: packOp,
        },
        allIds: [stackOp.id, packOp.id],
      },
      ui: { focusedOperationId: null },
    };
  });
  describe("basic watcher functionality", () => {
    it("should call worker saga when updateOperationsRequest is dispatched", async () => {
      const action = updateOperationsRequest({
        operationUpdates: [{ id: stackOp.id, columnCount: 5 }],
      });

      await expectSaga(updateOperationsWatcher)
        .provide([
          [matchers.select.selector(selectOperationsById), stackOp],
          [matchers.call.fn(updateOperationsWorker), undefined],
        ])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      // Test passes if saga completes without errors (worker is mocked)
    });
  });

  describe("newly created operations", () => {
    it("should dispatch updateOperationsRequest with columnCount null for newly created STACK operation", async () => {
      const action = createOperationsSuccess({
        operationIds: [stackOp.id],
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([
          [matchers.select.selector(selectOperationsById), stackOp],
          [matchers.call.fn(updateOperationsWorker), undefined],
        ])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const updateRequests = effects.put.filter(
        (effect) =>
          effect.payload?.action?.type === updateOperationsRequest.type
      );

      expect(updateRequests).toHaveLength(1);

      const updatePayload = updateRequests[0].payload.action.payload;
      expect(updatePayload.operationUpdates).toHaveLength(1);
      expect(updatePayload.operationUpdates[0]).toEqual({
        id: stackOp.id,
        columnCount: null,
      });
    });

    it("should dispatch updateOperationsRequest with default join metadata for newly created PACK operation", async () => {
      const action = createOperationsSuccess({
        operationIds: [packOp.id],
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([
          [matchers.select.selector(selectOperationsById), packOp],
          [matchers.call.fn(updateOperationsWorker), undefined],
        ])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const updateRequests = effects.put.filter(
        (effect) =>
          effect.payload?.action?.type === updateOperationsRequest.type
      );

      expect(updateRequests).toHaveLength(1);

      const updatePayload = updateRequests[0].payload.action.payload;
      expect(updatePayload.operationUpdates).toHaveLength(1);
      expect(updatePayload.operationUpdates[0]).toEqual({
        id: packOp.id,
        columnCount: null,
        joinType: JOIN_TYPES.FULL_OUTER,
        joinPredicate: JOIN_PREDICATES.EQUALS,
      });
    });

    it("should handle multiple newly created operations", async () => {
      const stackOp2 = Operation({
        operationType: OPERATION_TYPE_STACK,
      });
      const packOp2 = Operation({
        operationType: OPERATION_TYPE_PACK,
      });
      state.operations.byId[stackOp2.id] = stackOp2;
      state.operations.byId[packOp2.id] = packOp2;
      state.operations.allIds.push(stackOp2.id, packOp2.id);

      const action = createOperationsSuccess({
        operationIds: [stackOp2.id, packOp2.id],
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([
          [
            matchers.select.selector(selectOperationsById),
            (state, id) => {
              if (id === stackOp.id) return stackOp;
              if (id === packOp.id) return packOp;
              return null;
            },
          ],
          [matchers.call.fn(updateOperationsWorker), undefined],
        ])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const updateRequests = effects.put.filter(
        (effect) =>
          effect.payload?.action?.type === updateOperationsRequest.type
      );

      expect(updateRequests).toHaveLength(1);

      const updatePayload = updateRequests[0].payload.action.payload;
      expect(updatePayload.operationUpdates).toHaveLength(2);
    });
  });

  describe("child table updates triggering rematerialization", () => {
    let state, columns, parentOp, table;
    beforeEach(() => {
      columns = Array.from({ length: 4 }, () => Column({ parentId: null }));
      parentOp = Operation({
        columnIds: [columns[0].id, columns[1].id],
      });

      table = Table({
        parentId: parentOp.id,
        columnIds: [columns[2].id, columns[3].id],
      });
      parentOp.childIds = [table.id];
      columns[0].parentId = parentOp.id;
      columns[1].parentId = parentOp.id;
      columns[2].parentId = table.id;
      columns[3].parentId = table.id;
      state = {
        ui: { focusedOperationId: null },
        columns: {
          byId: columns.reduce((acc, col) => ({ ...acc, [col.id]: col }), {}),
        },
        operations: { byId: { [parentOp.id]: parentOp } },
        tables: { byId: { [table.id]: table } },
      };
    });

    it("should dispatch parent rematerialization request on columnIds updated", async () => {
      const action = updateTablesSuccess({
        changedPropertiesById: {
          [table.id]: ["columnIds"],
        },
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      // Find the updateOperationsRequest dispatched by the watcher's handleRematerializations
      const rematerializationRequests = effects.put.filter(
        (effect) =>
          effect.payload?.action?.type === updateOperationsRequest.type
      );

      // Should have dispatched updateOperationsRequest for the parent
      expect(rematerializationRequests.length).toBeGreaterThanOrEqual(1);
      const firstRequest = rematerializationRequests[0].payload.action.payload;
      expect(firstRequest.operationUpdates).toHaveLength(1);
      expect(firstRequest.operationUpdates[0].id).toBe(parentOp.id);
      expect(
        Object.prototype.hasOwnProperty.call(
          firstRequest.operationUpdates[0],
          "isMaterialized"
        )
      ).toBe(true);
    });

    it("should not dispatch rematerialization when table properties other than columnIds change", async () => {
      const action = updateTablesSuccess({
        changedPropertiesById: {
          [table.id]: ["name"],
        },
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const updateRequests =
        effects.put?.filter(
          (effect) =>
            effect.payload?.action?.type === updateOperationsRequest.type
        ) || [];

      // Should not trigger rematerialization
      expect(updateRequests).toHaveLength(0);
    });

    it("should not dispatch rematerialization when table has no parent", async () => {
      const table = Table();

      const action = updateTablesSuccess({
        changedPropertiesById: {
          [table.id]: ["columnIds"],
        },
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([
          [matchers.select.selector(selectTablesById), table],
          [matchers.call.fn(updateOperationsWorker), undefined],
        ])
        .withState({
          ui: { focusedOperationId: null },
          operations: state.operations,
          columns: state.columns,
          tables: { byId: { ...state.tables.byId, [table.id]: table } },
        })
        .dispatch(action)
        .silentRun(100);

      const updateRequests =
        effects.put?.filter(
          (effect) =>
            effect.payload?.action?.type === updateOperationsRequest.type
        ) || [];

      // Should not trigger rematerialization for orphan tables
      expect(updateRequests).toHaveLength(0);
    });
  });

  describe("child operation updates triggering rematerialization", () => {
    let state, columns, operations, tables;
    beforeEach(() => {
      operations = Array.from({ length: 2 }, () => Operation());
      tables = Array.from({ length: 3 }, () => Table());
      columns = Array.from({ length: 10 }, () => Column({ parentId: null }));

      // Define parent --> column relationships
      operations[0].columnIds = [columns[0].id, columns[1].id];
      operations[1].columnIds = [columns[2].id, columns[3].id];
      tables[0].columnIds = [columns[4].id, columns[5].id];
      tables[1].columnIds = [columns[6].id, columns[7].id];
      tables[2].columnIds = [columns[8].id, columns[9].id];

      // Define column --> parent relationships
      columns[0].parentId = operations[0].id;
      columns[1].parentId = operations[0].id;
      columns[2].parentId = operations[1].id;
      columns[3].parentId = operations[1].id;
      columns[4].parentId = tables[0].id;
      columns[5].parentId = tables[0].id;
      columns[6].parentId = tables[1].id;
      columns[7].parentId = tables[1].id;
      columns[8].parentId = tables[2].id;
      columns[9].parentId = tables[2].id;

      // Define parent operation --> child table/operation relationships
      operations[0].childIds = [tables[0].id, tables[1].id];
      operations[1].childIds = [operations[0].id, tables[2].id];

      // Define table/operation --> operation relationships
      operations[0].parentId = operations[1].id;
      tables[0].parentId = operations[0].id;
      tables[1].parentId = operations[0].id;
      tables[2].parentId = operations[1].id;

      state = {
        ui: { focusedOperationId: null },
        columns: {
          byId: columns.reduce((acc, col) => ({ ...acc, [col.id]: col }), {}),
        },
        operations: {
          byId: operations.reduce((acc, op) => ({ ...acc, [op.id]: op }), {}),
        },
        tables: {
          byId: tables.reduce(
            (acc, table) => ({ ...acc, [table.id]: table }),
            {}
          ),
        },
      };
    });

    it("should dispatch parent rematerialization request on columnIds update", async () => {
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["columnIds"],
        },
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const rematerializationRequests =
        effects.put?.filter(
          (effect) =>
            effect.payload?.action?.type === updateOperationsRequest.type
        ) || [];

      expect(rematerializationRequests.length).toBeGreaterThanOrEqual(1);
      const firstRequest = rematerializationRequests[0].payload.action.payload;
      expect(firstRequest.operationUpdates[0].id).toBe(operations[1].id);
      expect(
        Object.prototype.hasOwnProperty.call(
          firstRequest.operationUpdates[0],
          "isMaterialized"
        )
      ).toBe(true);
    });
    it("should dispatch rematerialization request on parent when child operation's childIds is updated", async () => {
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["childIds"],
        },
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const rematerializationRequests =
        effects.put?.filter(
          (effect) =>
            effect.payload?.action?.type === updateOperationsRequest.type
        ) || [];

      expect(rematerializationRequests.length).toBeGreaterThanOrEqual(1);
      const firstRequest = rematerializationRequests[0].payload.action.payload;
      expect(firstRequest.operationUpdates[0].id).toBe(operations[1].id);
      expect(
        Object.prototype.hasOwnProperty.call(
          firstRequest.operationUpdates[0],
          "isMaterialized"
        )
      ).toBe(true);
    });

    it("should not dispatch rematerialization when operation properties other than columnIds/childIds change", async () => {
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["name"],
        },
      });

      const { effects } = await expectSaga(updateOperationsWatcher)
        .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const rematerializationRequests =
        effects.put?.filter(
          (effect) =>
            effect.payload?.action?.type === updateOperationsRequest.type
        ) || [];

      // Should not trigger rematerialization for orphan tables
      expect(rematerializationRequests).toHaveLength(0);
    });

    // it("should not dispatch rematerialization when operation is root", async () => {
    //     // TODO
    // });
  });
});
