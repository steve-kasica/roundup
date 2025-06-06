import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import * as operationsSlice from "../slices/operationsSlice";
import { addTableToSchemaSagaWorker } from "./addTableToSchemaSaga";

vi.mock("../slices/operationsSlice");

const tableId = "table-1";
const operationType = "UNION";
const rootOperationId = "root-1";

function runSagaWorker(action) {
  const dispatched = [];
  const fakePut = (effect) => dispatched.push(effect);
  const fakeSelect = (selector) => selector({});
  // Patch effects for test
  const gen = addTableToSchemaSagaWorker(action);
  let result = gen.next();
  while (!result.done) {
    if (result.value && result.value.type === "PUT") {
      fakePut(result.value.payload.action);
      result = gen.next();
    } else if (result.value && result.value.type === "SELECT") {
      // Simulate select effect
      const selector = result.value.payload.selector;
      const selectArg =
        result.value.payload.args && result.value.payload.args[0];
      result = gen.next(selector ? selector(selectArg) : undefined);
    } else {
      result = gen.next();
    }
  }
  return dispatched;
}

// Mock action creators to return valid actions
beforeAll(() => {
  vi.spyOn(operationsSlice, "addOperation").mockImplementation((payload) => ({
    type: operationsSlice.addOperation.type,
    payload,
  }));
  vi.spyOn(operationsSlice, "changeOperationType").mockImplementation(
    (payload) => ({ type: operationsSlice.changeOperationType.type, payload })
  );
  vi.spyOn(operationsSlice, "addChildToOperation").mockImplementation(
    (payload) => ({ type: operationsSlice.addChildToOperation.type, payload })
  );
  // OPERATION_TYPE_NO_OP is a constant, so just use the value in your tests
});

describe("addTableToSchemaSagaWorker", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with NO_OP if no root operation", () => {
    operationsSlice.selectRootOperation.mockReturnValue(undefined);
    const dispatched = runSagaWorker({ payload: { tableId, operationType } });
    expect(dispatched).toContainEqual(
      expect.objectContaining({
        type: operationsSlice.addOperation.type,
        payload: {
          operationType: operationsSlice.OPERATION_TYPE_NO_OP,
          childId: tableId,
        },
      })
    );
  });

  it("should change root operation type and add child if root is NO_OP", () => {
    operationsSlice.selectRootOperation.mockReturnValue(rootOperationId);
    operationsSlice.selectOperation.mockReturnValue({
      id: rootOperationId,
      operationType: operationsSlice.OPERATION_TYPE_NO_OP,
    });
    const dispatched = runSagaWorker({ payload: { tableId, operationType } });
    expect(dispatched).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: operationsSlice.changeOperationType.type,
          payload: { operationId: rootOperationId, operationType },
        }),
        expect.objectContaining({
          type: operationsSlice.addChildToOperation.type,
          payload: { operationId: rootOperationId, childId: tableId },
        }),
      ])
    );
  });

  it("should add child if root operation type matches", () => {
    operationsSlice.selectRootOperation.mockReturnValue(rootOperationId);
    operationsSlice.selectOperation.mockReturnValue({
      id: rootOperationId,
      operationType,
    });
    const dispatched = runSagaWorker({ payload: { tableId, operationType } });
    expect(dispatched).toContainEqual(
      expect.objectContaining({
        type: operationsSlice.addChildToOperation.type,
        payload: { operationId: rootOperationId, tableId },
      })
    );
  });

  it("should create a new operation if root operation type differs", () => {
    operationsSlice.selectRootOperation.mockReturnValue(rootOperationId);
    operationsSlice.selectOperation.mockReturnValue({
      id: rootOperationId,
      operationType: "DIFFERENT_TYPE",
    });
    const dispatched = runSagaWorker({ payload: { tableId, operationType } });
    expect(dispatched).toContainEqual(
      expect.objectContaining({
        type: operationsSlice.addOperation.type,
        payload: { operationType, tableId },
      })
    );
  });
});
