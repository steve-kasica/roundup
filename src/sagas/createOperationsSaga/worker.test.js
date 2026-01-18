import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import createOperationsWorker from "./worker";
import {
  addOperations as addOperationsToSlice,
  updateOperations as updateOperationsSlice,
} from "../../slices/operationsSlice";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
import { setFocusedObjectId } from "../../slices/uiSlice";
import { createOperationsSuccess } from "./actions";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice/Operation";

// Mock generateUUID to return predictable values
vi.mock("../../lib/utilities/generateUUID", () => ({
  default: vi.fn((prefix) => `${prefix}mock-uuid`),
}));

describe("createOperationsWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("creating a single operation", () => {
    it("creates a PACK operation with table children", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "t_2"],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      // Verify addOperations was called
      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations).toHaveLength(1);
      expect(operations[0]).toMatchObject({
        operationType: OPERATION_TYPE_PACK,
        childIds: ["t_1", "t_2"],
      });

      // Verify updateTables was called with parent IDs
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();
      expect(updateTablesAction.payload.action.payload).toHaveLength(2);
      expect(updateTablesAction.payload.action.payload[0]).toMatchObject({
        id: "t_1",
        parentId: operations[0].id,
      });
      expect(updateTablesAction.payload.action.payload[1]).toMatchObject({
        id: "t_2",
        parentId: operations[0].id,
      });
    });

    it("creates a STACK operation with table children", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_STACK,
            childIds: ["t_1", "t_2", "t_3"],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations[0]).toMatchObject({
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t_1", "t_2", "t_3"],
      });
    });
  });

  describe("creating operations with operation children", () => {
    it("updates operation parentId for operation children", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["o_1", "o_2"],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      // Verify updateOperations was called for operation children
      const updateOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSlice.type
      );
      expect(updateOperationsAction).toBeDefined();
      expect(updateOperationsAction.payload.action.payload).toHaveLength(2);
      expect(updateOperationsAction.payload.action.payload[0].id).toBe("o_1");
      expect(updateOperationsAction.payload.action.payload[1].id).toBe("o_2");
    });

    it("handles mixed table and operation children", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "o_1"],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      // Verify updateTables was called for table child
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();
      expect(updateTablesAction.payload.action.payload).toHaveLength(1);
      expect(updateTablesAction.payload.action.payload[0].id).toBe("t_1");

      // Verify updateOperations was called for operation child
      const updateOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSlice.type
      );
      expect(updateOperationsAction).toBeDefined();
      expect(updateOperationsAction.payload.action.payload).toHaveLength(1);
      expect(updateOperationsAction.payload.action.payload[0].id).toBe("o_1");
    });
  });

  describe("creating multiple operations", () => {
    it("creates multiple operations in a single call", async () => {
      const action = {
        payload: {
          operationData: [
            {
              operationType: OPERATION_TYPE_PACK,
              childIds: ["t_1", "t_2"],
            },
            {
              operationType: OPERATION_TYPE_STACK,
              childIds: ["t_3", "t_4"],
            },
          ],
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations).toHaveLength(2);
      expect(operations[0].operationType).toBe(OPERATION_TYPE_PACK);
      expect(operations[1].operationType).toBe(OPERATION_TYPE_STACK);
    });
  });

  describe("UI state updates", () => {
    it("sets focusedObjectId to the last created operation", async () => {
      const action = {
        payload: {
          operationData: [
            {
              operationType: OPERATION_TYPE_PACK,
              childIds: ["t_1", "t_2"],
            },
            {
              operationType: OPERATION_TYPE_STACK,
              childIds: ["t_3", "t_4"],
            },
          ],
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      // Find the addOperations action to get the created operations
      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      const operations = addOperationsAction.payload.action.payload;
      const lastOperationId = operations[operations.length - 1].id;

      // Verify setFocusedObjectId was called with the last operation's ID
      const setFocusedAction = effects.put.find(
        (effect) => effect.payload.action.type === setFocusedObjectId.type
      );
      expect(setFocusedAction).toBeDefined();
      expect(setFocusedAction.payload.action.payload).toBe(lastOperationId);
    });
    it("sets focusedObjectId to table child for NO_OP operation", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_NO_OP,
            childIds: ["t_42"],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      // Verify setFocusedObjectId was called with the table child's ID
      const setFocusedAction = effects.put.find(
        (effect) => effect.payload.action.type === setFocusedObjectId.type
      );
      expect(setFocusedAction).toBeDefined();
      expect(setFocusedAction.payload.action.payload).toBe("t_42");
    });
  });

  describe("success action", () => {
    it("dispatches createOperationsSuccess with created operation IDs", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "t_2"],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === createOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload).toHaveProperty(
        "operationIds"
      );
      expect(successAction.payload.action.payload.operationIds).toHaveLength(1);
    });

    it("includes all created operation IDs in success payload", async () => {
      const action = {
        payload: {
          operationData: [
            {
              operationType: OPERATION_TYPE_PACK,
              childIds: ["t_1", "t_2"],
            },
            {
              operationType: OPERATION_TYPE_STACK,
              childIds: ["t_3", "t_4"],
            },
          ],
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === createOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toHaveLength(2);
    });
  });

  describe("edge cases", () => {
    it("handles empty childIds array", async () => {
      const action = {
        payload: {
          operationData: {
            operationType: OPERATION_TYPE_PACK,
            childIds: [],
          },
        },
      };

      const { effects } = await expectSaga(
        createOperationsWorker,
        action
      ).run();

      // Operation should still be created
      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      expect(addOperationsAction).toBeDefined();

      // But no table or operation updates should happen
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction.payload.action.payload).toHaveLength(0);
    });
  });
});
