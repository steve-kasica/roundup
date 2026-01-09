/**
 * @file deleteColumnsSaga watcher tests
 * @module sagas/deleteColumnsSaga/watcher.test
 *
 * Tests for the deleteColumnsSaga watcher, ensuring it correctly
 * responds to delete column requests and related actions by dispatching
 * appropriate worker sagas with the correct parameters.
 *
 * Scenarios tested:
 * - Direct deleteColumnsRequest actions for table columns
 * - Recursive deletion for operation columns (PACK and STACK types)
 * - Handling of orphaned columns after operation updates
 * - Deletion of columns when parent tables are deleted
 */
import { beforeEach, describe, expect, it } from "vitest";
import {
  Operation,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { Table } from "../../slices/tablesSlice";
import { Column } from "../../slices/columnsSlice";
import { deleteColumnsRequest } from "./actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import deleteColumnsWatcher from "./watcher";
import deleteColumnsWorker from "./worker";
import { expectSaga } from "redux-saga-test-plan";
import { initialState } from "../../slices/uiSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";

describe("deleteColumnsSaga watcher", () => {
  let state, operations, tables, columns;

  beforeEach(() => {
    operations = Array.from({ length: 1 }, () => Operation());
    tables = Array.from({ length: 2 }, () => Table());
    columns = Array.from({ length: 6 }, () => Column());

    operations[0].childIds = [tables[0].id, tables[1].id];
    tables[0].parentId = operations[0].id;
    tables[1].parentId = operations[0].id;

    columns[0].parentId = tables[0].id;
    columns[1].parentId = tables[0].id;
    tables[0].columnIds = [columns[0].id, columns[1].id];

    columns[2].parentId = tables[0].id;
    columns[3].parentId = tables[1].id;
    tables[1].columnIds = [columns[2].id, columns[3].id];

    columns[4].parentId = operations[0].id;
    columns[5].parentId = operations[0].id;
    operations[0].columnIds = [columns[4].id, columns[5].id];
    // Setup initial state and mocks
    state = {
      ui: initialState,
      columns: {
        byId: columns.reduce((acc, col) => {
          acc[col.id] = col;
          return acc;
        }, {}),
        allIds: columns.map((col) => col.id),
      },
      tables: {
        byId: tables.reduce((acc, table) => {
          acc[table.id] = table;
          return acc;
        }, {}),
        allIds: tables.map((table) => table.id),
      },
      operations: {
        byId: operations.reduce((acc, op) => {
          acc[op.id] = op;
          return acc;
        }, {}),
        allIds: operations.map((op) => op.id),
      },
    };
  });

  describe("handling deleteColumnsRequest", () => {
    describe("when the parent is a table", () => {
      it("should call the delete columns worker with the table ID and an array column IDs", async () => {
        const action = deleteColumnsRequest({
          columnIds: [columns[0].id, columns[1].id],
        });

        const { effects } = await expectSaga(deleteColumnsWatcher)
          .provide([[deleteColumnsWorker, {}]])
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const callEffect = effects.call.find(
          (effect) => effect.payload.fn === deleteColumnsWorker
        );
        const [tablesToAlter] = callEffect.payload.args;

        expect(tablesToAlter).toHaveLength(1);
        expect(tablesToAlter[0].tableId).toBe(tables[0].id);
        expect(tablesToAlter[0].columnsToDelete).toHaveLength(2);
        expect(tablesToAlter[0].columnsToDelete.map((col) => col.id)).toEqual([
          columns[0].id,
          columns[1].id,
        ]);
      });
    });
    describe("when the parent is an operation", () => {
      it("should identify child tables and map operation columns to table columns for PACK operations", async () => {
        operations[0].operationType = "pack";
        const action = deleteColumnsRequest({
          columnIds: [columns[4].id],
          deleteFromDatabase: true,
          recurse: true,
        });

        const { effects } = await expectSaga(deleteColumnsWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        // Should dispatch a delete columns request for child columns
        const putEffect = effects.put.find(
          (effect) => effect.payload.action.type === deleteColumnsRequest.type
        );

        expect(putEffect).toBeDefined();
        expect(putEffect.payload.action.payload.columnIds).toContain(
          columns[0].id
        );
      });

      it("should recursively handle deletion through child tables for PACK operations", async () => {
        operations[0].operationType = OPERATION_TYPE_PACK;
        const action = deleteColumnsRequest({
          columnIds: [columns[4].id],
          deleteFromDatabase: true,
          recurse: true,
        });

        const { effects } = await expectSaga(deleteColumnsWatcher)
          .provide([[deleteColumnsWorker, {}]])
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        // Should call the worker with the child table's columns after recursion
        const callEffects = effects.call.filter(
          (effect) => effect.payload.fn === deleteColumnsWorker
        );

        // First call: empty (operation column doesn't directly alter tables)
        // Second call: after recursion, should have the child table column
        expect(callEffects.length).toBeGreaterThanOrEqual(1);
        const finalCall = callEffects[callEffects.length - 1];
        const [tablesToAlter] = finalCall.payload.args;

        expect(tablesToAlter).toHaveLength(1);
        expect(tablesToAlter[0].tableId).toBe(tables[0].id);
        expect(tablesToAlter[0].columnsToDelete.map((col) => col.id)).toContain(
          columns[0].id
        );
      });

      it("should identify child tables and map operation columns to table columns for STACK operations", async () => {
        operations[0].operationType = OPERATION_TYPE_STACK;
        const action = deleteColumnsRequest({
          columnIds: [columns[4].id],
          deleteFromDatabase: true,
          recurse: true,
        });

        const { effects } = await expectSaga(deleteColumnsWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        // Should dispatch a delete columns request for child columns from all tables
        const putEffect = effects.put.find(
          (effect) => effect.payload.action.type === deleteColumnsRequest.type
        );

        expect(putEffect).toBeDefined();
        // For stack operations, should include columns from both tables at the same index
        expect(putEffect.payload.action.payload.columnIds).toContain(
          columns[0].id
        );
        expect(putEffect.payload.action.payload.columnIds).toContain(
          columns[2].id
        );
      });

      it("should recursively handle deletion through child tables for STACK operations", async () => {
        operations[0].operationType = OPERATION_TYPE_STACK;
        const action = deleteColumnsRequest({
          columnIds: [columns[4].id],
          deleteFromDatabase: true,
          recurse: true,
        });

        const { effects } = await expectSaga(deleteColumnsWatcher)
          .provide([[deleteColumnsWorker, {}]])
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        // Should call the worker with both child tables' columns after recursion
        const callEffects = effects.call.filter(
          (effect) => effect.payload.fn === deleteColumnsWorker
        );

        expect(callEffects.length).toBeGreaterThanOrEqual(1);
        const finalCall = callEffects[callEffects.length - 1];
        const [tablesToAlter] = finalCall.payload.args;

        // For STACK, should have entries for both tables
        expect(tablesToAlter.length).toBeGreaterThanOrEqual(1);
        const allDeletedColumnIds = tablesToAlter.flatMap((t) =>
          t.columnsToDelete.map((col) => col.id)
        );
        expect(allDeletedColumnIds).toContain(columns[0].id);
        expect(allDeletedColumnIds).toContain(columns[2].id);
      });
    });
  });

  describe("handling updateOperationsSuccess", () => {
    it("puts a deleteColumnsRequest if there are orphaned columns with the correct columnIds", async () => {
      const localState = JSON.parse(JSON.stringify(state));
      const orphanedColumn = Column();
      orphanedColumn.parentId = operations[0].id;
      localState.columns.byId[orphanedColumn.id] = orphanedColumn;
      localState.columns.allIds.push(orphanedColumn.id);
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["columnIds"],
        },
      });
      const { effects } = await expectSaga(deleteColumnsWatcher)
        .withState(localState)
        .dispatch(action)
        .silentRun(100);

      const putEffect = effects.put.find(
        (effect) => effect.payload.action.type === deleteColumnsRequest.type
      );

      expect(putEffect).toBeDefined();
      expect(putEffect.payload.action.payload.columnIds).toContain(
        orphanedColumn.id
      );
    });

    it("does not call deleteColumnsRequest if there are no orphaned columns", async () => {
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["columnIds"],
        },
      });
      const result = await expectSaga(deleteColumnsWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const putEffects = result.allEffects.filter(
        (effect) =>
          effect.type === "PUT" &&
          effect.payload.action.type === deleteColumnsRequest.type
      );

      expect(putEffects.length).toBe(0);
    });
  });

  describe("handling deleteTablesSuccessRequest", () => {
    it("should call deleteColumnsWorker with columns belonging to deleted tables", async () => {
      const localState = JSON.parse(JSON.stringify(state));

      // Simulate deleting the first table from state
      delete localState.tables.byId[tables[0].id];
      localState.tables.allIds = localState.tables.allIds.filter(
        (id) => id !== tables[0].id
      );

      const action = deleteTablesSuccess({
        tableIds: [tables[0].id],
      });

      const result = await expectSaga(deleteColumnsWatcher)
        .withState(localState)
        .dispatch(action)
        .silentRun(100);

      const putEffects = result.allEffects.filter(
        (effect) =>
          effect.type === "PUT" &&
          effect.payload.action.type === deleteColumnsRequest.type
      );

      expect(putEffects.length).toBe(1);
      const putEffect = putEffects[0];
      expect(putEffect.payload.action.payload.columnIds).toContain(
        columns[0].id
      );
      expect(putEffect.payload.action.payload.columnIds).toContain(
        columns[1].id
      );
    });
  });
});
