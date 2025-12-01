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

  describe("requests to delete a table's columns", () => {
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

  describe("requests to delete an operation's columns", () => {
    it("should identify child tables and map operation columns to table columns for PACK operations", async () => {
      operations[0].operationType = "pack";
      const action = deleteColumnsRequest({
        columnIds: [columns[4].id],
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

  describe("in response to newly created operations", () => {
    it("should delete orphaned columns when operation columnIds are updated", async () => {
      // Add an extra column that will become orphaned
      const orphanedColumn = Column();
      orphanedColumn.parentId = operations[0].id;
      state.columns.byId[orphanedColumn.id] = orphanedColumn;
      state.columns.allIds.push(orphanedColumn.id);

      // Operation has fewer columnIds than total columns with this parentId
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["columnIds"],
        },
      });

      const { effects } = await expectSaga(deleteColumnsWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      // Should dispatch deleteColumnsRequest for the orphaned column
      const putEffects = effects.put;
      expect(putEffects.length).toBeGreaterThan(0);
      const deleteAction = putEffects.find((effect) =>
        effect.payload.action.payload.columnIds.includes(orphanedColumn.id)
      );
      expect(deleteAction).toBeDefined();
    });

    it("should not delete columns when columnIds property was not changed", async () => {
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operations[0].id]: ["name", "operationType"],
        },
      });

      const { effects } = await expectSaga(deleteColumnsWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch any delete columns requests
      const putEffects = effects.put?.filter(
        (effect) => effect.action.type === deleteColumnsRequest.type
      );

      expect(putEffects).toBeUndefined();
    });
  });
});
