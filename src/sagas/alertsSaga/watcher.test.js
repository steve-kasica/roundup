/**
 * @fileoverview Tests for the alerts saga watcher.
 * @module sagas/alertsSaga/watcher.test
 *
 * Comprehensive test suite for updateAlertsSagaWatcher covering:
 * - Explicit alert check requests
 * - Newly created operations trigger alert checks
 * - Operation updates trigger alert checks for relevant properties
 * - Table updates trigger alert checks for parent operations
 * - STACK, PACK, and NO_OP operation handling
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateAlertsSagaWatcher from "./watcher";
import alertsSagaWorker from "./worker";
import { checkOperationForAlertsRequest } from "./actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { updateTablesSuccess } from "../updateTablesSaga";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import {
  Operation,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { Table } from "../../slices/tablesSlice";
import { Column, COLUMN_TYPE_CATEGORICAL } from "../../slices/columnsSlice";

/**
 * Helper to create a mock Redux state
 */
const createMockState = ({
  operations = {},
  tables = {},
  columns = {},
  alerts = {},
} = {}) => ({
  operations: {
    byId: operations,
    allIds: Object.keys(operations),
  },
  tables: {
    byId: tables,
    allIds: Object.keys(tables),
  },
  columns: {
    byId: columns,
    allIds: Object.keys(columns),
  },
  alerts: {
    byId: alerts,
    allIds: Object.keys(alerts),
  },
});

