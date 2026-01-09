import { describe, it, expect } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import createColumnsWatcher from "./watcher";
import createColumnsWorker from "./worker";
import { createColumnsRequest } from "./actions";
import {
  Operation,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { selectTablesById } from "../../slices/tablesSlice";
import { CREATION_MODE_INITIALIZATION, CREATION_MODE_INSERTION } from ".";
import { createTablesSuccess } from "../createTablesSaga";
import { updateOperationsSuccess } from "../updateOperationsSaga";

describe("createColumnsWatcher", () => {
  describe("handling createColumnsRequest actions", () => {
    describe("recursive action dispatch for STACK operations", () => {
      it("dispatches createColumnsRequest with correct payload for each child when inserting into STACK", async () => {
        // Setup: Create a STACK operation with 3 children
        const stackOperation = Operation({
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t1", "t2", "t3"],
        });

        const action = createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: [
            {
              parentId: stackOperation.id, // Inserting into the stack operation
              index: 2, // At column index 2
            },
          ],
        });

        const { effects } = await expectSaga(createColumnsWatcher)
          .provide([
            // Mock the selector to return our stack operation
            [matchers.select.selector(selectOperationsById), stackOperation],
            // Mock the worker so it doesn't actually execute
            [matchers.call.fn(createColumnsWorker), undefined],
          ])
          .withState({
            operations: { byId: { [stackOperation.id]: stackOperation } },
          })
          .dispatch(action)
          .silentRun(100);

        // Find the recursive createColumnsRequest action
        const recursiveActions = effects.put.filter(
          (effect) =>
            effect.payload?.action?.type === createColumnsRequest.type &&
            effect.payload.action.payload.mode === CREATION_MODE_INSERTION
        );

        // Should have dispatched exactly one recursive action
        expect(recursiveActions).toHaveLength(1);

        const recursivePayload = recursiveActions[0].payload.action.payload;

        // Verify the recursive action has correct structure
        expect(recursivePayload.mode).toBe(CREATION_MODE_INSERTION);
        expect(recursivePayload.columnLocations).toHaveLength(3);

        // Verify each child gets a column insertion at the same index
        expect(recursivePayload.columnLocations).toEqual([
          { parentId: "t1", index: 2 },
          { parentId: "t2", index: 2 },
          { parentId: "t3", index: 2 },
        ]);
      });
    });

    describe("recursive action dispatch for PACK operations", () => {
      it("dispatches createColumnsRequest to left child when index is within left child columns", async () => {
        // Setup: Create a PACK operation with 2 children
        // Left child has 3 columns, right child has 2 columns
        const packOperation = Operation({
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t1", "t2"],
        });

        const action = createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: [
            {
              parentId: packOperation.id,
              index: 1, // Insert at index 1 (within left child's range)
            },
          ],
        });

        const { effects } = await expectSaga(createColumnsWatcher)
          .provide([
            [matchers.select.selector(selectOperationsById), packOperation],
            [
              matchers.select.selector(selectTablesById),
              { columnIds: ["c1", "c2", "c3"] }, // Left child has 3 columns
            ],
            [matchers.call.fn(createColumnsWorker), undefined],
          ])
          .withState({
            operations: { byId: { [packOperation.id]: packOperation } },
            tables: { byId: { t1: { columnIds: ["c1", "c2", "c3"] } } },
          })
          .dispatch(action)
          .silentRun(100);

        const recursiveActions = effects.put.filter(
          (effect) =>
            effect.payload?.action?.type === createColumnsRequest.type &&
            effect.payload.action.payload.mode === CREATION_MODE_INSERTION
        );

        expect(recursiveActions).toHaveLength(1);

        const recursivePayload = recursiveActions[0].payload.action.payload;

        expect(recursivePayload.mode).toBe(CREATION_MODE_INSERTION);
        expect(recursivePayload.columnLocations).toHaveLength(1);
        expect(recursivePayload.columnLocations[0]).toEqual({
          parentId: "t1", // Should target left child
          index: 1, // Same index
        });
      });

      it("dispatches createColumnsRequest to right child when index is beyond left child columns", async () => {
        // Setup: Create a PACK operation with 2 children
        // Left child has 3 columns, right child has 2 columns
        const packOperation = Operation({
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t1", "t2"],
        });

        const action = createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: [
            {
              parentId: packOperation.id,
              index: 4, // Insert at index 4 (beyond left child, which has 3 columns)
            },
          ],
        });

        const { effects } = await expectSaga(createColumnsWatcher)
          .provide([
            [matchers.select.selector(selectOperationsById), packOperation],
            [
              matchers.select.selector(selectTablesById),
              { columnIds: ["c1", "c2", "c3"] }, // Left child has 3 columns
            ],
            [matchers.call.fn(createColumnsWorker), undefined],
          ])
          .withState({
            operations: { byId: { [packOperation.id]: packOperation } },
            tables: { byId: { t1: { columnIds: ["c1", "c2", "c3"] } } },
          })
          .dispatch(action)
          .silentRun(100);

        const recursiveActions = effects.put.filter(
          (effect) =>
            effect.payload?.action?.type === createColumnsRequest.type &&
            effect.payload.action.payload.mode === CREATION_MODE_INSERTION
        );

        expect(recursiveActions).toHaveLength(1);

        const recursivePayload = recursiveActions[0].payload.action.payload;

        expect(recursivePayload.mode).toBe(CREATION_MODE_INSERTION);
        expect(recursivePayload.columnLocations).toHaveLength(1);
        expect(recursivePayload.columnLocations[0]).toEqual({
          parentId: "t2", // Should target right child
          index: 1, // Adjusted index: 4 - 3 = 1
        });
      });
    });

    describe("recursive action dispatch for nested operations", () => {
      it("dispatches createColumnsRequest for STACK with PACK child, which then recursively handles the PACK", async () => {
        // Setup: Create a STACK operation with a PACK operation as one of its children
        // Stack has 2 children: a table (t1) and a pack operation (op2)
        const packOperation = Operation({
          id: "op2",
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t2", "t3"], // Pack has 2 table children
        });

        const stackOperation = Operation({
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t1", packOperation.id], // Stack has a table and a pack
        });

        const action = createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: [
            {
              parentId: stackOperation.id,
              index: 2,
            },
          ],
        });

        const { effects } = await expectSaga(createColumnsWatcher)
          .provide([
            // First call: select the stack operation
            [
              matchers.select.selector(selectOperationsById),
              (state, id) => {
                if (id === stackOperation.id) return stackOperation;
                if (id === packOperation.id) return packOperation;
                return null;
              },
            ],
            // Second call: when processing the pack, select its left child's columns
            [
              matchers.select.selector(selectTablesById),
              { columnIds: ["c1", "c2", "c3"] }, // Left child of pack has 3 columns
            ],
            [matchers.call.fn(createColumnsWorker), undefined],
          ])
          .withState({
            operations: {
              byId: {
                [stackOperation.id]: stackOperation,
                [packOperation.id]: packOperation,
              },
            },
            tables: {
              byId: {
                t1: { columnIds: ["c1", "c2"] },
                t2: { columnIds: ["c3", "c4", "c5"] },
                t3: { columnIds: ["c6", "c7"] },
              },
            },
          })
          .dispatch(action)
          .silentRun(200);

        // Find all recursive createColumnsRequest actions
        const recursiveActions = effects.put.filter(
          (effect) =>
            effect.payload?.action?.type === createColumnsRequest.type &&
            effect.payload.action.payload.mode === CREATION_MODE_INSERTION
        );

        // Should have 2 recursive actions:
        // 1. First recursion for the stack's children (t1 and op2)
        // 2. Second recursion for the pack's appropriate child
        expect(recursiveActions).toHaveLength(2);

        // First recursive action: stack distributes to its children
        const firstRecursion = recursiveActions[0].payload.action.payload;
        expect(firstRecursion.mode).toBe(CREATION_MODE_INSERTION);
        expect(firstRecursion.columnLocations).toHaveLength(2);
        expect(firstRecursion.columnLocations).toEqual([
          { parentId: "t1", index: 2 }, // Direct table child
          { parentId: packOperation.id, index: 2 }, // Pack operation child
        ]);

        // Second recursive action: pack determines which child gets the column
        const secondRecursion = recursiveActions[1].payload.action.payload;
        expect(secondRecursion.mode).toBe(CREATION_MODE_INSERTION);
        expect(secondRecursion.columnLocations).toHaveLength(1);
        // Index 2 is within left child's range (3 columns), so it goes to t2
        expect(secondRecursion.columnLocations[0]).toEqual({
          parentId: "t2",
          index: 2,
        });
      });

      it("dispatches createColumnsRequest for PACK with STACK child on the left side", async () => {
        // Setup: Create a PACK operation with a STACK as left child and table as right child
        const stackOperation = Operation({
          id: "op2",
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t2", "t3", "t4"], // Stack has 3 table children
          columnIds: ["c2", "c3"], // Stack itself has 2 columns
        });

        const packOperation = Operation({
          operationType: OPERATION_TYPE_PACK,
          childIds: [stackOperation.id, "t1"], // Pack has stack on left, table on right
        });

        const action = createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: [
            {
              parentId: packOperation.id,
              index: 1, // Insert at index 1 (within left child's 2 columns)
            },
          ],
        });

        const { effects } = await expectSaga(createColumnsWatcher)
          .provide([
            [
              matchers.select.selector(selectOperationsById),
              (state, id) => {
                if (id === packOperation.id) return packOperation;
                if (id === stackOperation.id) return stackOperation;
                return null;
              },
            ],
            [matchers.call.fn(createColumnsWorker), undefined],
          ])
          .withState({
            operations: {
              byId: {
                [packOperation.id]: packOperation,
                [stackOperation.id]: stackOperation,
              },
            },
            tables: {
              byId: {
                t1: { columnIds: ["c5", "c6"] },
                t2: { columnIds: ["c7"] },
                t3: { columnIds: ["c8"] },
                t4: { columnIds: ["c9"] },
              },
            },
          })
          .dispatch(action)
          .silentRun(200);

        const recursiveActions = effects.put.filter(
          (effect) =>
            effect.payload?.action?.type === createColumnsRequest.type &&
            effect.payload.action.payload.mode === CREATION_MODE_INSERTION
        );

        // Should have 2 recursive actions:
        // 1. First recursion: pack determines to go to left child (stack)
        // 2. Second recursion: stack distributes to all its children
        expect(recursiveActions).toHaveLength(2);

        // First recursive action: pack routes to stack at same index
        const firstRecursion = recursiveActions[0].payload.action.payload;
        expect(firstRecursion.mode).toBe(CREATION_MODE_INSERTION);
        expect(firstRecursion.columnLocations).toHaveLength(1);
        expect(firstRecursion.columnLocations[0]).toEqual({
          parentId: stackOperation.id,
          index: 1,
        });

        // Second recursive action: stack distributes to all 3 children
        const secondRecursion = recursiveActions[1].payload.action.payload;
        expect(secondRecursion.mode).toBe(CREATION_MODE_INSERTION);
        expect(secondRecursion.columnLocations).toHaveLength(3);
        expect(secondRecursion.columnLocations).toEqual([
          { parentId: "t2", index: 1 },
          { parentId: "t3", index: 1 },
          { parentId: "t4", index: 1 },
        ]);
      });

      it("dispatches createColumnsRequest for PACK with STACK child on the right side", async () => {
        // Setup: Create a PACK operation with table on left and STACK as right child
        const stackOperation = Operation({
          id: "op2",
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t2", "t3"], // Stack has 2 table children
          columnIds: ["c2", "c3", "c4"], // Stack itself has 3 columns
        });

        const packOperation = Operation({
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t1", stackOperation.id], // Pack has table on left, stack on right
        });

        const action = createColumnsRequest({
          mode: CREATION_MODE_INSERTION,
          columnLocations: [
            {
              parentId: packOperation.id,
              index: 4, // Insert at index 4 (beyond left table's 2 columns, into stack)
            },
          ],
        });

        const { effects } = await expectSaga(createColumnsWatcher)
          .provide([
            [
              matchers.select.selector(selectOperationsById),
              (state, id) => {
                if (id === packOperation.id) return packOperation;
                if (id === stackOperation.id) return stackOperation;
                return null;
              },
            ],
            [
              matchers.select.selector(selectTablesById),
              { columnIds: ["c1", "c2"] }, // Left table has 2 columns
            ],
            [matchers.call.fn(createColumnsWorker), undefined],
          ])
          .withState({
            operations: {
              byId: {
                [packOperation.id]: packOperation,
                [stackOperation.id]: stackOperation,
              },
            },
            tables: {
              byId: {
                t1: { columnIds: ["c1", "c2"] },
                t2: { columnIds: ["c3", "c4"] },
                t3: { columnIds: ["c5", "c6"] },
              },
            },
          })
          .dispatch(action)
          .silentRun(200);

        const recursiveActions = effects.put.filter(
          (effect) =>
            effect.payload?.action?.type === createColumnsRequest.type &&
            effect.payload.action.payload.mode === CREATION_MODE_INSERTION
        );

        // Should have 2 recursive actions
        expect(recursiveActions).toHaveLength(2);

        // First recursion: pack routes to right child (stack) with adjusted index
        const firstRecursion = recursiveActions[0].payload.action.payload;
        expect(firstRecursion.mode).toBe(CREATION_MODE_INSERTION);
        expect(firstRecursion.columnLocations).toHaveLength(1);
        expect(firstRecursion.columnLocations[0]).toEqual({
          parentId: stackOperation.id,
          index: 2, // Adjusted: 4 - 2 = 2
        });

        // Second recursion: stack distributes to both children
        const secondRecursion = recursiveActions[1].payload.action.payload;
        expect(secondRecursion.mode).toBe(CREATION_MODE_INSERTION);
        expect(secondRecursion.columnLocations).toHaveLength(2);
        expect(secondRecursion.columnLocations).toEqual([
          { parentId: "t2", index: 2 },
          { parentId: "t3", index: 2 },
        ]);
      });
    });
  });

  describe("handling createTablesSuccess actions", () => {
    it("dispatches createColumnsRequest for each created table", async () => {
      const table1 = { id: "t1", databaseName: "db1", columnIds: ["c1", "c2"] };
      const table2 = { id: "t2", databaseName: "db2", columnIds: ["c3"] };

      const action = createTablesSuccess({ tableIds: [table1.id, table2.id] });

      const { effects } = await expectSaga(createColumnsWatcher)
        .provide([
          [
            matchers.select.selector(selectTablesById),
            (state, ids) => {
              if (Array.isArray(ids)) {
                return ids.map((id) => (id === table1.id ? table1 : table2));
              }
              return ids === table1.id ? table1 : table2;
            },
          ],
          [matchers.call.fn(createColumnsWorker), undefined],
        ])
        .withState({
          tables: {
            byId: {
              [table1.id]: table1,
              [table2.id]: table2,
            },
          },
        })
        .dispatch(action)
        .silentRun(100);

      const createColumnsActions = effects.put.filter(
        (effect) => effect.payload?.action?.type === createColumnsRequest.type
      );

      expect(createColumnsActions).toHaveLength(2);

      // Verify first table's columns creation
      expect(createColumnsActions[0].payload.action.payload).toEqual({
        columnLocations: [
          {
            parentId: table1.id,
            parentDatabaseName: table1.databaseName,
            index: 0,
          },
          {
            parentId: table1.id,
            parentDatabaseName: table1.databaseName,
            index: 1,
          },
        ],
      });

      // Verify second table's columns creation
      expect(createColumnsActions[1].payload.action.payload).toEqual({
        columnLocations: [
          {
            parentId: table2.id,
            parentDatabaseName: table2.databaseName,
            index: 0,
          },
        ],
      });
    });
  });

  describe("handling updateOperationsSuccess actions", () => {
    it("dispatches createColumnsRequest when operations are materialized", async () => {
      const operation1 = Operation({
        id: "op1",
        databaseName: "op_db1",
        columnIds: ["c1", "c2", "c3"],
        isMaterialized: true,
      });
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operation1.id]: ["isMaterialized"],
        },
      });

      const { effects } = await expectSaga(createColumnsWatcher)
        .provide([
          [
            matchers.select.selector(selectOperationsById),
            (state, id) => (id === operation1.id ? operation1 : null),
          ],
          [matchers.call.fn(createColumnsWorker), undefined],
        ])
        .withState({
          operations: {
            byId: {
              [operation1.id]: operation1,
            },
          },
        })
        .dispatch(action)
        .silentRun(100);

      const createColumnsActions = effects.put.filter(
        (effect) => effect.payload?.action?.type === createColumnsRequest.type
      );

      expect(createColumnsActions).toHaveLength(1);

      // Verify operation's columns creation
      expect(createColumnsActions[0].payload.action.payload).toEqual({
        columnLocations: [
          {
            parentId: operation1.id,
            parentDatabaseName: operation1.databaseName,
            index: 0,
          },
          {
            parentId: operation1.id,
            parentDatabaseName: operation1.databaseName,
            index: 1,
          },
          {
            parentId: operation1.id,
            parentDatabaseName: operation1.databaseName,
            index: 2,
          },
        ],
        mode: CREATION_MODE_INITIALIZATION,
      });
    });
    it("does not dispatch createColumnsRequest when operations are not materialized", async () => {
      const operation1 = Operation({
        id: "op1",
        databaseName: "op_db1",
        columnIds: ["c1", "c2", "c3"],
        isMaterialized: false,
      });
      const action = updateOperationsSuccess({
        changedPropertiesById: {
          [operation1.id]: ["someOtherProperty"],
        },
      });

      const { effects } = await expectSaga(createColumnsWatcher)
        .provide([
          [
            matchers.select.selector(selectOperationsById),
            (state, id) => (id === operation1.id ? operation1 : null),
          ],
          [matchers.call.fn(createColumnsWorker), undefined],
        ])
        .withState({
          operations: {
            byId: {
              [operation1.id]: operation1,
            },
          },
        })
        .dispatch(action)
        .silentRun(100);

      const createColumnsActions =
        effects.put?.filter(
          (effect) => effect.payload?.action?.type === createColumnsRequest.type
        ) || [];

      expect(createColumnsActions).toHaveLength(0);
    });
  });
});