describe("updateAlertsSagaWatcher", () => {
  let stackOp, packOp, noOpOp;
  let table1, table2;
  let column1, column2, column3, column4;
  let state;

  beforeEach(() => {
    // Create test operations
    stackOp = Operation({
      operationType: OPERATION_TYPE_STACK,
      childIds: [],
    });

    packOp = Operation({
      operationType: OPERATION_TYPE_PACK,
      childIds: [],
      joinKey1: "key1",
      joinKey2: "key2",
      joinPredicate: "EQUALS",
      joinType: "FULL OUTER",
    });

    noOpOp = Operation({
      operationType: OPERATION_TYPE_NO_OP,
    });

    // Create test tables
    table1 = Table({ name: "Table 1" });
    table2 = Table({ name: "Table 2" });

    // Create test columns
    column1 = Column({
      parentId: table1.id,
      name: "Column 1",
      columnType: COLUMN_TYPE_CATEGORICAL,
    });
    column2 = Column({
      parentId: table1.id,
      name: "Column 2",
      columnType: COLUMN_TYPE_CATEGORICAL,
    });
    column3 = Column({
      parentId: table2.id,
      name: "Column 3",
      columnType: COLUMN_TYPE_CATEGORICAL,
    });
    column4 = Column({
      parentId: table2.id,
      name: "Column 4",
      columnType: COLUMN_TYPE_CATEGORICAL,
    });

    // Set up table-column relationships
    table1.columnIds = [column1.id, column2.id];
    table2.columnIds = [column3.id, column4.id];

    // Set up operation-table relationships
    stackOp.childIds = [table1.id, table2.id];
    table1.parentId = stackOp.id;
    table2.parentId = stackOp.id;

    state = createMockState({
      operations: {
        [stackOp.id]: stackOp,
        [packOp.id]: packOp,
        [noOpOp.id]: noOpOp,
      },
      tables: {
        [table1.id]: table1,
        [table2.id]: table2,
      },
      columns: {
        [column1.id]: column1,
        [column2.id]: column2,
        [column3.id]: column3,
        [column4.id]: column4,
      },
    });
  });

  describe("checkOperationForAlertsRequest action handling", () => {
    describe("STACK operations", () => {
      it("should call alertsSagaWorker with raised alerts for STACK operations", async () => {
        const action = checkOperationForAlertsRequest({
          operationIds: [stackOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        // Should have a call effect to alertsSagaWorker
        const workerCallEffect = effects.call.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeDefined();
        const [raisedAlerts] = workerCallEffect.payload.args;
        expect(raisedAlerts).toHaveLength(1);
        expect(raisedAlerts[0].id).toBe(stackOp.id);
        expect(raisedAlerts[0].alerts).toBeDefined();
        expect(Array.isArray(raisedAlerts[0].alerts)).toBe(true);
      });

      it("should test STACK operations for incongruent tables and heterogeneous column types", async () => {
        // Create a STACK with mismatched column counts
        const mismatchedStackOp = Operation({
          operationType: OPERATION_TYPE_STACK,
          childIds: [table1.id, table2.id],
        });

        // Give tables different column counts
        const localTable1 = { ...table1, columnIds: [column1.id] };
        const localTable2 = {
          ...table2,
          columnIds: [column3.id, column4.id],
        };

        const localState = createMockState({
          operations: { [mismatchedStackOp.id]: mismatchedStackOp },
          tables: {
            [localTable1.id]: localTable1,
            [localTable2.id]: localTable2,
          },
          columns: {
            [column1.id]: column1,
            [column3.id]: column3,
            [column4.id]: column4,
          },
        });

        const action = checkOperationForAlertsRequest({
          operationIds: [mismatchedStackOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(localState)
          .dispatch(action)
          .silentRun(100);

        const workerCallEffect = effects.call.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeDefined();
        const [raisedAlerts] = workerCallEffect.payload.args;
        expect(raisedAlerts[0].alerts.length).toBeGreaterThan(0);
      });
    });

    describe("PACK operations", () => {
      it("should call alertsSagaWorker with raised alerts for PACK operations", async () => {
        const action = checkOperationForAlertsRequest({
          operationIds: [packOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const workerCallEffect = effects.call.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeDefined();
        const [raisedAlerts] = workerCallEffect.payload.args;
        expect(raisedAlerts).toHaveLength(1);
        expect(raisedAlerts[0].id).toBe(packOp.id);
      });

      it("should test PACK operations for missing join configuration", async () => {
        // Create a PACK operation with missing join keys
        const incompletePackOp = Operation({
          operationType: OPERATION_TYPE_PACK,
          childIds: [table1.id, table2.id],
          joinKey1: null, // Missing left join key
          joinKey2: null, // Missing right join key
          joinPredicate: null,
          joinType: null,
        });

        const localState = createMockState({
          operations: { [incompletePackOp.id]: incompletePackOp },
          tables: {
            [table1.id]: table1,
            [table2.id]: table2,
          },
        });

        const action = checkOperationForAlertsRequest({
          operationIds: [incompletePackOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(localState)
          .dispatch(action)
          .silentRun(100);

        const workerCallEffect = effects.call.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeDefined();
        const [raisedAlerts] = workerCallEffect.payload.args;
        // Should have alerts for missing join configuration
        expect(raisedAlerts[0].alerts.length).toBeGreaterThan(0);
      });
    });

    describe("NO_OP operations", () => {
      it("should skip NO_OP operations and not call alertsSagaWorker", async () => {
        const action = checkOperationForAlertsRequest({
          operationIds: [noOpOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        // Should not have any call effects to alertsSagaWorker
        const workerCallEffect = effects.call?.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeUndefined();
      });
    });

    describe("multiple operations", () => {
      it("should handle multiple operation IDs in a single request", async () => {
        const action = checkOperationForAlertsRequest({
          operationIds: [stackOp.id, packOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const workerCallEffect = effects.call.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeDefined();
        const [raisedAlerts] = workerCallEffect.payload.args;
        expect(raisedAlerts).toHaveLength(2);
        expect(raisedAlerts.map((a) => a.id)).toContain(stackOp.id);
        expect(raisedAlerts.map((a) => a.id)).toContain(packOp.id);
      });

      it("should skip NO_OP operations when mixed with other types", async () => {
        const action = checkOperationForAlertsRequest({
          operationIds: [stackOp.id, noOpOp.id, packOp.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const workerCallEffect = effects.call.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeDefined();
        const [raisedAlerts] = workerCallEffect.payload.args;
        // Should only have 2 alerts (stackOp and packOp), not noOpOp
        expect(raisedAlerts).toHaveLength(2);
        expect(raisedAlerts.map((a) => a.id)).not.toContain(noOpOp.id);
      });

      it("should not call worker when all operations are NO_OP", async () => {
        const noOpOp2 = Operation({
          operationType: OPERATION_TYPE_NO_OP,
        });

        const localState = createMockState({
          operations: {
            [noOpOp.id]: noOpOp,
            [noOpOp2.id]: noOpOp2,
          },
        });

        const action = checkOperationForAlertsRequest({
          operationIds: [noOpOp.id, noOpOp2.id],
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(localState)
          .dispatch(action)
          .silentRun(100);

        const workerCallEffect = effects.call?.find(
          (effect) => effect.payload.fn === alertsSagaWorker
        );

        expect(workerCallEffect).toBeUndefined();
      });
    });

    describe("unsupported operation types", () => {
      it("should throw an error for unsupported operation types", async () => {
        const unknownOp = Operation({
          operationType: "unknown-type",
        });

        const localState = createMockState({
          operations: { [unknownOp.id]: unknownOp },
        });

        const action = checkOperationForAlertsRequest({
          operationIds: [unknownOp.id],
        });

        // expectSaga will reject when the saga throws an error
        try {
          await expectSaga(updateAlertsSagaWatcher)
            .withState(localState)
            .dispatch(action)
            .silentRun(100);
          // If we get here, the test should fail
          expect.fail("Expected saga to throw an error");
        } catch (error) {
          expect(error.message).toContain(
            'Unsupported operation type "unknown-type"'
          );
        }
      });
    });
  });

  describe("createOperationsSuccess action handling", () => {
    it("should dispatch checkOperationForAlertsRequest when new operations are created", async () => {
      const action = createOperationsSuccess({
        operationIds: [stackOp.id, packOp.id],
      });

      const { effects } = await expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      // Find the put effect that dispatches checkOperationForAlertsRequest
      const checkAlertsAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === checkOperationForAlertsRequest.type
      );

      expect(checkAlertsAction).toBeDefined();
      expect(
        checkAlertsAction.payload.action.payload.operationIds
      ).toHaveLength(2);
      expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
        stackOp.id
      );
      expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
        packOp.id
      );
    });

    it("should handle a single newly created operation", async () => {
      const action = createOperationsSuccess({
        operationIds: [packOp.id],
      });

      const { effects } = await expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      const checkAlertsAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === checkOperationForAlertsRequest.type
      );

      expect(checkAlertsAction).toBeDefined();
      expect(
        checkAlertsAction.payload.action.payload.operationIds
      ).toHaveLength(1);
      expect(checkAlertsAction.payload.action.payload.operationIds[0]).toBe(
        packOp.id
      );
    });
  });

  describe("updateOperationsSuccess action handling", () => {
    const relevantProperties = [
      "operationType",
      "childIds",
      "joinType",
      "joinKey1",
      "joinKey2",
      "joinPredicate",
    ];

    describe("relevant property changes", () => {
      relevantProperties.forEach((property) => {
        it(`should dispatch checkOperationForAlertsRequest when "${property}" changes`, async () => {
          const action = updateOperationsSuccess({
            changedPropertiesById: {
              [packOp.id]: [property],
            },
          });

          const { effects } = await expectSaga(updateAlertsSagaWatcher)
            .withState(state)
            .dispatch(action)
            .silentRun(100);

          const checkAlertsAction = effects.put.find(
            (effect) =>
              effect.payload?.action?.type ===
              checkOperationForAlertsRequest.type
          );

          expect(checkAlertsAction).toBeDefined();
          expect(
            checkAlertsAction.payload.action.payload.operationIds
          ).toContain(packOp.id);
        });
      });
    });

    describe("irrelevant property changes", () => {
      const irrelevantProperties = [
        "name",
        "rowCount",
        "columnIds",
        "hiddenColumnIds",
      ];

      irrelevantProperties.forEach((property) => {
        it(`should NOT dispatch checkOperationForAlertsRequest when only "${property}" changes`, async () => {
          const action = updateOperationsSuccess({
            changedPropertiesById: {
              [packOp.id]: [property],
            },
          });

          const { effects } = await expectSaga(updateAlertsSagaWatcher)
            .withState(state)
            .dispatch(action)
            .silentRun(100);

          const checkAlertsAction = effects.put.find(
            (effect) =>
              effect.payload?.action?.type ===
              checkOperationForAlertsRequest.type
          );

          expect(checkAlertsAction).toBeDefined();
          // The action should have empty operationIds array
          expect(
            checkAlertsAction.payload.action.payload.operationIds
          ).toHaveLength(0);
        });
      });
    });

    describe("multiple operations updated", () => {
      it("should check only operations with relevant property changes", async () => {
        const action = updateOperationsSuccess({
          changedPropertiesById: {
            [stackOp.id]: ["childIds", "name"], // relevant + irrelevant
            [packOp.id]: ["name"], // only irrelevant
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).toHaveLength(1);
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          stackOp.id
        );
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).not.toContain(packOp.id);
      });

      it("should check all operations when all have relevant changes", async () => {
        const action = updateOperationsSuccess({
          changedPropertiesById: {
            [stackOp.id]: ["childIds"],
            [packOp.id]: ["joinType", "joinKey1"],
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).toHaveLength(2);
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          stackOp.id
        );
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          packOp.id
        );
      });
    });

    describe("mixed property changes", () => {
      it("should trigger check when both relevant and irrelevant properties change", async () => {
        const action = updateOperationsSuccess({
          changedPropertiesById: {
            [packOp.id]: ["name", "joinKey1", "rowCount"],
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          packOp.id
        );
      });
    });
  });

  describe("updateTablesSuccess action handling", () => {
    describe("columnIds changes", () => {
      it("should dispatch checkOperationForAlertsRequest for parent operation when table columnIds change", async () => {
        const action = updateTablesSuccess({
          changedPropertiesById: {
            [table1.id]: ["columnIds"],
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          stackOp.id
        );
      });

      it("should not duplicate parent operation ID when multiple child tables change", async () => {
        const action = updateTablesSuccess({
          changedPropertiesById: {
            [table1.id]: ["columnIds"],
            [table2.id]: ["columnIds"],
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(state)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        // Should only have one entry for the parent operation, not duplicates
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).toHaveLength(1);
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          stackOp.id
        );
      });
    });

    describe("irrelevant property changes", () => {
      const irrelevantTableProperties = [
        "name",
        "rowCount",
        "fileName",
        "size",
      ];

      irrelevantTableProperties.forEach((property) => {
        it(`should NOT trigger alert check when only "${property}" changes`, async () => {
          const action = updateTablesSuccess({
            changedPropertiesById: {
              [table1.id]: [property],
            },
          });

          const { effects } = await expectSaga(updateAlertsSagaWatcher)
            .withState(state)
            .dispatch(action)
            .silentRun(100);

          const checkAlertsAction = effects.put.find(
            (effect) =>
              effect.payload?.action?.type ===
              checkOperationForAlertsRequest.type
          );

          expect(checkAlertsAction).toBeDefined();
          expect(
            checkAlertsAction.payload.action.payload.operationIds
          ).toHaveLength(0);
        });
      });
    });

    describe("tables without parent operations", () => {
      it("should not add to operationIds when table has no parentId", async () => {
        const orphanTable = Table({ name: "Orphan Table" });
        orphanTable.parentId = null;

        const localState = createMockState({
          operations: {},
          tables: { [orphanTable.id]: orphanTable },
        });

        const action = updateTablesSuccess({
          changedPropertiesById: {
            [orphanTable.id]: ["columnIds"],
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(localState)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).toHaveLength(0);
      });
    });

    describe("mixed table updates", () => {
      it("should only check parents of tables with relevant changes", async () => {
        // Create a second operation with its own table
        const packOpWithTable = Operation({
          operationType: OPERATION_TYPE_PACK,
          childIds: [],
        });
        const table3 = Table({ name: "Table 3" });
        table3.parentId = packOpWithTable.id;
        packOpWithTable.childIds = [table3.id];

        const localState = createMockState({
          operations: {
            [stackOp.id]: stackOp,
            [packOpWithTable.id]: packOpWithTable,
          },
          tables: {
            [table1.id]: table1,
            [table2.id]: table2,
            [table3.id]: table3,
          },
          columns: {
            [column1.id]: column1,
            [column2.id]: column2,
            [column3.id]: column3,
            [column4.id]: column4,
          },
        });

        const action = updateTablesSuccess({
          changedPropertiesById: {
            [table1.id]: ["columnIds"], // relevant, parent is stackOp
            [table3.id]: ["name"], // irrelevant, parent is packOpWithTable
          },
        });

        const { effects } = await expectSaga(updateAlertsSagaWatcher)
          .withState(localState)
          .dispatch(action)
          .silentRun(100);

        const checkAlertsAction = effects.put.find(
          (effect) =>
            effect.payload?.action?.type === checkOperationForAlertsRequest.type
        );

        expect(checkAlertsAction).toBeDefined();
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).toHaveLength(1);
        expect(checkAlertsAction.payload.action.payload.operationIds).toContain(
          stackOp.id
        );
        expect(
          checkAlertsAction.payload.action.payload.operationIds
        ).not.toContain(packOpWithTable.id);
      });
    });
  });

  describe("empty operation arrays", () => {
    it("should handle empty operationIds array in checkOperationForAlertsRequest", async () => {
      const action = checkOperationForAlertsRequest({
        operationIds: [],
      });

      const { effects } = await expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(100);

      // Should not call the worker when there are no operations to check
      const workerCallEffect = effects.call?.find(
        (effect) => effect.payload.fn === alertsSagaWorker
      );

      expect(workerCallEffect).toBeUndefined();
    });
  });

  describe("integration flow", () => {
    it("should complete full flow from createOperationsSuccess to worker call for STACK", async () => {
      const action = createOperationsSuccess({
        operationIds: [stackOp.id],
      });

      const { effects } = await expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(200);

      // First, verify checkOperationForAlertsRequest was dispatched
      const checkAlertsAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === checkOperationForAlertsRequest.type
      );
      expect(checkAlertsAction).toBeDefined();

      // Then verify the worker was called
      const workerCallEffect = effects.call?.find(
        (effect) => effect.payload.fn === alertsSagaWorker
      );
      expect(workerCallEffect).toBeDefined();
    });

    it("should complete full flow from updateOperationsSuccess to worker call", async () => {
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [packOp.id]: ["joinType"],
        },
      });

      const { effects } = await expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(200);

      const checkAlertsAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === checkOperationForAlertsRequest.type
      );
      expect(checkAlertsAction).toBeDefined();

      const workerCallEffect = effects.call?.find(
        (effect) => effect.payload.fn === alertsSagaWorker
      );
      expect(workerCallEffect).toBeDefined();
    });

    it("should complete full flow from updateTablesSuccess to worker call", async () => {
      const action = updateTablesSuccess({
        changedPropertiesById: {
          [table1.id]: ["columnIds"],
        },
      });

      const { effects } = await expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .dispatch(action)
        .silentRun(200);

      const checkAlertsAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === checkOperationForAlertsRequest.type
      );
      expect(checkAlertsAction).toBeDefined();

      const workerCallEffect = effects.call?.find(
        (effect) => effect.payload.fn === alertsSagaWorker
      );
      expect(workerCallEffect).toBeDefined();
    });
  });
});
